import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as mailjet from 'node-mailjet';
import { ConfigService } from '@nestjs/config';
import { ErrorsService } from '../errors/errors.service';
import { EmailTypes } from './enums/email-types.enum';
import { Model, Types } from 'mongoose';
import { EmailSubjects } from './enums/email-subjects.enum';
import { Email, EmailDocument } from './models/email.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateEmailDTO } from './dtos/email.dto';
import {
  getCreateOrderHTML,
  getErrorsEmailHTML,
  getOrderPaymentReminderHTML,
  getPayedOrderHTML,
  getShippedOrderHTML,
} from './templates/emails.template';
import { OrderDocument } from '../orders/models/order.schema';
import { get } from 'lodash';
import { EmailStatuses } from './enums/email-statuses.enum';
import { EmailRecipient } from './interfaces/email-recipient.interface.';
import { EmailEvent, EmailEventDocument } from './models/email-event.schema';
import { CreateEmailEventDTO } from './dtos/email-event.dto';
import { EmailEventNotificationDTO } from './dtos/email-event-notification.dto';
import { fromUnixTime } from 'date-fns';
import {
  ProductAvailableNotification,
  ProductAvailableNotificationDocument,
} from './models/product-available-notification.schema';
import { CreateProductAvailableNotificationDTO } from './dtos/product-available-notification.dto';
import { ProductsService } from '../products/products.service';
import { AppErrorDocument } from '../errors/models/app-error.schema';
import { UserDocument } from '../users/models/user.schema';

@Injectable()
export class EmailsService {
  private mailJetClient: mailjet.Email.Client;
  constructor(
    @InjectModel(Email.name)
    private emailsModel: Model<EmailDocument>,
    @InjectModel(EmailEvent.name)
    private emailEventsModel: Model<EmailEventDocument>,
    @InjectModel(ProductAvailableNotification.name)
    private productAvailableNotificationsModel: Model<ProductAvailableNotificationDocument>,
    private configService: ConfigService,
    private errorsService: ErrorsService,
    private productsService: ProductsService,
  ) {
    try {
      this.mailJetClient = mailjet.connect(
        this.configService.get('MJ_APIKEY_PUBLIC'),
        this.configService.get('MJ_APIKEY_PRIVATE'),
      );

    } catch (error) {
      console.log(error);
      // Log error into DB - not await
      this.errorsService.createAppError(
        null,
        'EmailsService.constructor',
        error,
        null,
      );
      throw new InternalServerErrorException('Erro ao inicializar EmailsService.');
    }
  }

  async sendOrderEmail(
    order: OrderDocument,
    type: EmailTypes,
  ): Promise<void> {
    const recipients: EmailRecipient[] = [{
      email: order.user.email,
      name: order.user.name,
      user: get(order, 'user._id', null), // GAMB
    }];
    const createEmailDTO: CreateEmailDTO = {
      recipients,
      type,
      relatedTo: order._id,
    };

    const newEmail = await this.createEmail(createEmailDTO);
    const sendParamsMessage = this.setupSendEmailParams(newEmail);
    const orderEmailHTML = this.getOrderEmailHTML(newEmail, order);
    sendParamsMessage.Messages[0].HTMLPart = orderEmailHTML;
    newEmail.status = await this.sendEmail(sendParamsMessage);

    try {
      await newEmail.save();

    } catch (error) {
      console.log(error);
      // Log error into DB - not await
      this.errorsService.createAppError(
        null,
        'EmailsService.sendNewOrderEmail',
        error,
        newEmail,
      );
    }
  }

  async sendErrorsEmail(
    errors: AppErrorDocument[],
    admins: UserDocument[],
  ): Promise<void> {
    const recipients: EmailRecipient[] = [];

    admins.forEach((admin) => {
      recipients.push({
        email: admin.email,
        name: admin.name ?? null,
        user: admin._id ?? null,
      });
    });

    const createEmailDTO: CreateEmailDTO = {
      recipients,
      type: EmailTypes.NEW_ERRORS,
      relatedTo: null,
    };

    const newEmail = await this.createEmail(createEmailDTO);
    const sendParamsMessage = this.setupSendEmailParams(newEmail);
    const errorsEmailHTML = getErrorsEmailHTML(errors);
    sendParamsMessage.Messages[0].HTMLPart = errorsEmailHTML;
    newEmail.status = await this.sendEmail(sendParamsMessage);

    try {
      await newEmail.save();

    } catch (error) {
      console.log(error);
      // Log error into DB - not await
      this.errorsService.createAppError(
        null,
        'EmailsService.sendErrorsEmail',
        error,
        newEmail,
      );
    }
  }

  async createProductAvailableNotification(
    createProductAvailableNotificationDTO: CreateProductAvailableNotificationDTO,
  ): Promise<void> {
    const { email, product } = createProductAvailableNotificationDTO;

    const foundProduct = await this.productsService.getProductById(product);

    const newProductAvailableNotification =
      new this.productAvailableNotificationsModel({
        recipient: email,
        product: foundProduct,
      });

    try {
      await newProductAvailableNotification.save();

    } catch (error) {
      console.log(error);
      // Log error into DB - not await
      this.errorsService.createAppError(
        null,
        'EmailsService.createProductAvailableNotification',
        error,
        newProductAvailableNotification,
      );
    }
  }

