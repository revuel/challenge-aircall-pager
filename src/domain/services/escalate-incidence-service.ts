import { v4 as uuid4 } from 'uuid';
import {TimerTimeoutPort} from '../../presentation/timer-timeout/timer-timeout-port';
import {PersistencePort} from '../../infrastructure/persistence/persistence-port';
import {EscalationPoliciesPort} from '../../infrastructure/escalation-policies/escalation-policies-port';
import {SmsPort} from '../../infrastructure/sms/sms-port';
import {MailPort} from '../../infrastructure/mail/mail-port';
import {TimerStartPort} from '../../infrastructure/timer-start/timer-start-port';
import {PagerServiceError} from '../pager-service-error';
import {EmailNotification} from '../value-objects/email-notification';
import {SmsNotification} from '../value-objects/sms-notification';


/**
 * Use Case: Escalates an incidence for a Monitored Service
 *
 * "In case of Acknowledgement Timeout (9) with no prior Alert Acknowledgement (8) or Healthy event (2), the Pager
 * Service escalates to the next Policy Level to notify the targets of the second level and set the timer. And so on..."
 *
 * Note: Why do not we just save the Escalation Policies within the monitored service at the Pager DB? Well, because it
 * happens someone through the web console could edit the Escalation Policy of a service that is unhealthy, leading the
 * pager service to incorrectly command SmsService and/or EmailService to deliver notifications to the wrong targets.
 */
export class EscalateIncidenceService implements TimerTimeoutPort {
    
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
     * Escalates an incidence of an unhealthy service by its uuid
     * 0) Invokes PersistenceService to read service's state to determine whether it is actually unhealthy or not
     * If the service is in an unhealthy state and has not been acknowledged:
     * 1) Invokes EscalationPoliciesService to get the next escalation level targets of the dysfunctional service
     *  (Having the current escalation of the service previously red)
     * 2) Invokes SmsService and/or MailService so they send notifications to the next level targets of the 
     * dysfunctional service
     * 3) Invokes TimerStartService to start (restart in this case) the acknowledgement count down
     * 4) Invokes PersistenceService to update dysfunctional service's current escalation level
     * If the service was in a healthy state or was acknowledged, does nothing
     * Explanation: We could receive the acknowledgement timeout after someone marking the service as healthy through 
     * the web console, causing an annoying escalation of a service that is actually healthy
     * @param serviceUuid Service's UUID
     */
    escalateIncidence(serviceUuid: uuid4): any {
        try {
            // 0)
            let monitoredService = this.persistenceService.readUnhealthyService(serviceUuid);

            if (monitoredService !== undefined && monitoredService.acknowledged === false) {
                // 1)
                let escalationPolicies = this.escalationPoliciesService.readEscalationPolicy(serviceUuid);
                let nextEscalationPolicy = monitoredService.currentEscalationLevel + 1;

                // 2)
                let nextLevel = escalationPolicies.escalationLevels[nextEscalationPolicy];
                nextLevel.emailTargets.forEach(target => {
                    this.mailService.sendMail(new EmailNotification(monitoredService, target));
                });
                nextLevel.smsTargets.forEach(target => {
                    this.smsService.sendSMS(new SmsNotification(monitoredService, target));
                });
                // 3)
                this.timerStartService.startTimer(serviceUuid, 15);
                // 4)
                monitoredService.currentEscalationLevel += 1;
                this.persistenceService.updateUnhealthyService(monitoredService);
            }
        } catch (error) {
            throw new PagerServiceError(error.message);
        }
    }
}