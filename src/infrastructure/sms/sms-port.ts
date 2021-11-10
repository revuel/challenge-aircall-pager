import {SmsNotification} from '../../domain/value-objects/sms-notification';


export interface SmsPort {
    sendSMS(smsNotification: SmsNotification);
}
