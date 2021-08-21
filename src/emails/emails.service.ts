import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import * as mailjet from 'node-mailjet';
import { ConfigService } from '@nestjs/config';
import { ErrorsService } from '../errors/errors.service';
import { EmailTypes } from './enums/email-types.enum';
import { Model, Types } from 'mongoose';
import { EmailSubjects } from './enums/email-subjects.enum';
import { Email, EmailDocument } from './models/email.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateEmailDTO, ResendEmailDTO, SendEmailDTO } from './dtos/email.dto';
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
import { User, UserDocument } from '../users/models/user.schema';

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
      resend: { $ne: null}, // TODO - SET TO RESEND MANUALLY VIA PANEL AFTER ADMIN CHECK THE ERROR
    });
  }

  /**
   * Prepara os dados para criação de um novo Email model,
   * chama a função para efetivamente criar o novo model,
   * prepara os dados para envio da mensagem de e-mail via API,
   * chama a função para efetivamente enviar a mensagem de  e-mail,
   * atualiza o status do Email model criado (error ou success)
   * com base na resposta da API
   *
   * DocumentModel recebido como parâmetro deve vir com o relacionamento populado,
   * caso haja, para montagem do template HTML
   *
   * @param {SendEmailDTO} sendEmailDTO
   * document
   * @param {OrderDocument} document - EmailTypes: ORDER_CREATE, ORDER_PAYED, ORDER_SHIPPED, ORDER_PAYMENT_REMINDER
   * @param {OrderDocument[]} document - EmailTypes: VALUE_CONFLICT
   * @param {ProductAvailableNotification} document - EmailTypes: PRODUCT_AVAILABLE
   * @param {AppErrorDocument[]} document - EmailTypes: NEW_ERRORS
   * @param {PasswordResetTokenDocument} document - EmailTypes: USER_PASSWORD_RESET
   * type
   * @param {EmailTypes} type - Enum EmailTypes
   * recipients
   * @param {string} recipients - EmailTypes: PRODUCT_AVAILABLE
   * @param {others} recipients - EmailTypes: Todos os outros EmailTypes
   * relatedTo
   * @param {Types.ObjectId | null} relatedTo - ID do documento relacionado, caso haja (Order, Product)
  */
  async sendEmail(
    // Relation populated if exists
    sendEmailDTO: SendEmailDTO,
  ): Promise<EmailDocument> {
    const { document, type, recipients, relatedTo } = sendEmailDTO;
    const recipientsArray = this.buildRecipientsArray(recipients);
    const newEmail = await this.newEmail(recipientsArray, type, relatedTo);
    const sendParamsMessage = this.buildSendEmailParams(newEmail, document);
    newEmail.status = await this.sendEmailAPI(sendParamsMessage);

    try {
      return await newEmail.save();

    } catch (error) {
      console.log(error);
      // Log error into DB - not await
      this.errorsService.createAppError(
        null,
        'EmailsService.sendEmail',
        error,
        newEmail,
      );
    }
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

    const sendParamsMessage: mailjet.Email.SendParams = {
      Messages: [
        {
          From: {
            Email: this.configService.get('MJ_FROM_EMAIL'),
            Name: this.configService.get('MJ_FROM_NAME'),
          },
          To: recipients,
          Subject: EmailSubjects[email.type],
          // TextPart: '', // TODO
          HTMLPart: this.buildEmailHTMLTemplate(email, document),
          CustomID: email._id,
        },
      ],
    };
    return sendParamsMessage;
  }

  buildEmailHTMLTemplate(
    email: EmailDocument,
    document: any,
  ): string {
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
    } else if (email.type === EmailTypes.VALUE_CONFLICT) {
      html = getOrderPaymentConflictEmailHTML(document);
    } else if (email.type === EmailTypes.USER_PASSWORD_RESET) {
        html = getPasswordResetEmailHTML(document, this.configService.get('APP_URL'));
    } else {
      throw new InternalServerErrorException('Tipo de e-mail inválido');
    }

    if(!html) {
      throw new InternalServerErrorException('Erro ao montar template HTML para e-mail');
    }

    return html;
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
    recipients: UserDocument | UserDocument[] | User | User[] | string,
  ): EmailRecipient[] {
    const recipientsArray: EmailRecipient[] = [];

    if(typeof recipients === 'string') {
      recipientsArray.push({
        email: recipients,
        name: null,
        user: null,
      });

    } else if(Array.isArray(recipients)) {
      recipients.forEach((recipient) => {
        recipientsArray.push({
          email: recipient.email,
          name: get(recipient, 'name', null),
          user: get(recipient, '_id', null),
        });
      });

    } else {
      recipientsArray.push({
        email: recipients.email,
        name: get(recipients, 'name', null),
        user: get(recipients, '_id', null),
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

  async sendEmailAPI(
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

  /**
  * Bulk insert of EmailEvent documents into DB.
  */
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

  /**
  * Get webhook object actions.
  */
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

  async resendEmail(
    resendFailedEmailDTO: ResendEmailDTO,
  ): Promise<EmailDocument> {
    const { email, document } = resendFailedEmailDTO;

    const sendParamsMessage = this.buildSendEmailParams(email, document);
    email.status = await this.sendEmailAPI(sendParamsMessage);
    email.resend = null;

    try {
      return await email.save();

    } catch (error) {
      console.log(error);
      // Log error into DB - not await
      this.errorsService.createAppError(
        null,
        'EmailsService.resendEmail',
        error,
        email,
      );
    }
  }

  // TODO - MOVER PARA PRODUTOS SERVICE?
  async getNotSentProductAvailableNotifications(): Promise<
  ProductAvailableNotificationDocument[]
  > {
    return await this.productAvailableNotificationsModel
    .find({ email: null })
    .populate('product');
  }

  // TODO - MOVER PARA PRODUTOS SERVICE?
  async getNotSentProductAvailableNotificationById(
    id: Types.ObjectId
  ): Promise<ProductAvailableNotificationDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID "${id}" inválido`);
    }
    const foundNotification = await this.productAvailableNotificationsModel.findById(id).populate('product');
    if (!foundNotification) {
      throw new NotFoundException(`Notificação com ID "${id}" não encontrada`);
    }
    return foundNotification;
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
