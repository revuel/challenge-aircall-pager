import { v4 as uuid4 } from 'uuid';
import { createMock } from 'ts-auto-mock';
import {PersistenceServiceTestDouble} from '../../doubles';
import {UpdateIncidenceService} from '../../../src/domain/services/update-incidence-service';
import {EscalateIncidenceService} from '../../../src/domain/services/escalate-incidence-service';
import {EscalationPoliciesPort} from '../../../src/infrastructure/escalation-policies/escalation-policies-port';
import {SmsPort} from '../../../src/infrastructure/sms/sms-port';
import {MailPort} from '../../../src/infrastructure/mail/mail-port';
import {TimerStartPort} from '../../../src/infrastructure/timer-start/timer-start-port';
import {PersistencePort} from '../../../src/infrastructure/persistence/persistence-port';
import {PagerServiceError} from '../../../src/domain/pager-service-error';


test('Given a Monitored Service in an Unhealthy State ' +
    'when the Pager receives an *mark as healthy* command from the web-console ' +
    'then the Monitored Service is removed from the Pager\'s DB', () => {

    // Arrange (Given)
    let persistenceService = new PersistenceServiceTestDouble();
    let unhealthyServiceUuid = uuid4();
    persistenceService.createUnhealthyService(unhealthyServiceUuid)
    let closeIncidenceService = new UpdateIncidenceService(persistenceService);

    // Act (When)
    closeIncidenceService.closeIncidence(unhealthyServiceUuid);

    // Assert (Then)
    expect(persistenceService.readUnhealthyService(unhealthyServiceUuid)).toBe(undefined);
})

test('Given a Monitored Service in an Unhealthy State,' +
    'when the Pager receives a Healthy event related to this Monitored Service' +
    'and later receives the Acknowledgement Timeout,' +
    'then the Monitored Service becomes Healthy,' +
    'the Pager does not notify any Target' +
    'and does not set an acknowledgement delay', () => {

    // Arrange (Given)
    let persistenceService = new PersistenceServiceTestDouble();
    let unhealthyServiceUuid = uuid4();
    persistenceService.createUnhealthyService(unhealthyServiceUuid)
    let closeIncidenceService = new UpdateIncidenceService(persistenceService);
    let escalationPoliciesService = createMock<EscalationPoliciesPort>();
    let smsService = createMock<SmsPort>();
    let mailService = createMock<MailPort>();
    let timerStartService = createMock<TimerStartPort>();
    let escalateIncidenceService = new EscalateIncidenceService(
        persistenceService,
        escalationPoliciesService,
        smsService,
        mailService,
        timerStartService
    )

    // Act (When)
    closeIncidenceService.closeIncidence(unhealthyServiceUuid);
    escalateIncidenceService.escalateIncidence(unhealthyServiceUuid);

    // Assert (Then)
    expect(persistenceService.readUnhealthyService(unhealthyServiceUuid)).toBe(undefined); // Service healthy
    expect(escalationPoliciesService.readEscalationPolicy).not.toHaveBeenCalled(); // Not called EP service
    expect(smsService.sendSMS).not.toHaveBeenCalled(); // Not called sms targets...
    expect(mailService.sendMail).not.toHaveBeenCalled(); // Not called mail targets...
    expect(timerStartService.startTimer).not.toHaveBeenCalled() // Not called timer again...
})

test('Given a Monitored Service in any state ' +
    'when UpdateIncidenceService experiences an error while acknowledging an incidence ' +
    'then a PagerServiceError is thrown ' +
    'when UpdateIncidenceService experiences an error while closing an incidence ' +
    'then a PagerServiceError is thrown', () => {

    // Arrange (Given)
    let errorMsg = 'Did not work!';
    let errorThrower = jest.fn().mockImplementation(() => {throw new Error(errorMsg)});
    let persistenceService = createMock<PersistencePort>({readUnhealthyService: errorThrower});
    let updateIncidenceService = new UpdateIncidenceService(
        persistenceService,
    );

    // Act & Assert (When and Then)
    expect(updateIncidenceService.acknowledgeIncidence).toThrow(PagerServiceError);
    expect(updateIncidenceService.closeIncidence).toThrow(PagerServiceError);
})