  async createEmail(createEmailDTO: CreateEmailDTO): Promise<EmailDocument> {
    const newEmail = new this.emailsModel(createEmailDTO);
    try {
      return await newEmail.save();

    } catch (error) {
      console.log(error);
      // Log error into DB - not await
      this.errorsService.createAppError(
        null,
        'EmailsService.createEmail',
        error,
        newEmail,
      );
    }
  }

  setupSendEmailParams(email: EmailDocument): mailjet.Email.SendParams {

    const recipients: mailjet.Email.SendParamsRecipient[] = [];

    email.recipients.forEach((recipient) => {
      recipients.push({
        Email: recipient.email,
        Name: get(recipient, 'name', ''),
      });
    });

    const sendParamsMessage: mailjet.Email.SendParams = {
      Messages: [
        {
          From: {
            Email: this.configService.get('MJ_FROM_EMAIL'),
            Name: this.configService.get('MJ_FROM_NAME'),
          },
          To: recipients,
          Subject: EmailSubjects[email.type],
          // TextPart: `Email enviado automaticamente por ${this.configService.get('APP_NAME')}`,
          // HTMLPart: html,
          CustomID: email._id,
        },
      ],
    };

    return sendParamsMessage;
  }

  getOrderEmailHTML(email: EmailDocument, order: OrderDocument): string {
    // TODO OTHER ORDER TEMPLATES
    if (email.type === EmailTypes.ORDER_CREATE) {
      return getCreateOrderHTML(order);
    } else if (email.type === EmailTypes.ORDER_PAYED) {
      return getPayedOrderHTML(order);
    } else if (email.type === EmailTypes.ORDER_SHIPPED) {
      // TODO - A Order tem que vir com o Shipment populated
      return getShippedOrderHTML(order);
    } else if (email.type === EmailTypes.ORDER_PAYMENT_REMINDER) {
      return getOrderPaymentReminderHTML(
        order,
        this.configService.get('APP_URL'),
      );
    }
  }

  async sendEmail(
    sendParams: mailjet.Email.SendParams,
  ): Promise<EmailStatuses> {
    try {
      const response = await this.mailJetClient
        .post('send', { version: 'v3.1' })
        .request(sendParams);
      // Considerando que está sendo enviada apenas uma mensagem
      const result = get(
        response,
        'body.Messages[0].Status',
        EmailStatuses.error,
      );
      return result;

    } catch (error) {
      console.log(error);
      //
      let err = get(error, 'response.body.Messages[0].Errors[0]', null);
      if(!err) {
        err = get(error, 'response.error', null);
      }
      // Log error into DB - not await
      this.errorsService.createAppError(
        null,
        'EmailsService.sendMail',
        err ? err : error,
        sendParams,
      );
      return EmailStatuses.error;
    }
  }

  async createEmailEvents(
    createEmailEventsDTO: CreateEmailEventDTO[],
  ): Promise<void> {
    try {
      await this.emailEventsModel.insertMany(createEmailEventsDTO);
    } catch (error) {
      console.log(error);
      // Log error into DB - not await
      this.errorsService.createAppError(
        null,
        'EmailsService.createEmailEvents',
        error,
        createEmailEventsDTO,
      );
    }
  }

  async emailEventsNotificationWebHook(
    emailEventsNotificationDTO: EmailEventNotificationDTO[],
  ): Promise<void> {
    // emailEventsNotificationDTO.forEach((emailEvent) => console.log(emailEvent));
    const createEmailEventsDTO: CreateEmailEventDTO[] = [];

    emailEventsNotificationDTO.forEach((emailEvent) => {
      createEmailEventsDTO.push({
        emailID: Types.ObjectId(emailEvent.CustomID),
        event: emailEvent.event,
        time: fromUnixTime(emailEvent.time),
        email: emailEvent.email,
        mjCampaignId: emailEvent.mj_campaign_id
          ? emailEvent.mj_campaign_id
          : undefined,
        mjContactID: emailEvent.mj_contact_id,
        customCampaign: emailEvent.customcampaign
          ? emailEvent.customcampaign
          : undefined,
        messageID: emailEvent.MessageID,
        messageGUID: emailEvent.Message_GUID,
        payload: emailEvent.Payload ? emailEvent.Payload : undefined,
        mjMessageID: emailEvent.mj_message_id,
        smtpReply: emailEvent.smtp_reply,
        ip: emailEvent.ip,
        geo: emailEvent.geo,
        agent: emailEvent.agent,
        url: emailEvent.url,
        blocked: emailEvent.blocked,
        hardBounce: emailEvent.hard_bounce,
        errorRelatedTo: emailEvent.error_related_to,
        error: emailEvent.error,
        comment: emailEvent.comment,
        source: emailEvent.source,
        mjListID: emailEvent.mj_list_id,
      });
    });

    await this.createEmailEvents(createEmailEventsDTO);
  }

}
