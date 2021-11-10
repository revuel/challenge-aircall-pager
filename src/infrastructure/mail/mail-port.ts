import {EmailNotification} from '../../domain/value-objects/email-notification';


export interface MailPort {
    sendMail(emailNotification: EmailNotification);
}
