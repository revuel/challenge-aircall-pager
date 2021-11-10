import { v4 as uuid4 } from 'uuid';
import {AlertingPort} from '../../presentation/alerting/alerting-port';
import {EscalationPoliciesPort} from '../../infrastructure/escalation-policies/escalation-policies-port';
import {SmsPort} from '../../infrastructure/sms/sms-port';
import {MailPort} from '../../infrastructure/mail/mail-port';
import {TimerStartPort} from '../../infrastructure/timer-start/timer-start-port';
import {PersistencePort} from '../../infrastructure/persistence/persistence-port';
import {EmailNotification} from '../value-objects/email-notification';
import {SmsNotification} from '../value-objects/sms-notification';
import {PagerServiceError} from '../pager-service-error';


/**
 * Use Case: Opens an incidence for a Monitored Service
 *
 * "The Monitored Service in case of dysfunction sends an Alert (composed of the Alert Message and the Identifier of the
 * Service) to the Alerting Service (the alerts central place). Those alerts are forwarded to the Pager Service (3).
 * Then this service based on the Escalation Policy of the Monitored Service (available from the EP Service (4)), sends
 * the notifications to all the Targets of the first Policy Level, by mail (5) or SMS (6). After that the service set an
 * external timer for the Acknowledgement Timeout (7)."
 */
export class OpenIncidenceService implements AlertingPort {

    private persistenceService: PersistencePort;
    private escalationPoliciesService: EscalationPoliciesPort;
    private smsService: SmsPort;
    private mailService: MailPort;
    private timerStartService: TimerStartPort;

    /**
     * DI service constructor
     * @param persistenceService Implements PersistencePort 
     * @param escalationPoliciesService Implements PersistencePort
     * @param smsService Implements SmsPort
     * @param mailService Implements MailPort
     * @param timerStartService Implements TimerStartPort
     */
    constructor(
        persistenceService: PersistencePort,
        escalationPoliciesService: EscalationPoliciesPort,
        smsService: SmsPort,
        mailService: MailPort,
        timerStartService: TimerStartPort
    ) {
        this.persistenceService = persistenceService;
        this.escalationPoliciesService = escalationPoliciesService;
        this.smsService = smsService;
        this.mailService = mailService;
        this.timerStartService = timerStartService;
    }

    /**
     * Opens an incidence (marks a monitored service as unhealthy) over a service by its uuid
     * 0) Reads Service state to determine whether is already unhealthy or not
     * If the service is in a healthy state:
     *  1) Updates Pager DB to mark a monitored service as unhealthy
     *  2) Invokes EscalationPoliciesService to retrieve the escalation policies of the dysfunctional service
     *  3) Invokes SmsService and/or MailService so they send notifications to the targets of the dysfunctional service
     *  4) Invokes TimerStartService to start the acknowledgement count down
     * If the service was already in an unhealthy state, does nothing
     * (I suppose, to prevent striking our engineers with notifications)
     * @param serviceUuid Service's UUID
     * @param alertMsg Alert message received
     */
    openIncidence(serviceUuid: uuid4, alertMsg: string): any {
        try {

        } catch (error) {
            throw new PagerServiceError(error.message)
        }
    }
}
