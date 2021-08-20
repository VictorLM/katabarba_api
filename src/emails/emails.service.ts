import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
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
  getOrderPaymentConflictEmailHTML,
  getOrderPaymentReminderHTML,
  getPasswordResetEmailHTML,
  getPayedOrderHTML,
  getProductAvailableNotificationEmailHTML,
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
import {
  CreateProductAvailableNotificationDTO,
} from './dtos/product-available-notification.dto';
import { ProductsService } from '../products/products.service';
import { AppErrorDocument } from '../errors/models/app-error.schema';
import { User, UserDocument } from '../users/models/user.schema';
import { PasswordResetTokenDocument } from '../auth/models/password-reset-token.schema';

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
      throw new InternalServerErrorException(
        'Erro ao inicializar EmailsService.',
      );
    }
  }

  async getEmailsWithErrors(): Promise<EmailDocument[]> {
    return await this.emailsModel.find({
      status: EmailStatuses.error,
      resend: { $ne: null}, // TODO - SET MANUALLY VIA PANEL AFTER ADMIN CHECK
    });
  }

  buildSendEmailParams(
    email: EmailDocument,
    document: any,
  ): mailjet.Email.SendParams {
    const recipients: mailjet.Email.SendParamsRecipient[] = [];
    email.recipients.forEach((recipient) => {
      recipients.push({
        Email: recipient.email,
        Name: get(recipient, 'name', ''),
      });
    });

    let html = '';
    if (
      email.type === EmailTypes.ORDER_CREATE ||
      email.type === EmailTypes.ORDER_PAYED ||
      email.type === EmailTypes.ORDER_SHIPPED ||
      email.type === EmailTypes.ORDER_PAYMENT_REMINDER
    ) {
      html = this.getOrderEmailHTML(email, document);
    } else if (email.type === EmailTypes.PRODUCT_AVAILABLE) {
      html = getProductAvailableNotificationEmailHTML(
        document,
        this.configService.get('APP_URL'),
      );
    } else if (email.type === EmailTypes.NEW_ERRORS) {
      html = getErrorsEmailHTML(document);
    } else if (email.type === EmailTypes.ORDER_PAYMENT_VALUE_CONFLICT) {
      html = getOrderPaymentConflictEmailHTML(document);
    } else if (email.type === EmailTypes.USER_PASSWORD_RESET) {
        html = getPasswordResetEmailHTML(document, this.configService.get('APP_URL'));
    } else {
      throw new InternalServerErrorException('Tipo de e-mail inválido');
    }

    if(!html) {
      throw new InternalServerErrorException('Erro ao montar template HTML para e-mail');
    }
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
          HTMLPart: html,
          CustomID: email._id,
        },
      ],
    };
    return sendParamsMessage;
  }

  getOrderEmailHTML(email: EmailDocument, order: OrderDocument): string {
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

  buildRecipientsArray(
    recipients: UserDocument[] | User[] | string,
  ): EmailRecipient[] {
    const recipientsArray: EmailRecipient[] = [];

    if(typeof recipients === 'string') {
      recipientsArray.push({
        email: recipients,
        name: null,
        user: null,
      });

    } else {
      recipients.forEach((recipient) => {
        recipientsArray.push({
          email: recipient.email,
          name: get(recipient, 'name', null),
          user: get(recipient, '_id', null),
        });
      });
    }
    return recipientsArray;
  }

  async newEmail(
    recipients: EmailRecipient[],
    type: EmailTypes,
    relatedTo: Types.ObjectId | null,
  ): Promise<EmailDocument> {
    const createEmailDTO: CreateEmailDTO = {
      recipients,
      type,
      relatedTo,
    };
    return await this.createEmail(createEmailDTO);
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

  async sendOrderEmail(
    // User populated
    order: OrderDocument,
    type: EmailTypes,
  ): Promise<void> {
    const recipients = this.buildRecipientsArray([order.user]);
    const newEmail = await this.newEmail(recipients, type, order._id);
    const sendParamsMessage = this.buildSendEmailParams(newEmail, order);
    newEmail.status = await this.sendEmail(sendParamsMessage);
    try {
      await newEmail.save();

    } catch (error) {
      console.log(error);
      // Log error into DB - not await
      this.errorsService.createAppError(
        null,
        'EmailsService.sendOrderEmail',
        error,
        newEmail,
      );
    }
  }

  async sendErrorsEmail(
    errors: AppErrorDocument[],
    admins: UserDocument[],
  ): Promise<void> {
    const recipients = this.buildRecipientsArray(admins);
    const newEmail = await this.newEmail(recipients, EmailTypes.NEW_ERRORS, null);
    const sendParamsMessage = this.buildSendEmailParams(newEmail, errors);
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

  async sendOrderPaymentConflictsEmail(
    // Payment populated
    payedOrdersWithConflict: OrderDocument[],
    admins: UserDocument[],
  ): Promise<void> {
    const recipients = this.buildRecipientsArray(admins);
    const newEmail = await this.newEmail(recipients, EmailTypes.ORDER_PAYMENT_VALUE_CONFLICT, null);
    const sendParamsMessage = this.buildSendEmailParams(newEmail, payedOrdersWithConflict);
    newEmail.status = await this.sendEmail(sendParamsMessage);
    try {
      await newEmail.save();

    } catch (error) {
      console.log(error);
      // Log error into DB - not await
      this.errorsService.createAppError(
        null,
        'EmailsService.sendOrderPaymentConflictsEmail',
        error,
        newEmail,
      );
    }
  }

  async sendProductAvailableNotificationsEmail(
    // Product populated
    productAvailableNotification: ProductAvailableNotificationDocument,
  ): Promise<EmailDocument> {
    const recipients = this.buildRecipientsArray(productAvailableNotification.recipient);
    const newEmail = await this.newEmail(
      recipients,
      EmailTypes.PRODUCT_AVAILABLE,
      productAvailableNotification._id,
    );
    const sendParamsMessage = this.buildSendEmailParams(newEmail, productAvailableNotification);
    newEmail.status = await this.sendEmail(sendParamsMessage);
    try {
      return await newEmail.save();

    } catch (error) {
      console.log(error);
      // Log error into DB - not await
      this.errorsService.createAppError(
        null,
        'EmailsService.sendProductAvailableNotificationsEmail',
        error,
        newEmail,
      );
    }
  }

  async sendPasswordResetEmail(
    // User populated
    passwordResetTokenDocument: PasswordResetTokenDocument,
  ): Promise<EmailDocument> {
    const recipients = this.buildRecipientsArray([passwordResetTokenDocument.user]);
    const newEmail = await this.newEmail(
      recipients,
      EmailTypes.USER_PASSWORD_RESET,
      passwordResetTokenDocument._id,
    );
    const sendParamsMessage = this.buildSendEmailParams(newEmail, passwordResetTokenDocument);
    newEmail.status = await this.sendEmail(sendParamsMessage);
    try {
      return await newEmail.save();

    } catch (error) {
      console.log(error);
      // Log error into DB - not await
      this.errorsService.createAppError(
        null,
        'EmailsService.sendPasswordResetEmail',
        error,
        newEmail,
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
      if (!err) {
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

  async resendFailedOrderEmail(
    email: EmailDocument,
    // User populated
    order: OrderDocument,
  ): Promise<void> {
    const sendParamsMessage = this.buildSendEmailParams(email, order);
    email.status = await this.sendEmail(sendParamsMessage);
    email.resend = null;
    try {
      await email.save();

    } catch (error) {
      console.log(error);
      // Log error into DB - not await
      this.errorsService.createAppError(
        null,
        'EmailsService.resendFailedOrderEmail',
        error,
        email,
      );
    }
  }

  // async resendEmailWithError(
  //   email: EmailDocument,
  // ): Promise<EmailDocument> {

  //   if (
  //     email.type === EmailTypes.ORDER_CREATE ||
  //     email.type === EmailTypes.ORDER_PAYED ||
  //     email.type === EmailTypes.ORDER_SHIPPED ||
  //     email.type === EmailTypes.ORDER_PAYMENT_REMINDER
  //   ) {
  //     const document = await this.orders
  //   } else if (email.type === EmailTypes.PRODUCT_AVAILABLE) {
  //     html = getProductAvailableNotificationEmailHTML(
  //       document,
  //       this.configService.get('APP_URL'),
  //     );
  //   } else if (email.type === EmailTypes.NEW_ERRORS) {
  //     html = getErrorsEmailHTML(document);
  //   } else if (email.type === EmailTypes.ORDER_PAYMENT_VALUE_CONFLICT) {
  //     html = getOrderPaymentConflictEmailHTML(document);
  //   } else if (email.type === EmailTypes.USER_PASSWORD_RESET) {
  //       html = getPasswordResetEmailHTML(document, this.configService.get('APP_URL'));
  //   } else {
  //     const document = null;
  //   }

  //   const sendParamsMessage = this.buildSendEmailParams(email, document);

  //   email.status = await this.sendEmail(sendParamsMessage);
  //   try {
  //     return await email.save();

  //   } catch (error) {
  //     console.log(error);
  //     // Log error into DB - not await
  //     this.errorsService.createAppError(
  //       null,
  //       'EmailsService.sendPasswordResetEmail',
  //       error,
  //       email,
  //     );
  //   }
  // }

  // TODO - MOVER PARA PRODUTOS SERVICE?
  async getNotSentProductAvailableNotifications(): Promise<
  ProductAvailableNotificationDocument[]
  > {
    return await this.productAvailableNotificationsModel
      .find({ email: null })
      .populate('product');
  }

  // TODO - MOVER PARA PRODUCTS SERVICE?
  async createProductAvailableNotification(
    createProductAvailableNotificationDTO: CreateProductAvailableNotificationDTO,
  ): Promise<void> {
    const { email, product } = createProductAvailableNotificationDTO;

    const foundProduct = await this.productsService.getProductById(product);

    const foundNotification = await this.productAvailableNotificationsModel.findOne({
      email: null,
      recipient: email,
      product: foundProduct,
    });

    if(foundNotification) {
      throw new ConflictException('Já existe uma Notificação cadastrada para esse e-mail referente a esse Produto');
    }

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

}
