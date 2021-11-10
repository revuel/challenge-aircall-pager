import { v4 as uuid4 } from 'uuid';
import {createMock} from 'ts-auto-mock';
import {getMockedEscalationPoliciesService, PersistenceServiceTestDouble} from '../../doubles';
import {EscalateIncidenceService} from '../../../src/domain/services/escalate-incidence-service';
import {SmsPort} from '../../../src/infrastructure/sms/sms-port';
import {MailPort} from '../../../src/infrastructure/mail/mail-port';
import {TimerStartPort} from '../../../src/infrastructure/timer-start/timer-start-port';
import {UpdateIncidenceService} from '../../../src/domain/services/update-incidence-service';
import {EscalationPoliciesPort} from '../../../src/infrastructure/escalation-policies/escalation-policies-port';
import {PersistencePort} from '../../../src/infrastructure/persistence/persistence-port';
import {PagerServiceError} from '../../../src/domain/pager-service-error';


test('Given a Monitored Service in an Unhealthy State, ' +
    'the corresponding Alert is not Acknowledged ' +
    'and the last level has not been notified, ' +
    'when the Pager receives the Acknowledgement Timeout, ' +
    'then the Pager notifies all targets of the next level of the escalation policy ' +
    'and sets a 15-minutes acknowledgement delay.', () => {

    // Arrange (Given)
    let unhealthyServiceUuid = uuid4();
    let persistenceService = new PersistenceServiceTestDouble();
    let escalationPoliciesService = getMockedEscalationPoliciesService(unhealthyServiceUuid)
    let smsService = createMock<SmsPort>();
    let mailService = createMock<MailPort>();
    let timerStartService = createMock<TimerStartPort>();
    persistenceService.createUnhealthyService(unhealthyServiceUuid)
    let escalateIncidenceService = new EscalateIncidenceService(
        persistenceService,
        escalationPoliciesService,
        smsService,
        mailService,
        timerStartService
    )

    // Act (When)
    escalateIncidenceService.escalateIncidence(unhealthyServiceUuid); // No ack received before!

    // Assert (Then)
    expect(persistenceService.readUnhealthyService(unhealthyServiceUuid)
        .currentEscalationLevel).toBe(1); // Unhealthy service current escalation level has not been updated
    expect(escalationPoliciesService.readEscalationPolicy).toHaveBeenCalled(); // Escalation Policies queried...
    expect(smsService.sendSMS).toHaveBeenCalled(); // Called sms targets...
    expect(mailService.sendMail).toHaveBeenCalled(); // Called email targets...
    expect(timerStartService.startTimer).toHaveBeenCalled(); // Restarted timer...
})

test('Given a Monitored Service in an Unhealthy State ' +
    'when the Pager receives the Acknowledgement ' +
    'and later receives the Acknowledgement Timeout, ' +
    'then the Pager does not notify any Target ' +
    'and does not set an acknowledgement delay.', () => {

    // Arrange (Given)
    let unhealthyServiceUuid = uuid4();
    let persistenceService = new PersistenceServiceTestDouble();
    let escalationPoliciesService = getMockedEscalationPoliciesService(unhealthyServiceUuid);
    let smsService = createMock<SmsPort>();
    let mailService = createMock<MailPort>();
    let timerStartService = createMock<TimerStartPort>();
    persistenceService.createUnhealthyService(unhealthyServiceUuid);
    let updateIncidenceService = new UpdateIncidenceService(persistenceService);
    let escalateIncidenceService = new EscalateIncidenceService(
        persistenceService,
        escalationPoliciesService,
        smsService,
        mailService,
        timerStartService
    )

    // Act (When)
    updateIncidenceService.acknowledgeIncidence(unhealthyServiceUuid);
    escalateIncidenceService.escalateIncidence(unhealthyServiceUuid);

    // Assert (Then)
    expect(escalationPoliciesService.readEscalationPolicy).not.toHaveBeenCalled(); // Escalation Policies not queried...
    expect(smsService.sendSMS).not.toHaveBeenCalled(); // Not called sms targets...
    expect(mailService.sendMail).not.toHaveBeenCalled(); // Not called email targets...
    expect(timerStartService.startTimer).not.toHaveBeenCalled(); // Not restarted timer...
})

test('Given a Monitored Service in any state ' +
    'when escalateIncidenceService experiences an error while performing its business logic ' +
    'then a PagerServiceError is thrown', () => {

    // Arrange (Given)
    let errorMsg = 'Did not work!';
    let errorThrower = jest.fn().mockImplementation(() => {throw new Error(errorMsg)});
    let persistenceService = createMock<PersistencePort>({readUnhealthyService: errorThrower});
    let escalateIncidenceService = new EscalateIncidenceService(
        persistenceService,
        createMock<EscalationPoliciesPort>(),
        createMock<SmsPort>(),
        createMock<MailPort>(),
        createMock<TimerStartPort>()
    );

    // Act & Assert (When and Then)
    expect(escalateIncidenceService.escalateIncidence).toThrow(PagerServiceError);
})
