import { Injectable } from '@nestjs/common';
import * as mailjet from 'node-mailjet';
import { ConfigService } from '@nestjs/config';
import { ErrorsService } from '../errors/errors.service';
import { MailTypes } from './enums/mail-types.enum';
import { Model } from 'mongoose';
import { MailSubjects } from './enums/mail-subjects.enum';
import { Email, EmailDocument } from './models/email.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateEmailDTO } from './dtos/email.dto';
import { getCreateOrderHTML } from './templates/emails.template';
import { OrderDocument } from '../orders/models/order.schema';
import { get } from 'lodash';
import { MailStatuses } from './enums/mail-statuses.enum';

@Injectable()
export class EmailsService {
  private mailJetClient: mailjet.Email.Client;
  constructor(
    @InjectModel(Email.name) private emailsModel: Model<EmailDocument>,
    private configService: ConfigService,
    private errorsService: ErrorsService,
  ) {
    this.mailJetClient = mailjet.connect(
      this.configService.get('MJ_APIKEY_PUBLIC'),
      this.configService.get('MJ_APIKEY_PRIVATE'),
    );
  }

  async sendNewOrderEmail(order: OrderDocument): Promise<void> {

    const createEmailDTO: CreateEmailDTO = {
      recipient: order.user,
      type: MailTypes.ORDER_CREATE,
      relatedTo: order._id,
    };

    const newEmail = await this.createEmail(createEmailDTO);
    const sendParamsMessage = this.setupSendEmailParams(newEmail);
    const orderEmailHTML = this.getOrderEmailHTML(newEmail, order);
    sendParamsMessage.Messages[0].HTMLPart = orderEmailHTML;
    await this.sendEmail(sendParamsMessage);

    // TOTO - ATUALIZAR STATUS QUANDO RECEBER O WEBHOOK
  }

  async createEmail(createEmailDTO: CreateEmailDTO): Promise<EmailDocument> {
    const newEmail = new this.emailsModel(createEmailDTO);
    try {
      return await newEmail.save();
    } catch(error) {
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
    // const html = this.getEmailHTMLbyType(email.type, document);
    const sendParamsMessage: mailjet.Email.SendParams = {
      Messages: [
        {
          From: {
            Email: this.configService.get('MJ_FROM_EMAIL'),
            Name: this.configService.get('MJ_FROM_NAME'),
          },
          To: [
            {
              Email: email.recipient.email,
              Name: email.recipient.name,
            },
          ],
          Subject: MailSubjects[email.type],
          // TODO - TEXT PART?
          TextPart: `Email enviado automaticamente por ${this.configService.get('APP_NAME')}`,
          // HTMLPart: html,
          CustomID: email._id,
        },
      ],
    }

    return sendParamsMessage;
  }

  getOrderEmailHTML(
    email: EmailDocument,
    order: OrderDocument,
  ): string {
    // TODO
    if(email.type === MailTypes.ORDER_CREATE) {
      // console.log(getCreateOrderHTML(order));
      return getCreateOrderHTML(order);
    }
    // todo
    // return `<h3>Dear passenger 1, welcome to <a href='https://www.mailjet.com/'>Mailjet</a>!</h3><br />May the delivery force be with you!`;
  }

  async sendEmail(sendParams: mailjet.Email.SendParams): Promise<void> {

    try {
      await this.mailJetClient.post('send', { version: 'v3.1' }).request(sendParams);

    } catch(error) {
      console.log(error);
      // Log error into DB - not await
      this.errorsService.createAppError(
        null,
        'EmailsService.sendMail',
        error,
        sendParams,
      );
    }
  }

}
