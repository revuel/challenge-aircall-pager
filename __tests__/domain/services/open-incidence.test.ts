import { v4 as uuid4 } from 'uuid';
import {createMock} from 'ts-auto-mock';
import {getMockedEscalationPoliciesService, PersistenceServiceTestDouble} from '../../doubles';
import {OpenIncidenceService} from '../../../src/domain/services/open-incidence-service';
import {EscalationPoliciesPort} from '../../../src/infrastructure/escalation-policies/escalation-policies-port';
import {SmsPort} from '../../../src/infrastructure/sms/sms-port';
import {MailPort} from '../../../src/infrastructure/mail/mail-port';
import {TimerStartPort} from '../../../src/infrastructure/timer-start/timer-start-port';
import {PersistencePort} from '../../../src/infrastructure/persistence/persistence-port';
import {PagerServiceError} from '../../../src/domain/pager-service-error';


test('Given a Monitored Service in a Healthy State, ' +
    'when the Pager receives an Alert related to this Monitored Service, ' +
    'then the Monitored Service becomes Unhealthy, ' +
    'the Pager notifies all targets of the first level of the escalation policy, ' +
    'and sets a 15-minutes acknowledgement delay', () => {

    // Arrange (Given)
    let serviceUuid = uuid4();
    let persistenceService = new PersistenceServiceTestDouble();
    let escalationPoliciesService = getMockedEscalationPoliciesService(serviceUuid);
    let smsService = createMock<SmsPort>();
    let mailService = createMock<MailPort>();
    let timerStartService = createMock<TimerStartPort>();
    let openIncidenceService = new OpenIncidenceService(
        persistenceService,
        escalationPoliciesService,
        smsService,
        mailService,
        timerStartService
    );

    // Act (When)
    openIncidenceService.openIncidence(serviceUuid, 'Service is broken :(');

    // Assert (Then)
    expect(persistenceService.readUnhealthyService(serviceUuid)).toBeTruthy(); // Service is now unhealthy...
    expect(escalationPoliciesService.readEscalationPolicy).toHaveBeenCalled(); // Escalation Policies queried...
    expect(smsService.sendSMS).toHaveBeenCalled(); // Called sms targets...
    expect(mailService.sendMail).toHaveBeenCalled(); // Called email targets...
    expect(timerStartService.startTimer).toHaveBeenCalled(); // Started timer...
})

test('Given a Monitored Service in an Unhealthy State, ' +
    'when the Pager receives an Alert related to this Monitored Service, ' +
    'then the Pager does not notify any Target' +
    'and does not set an acknowledgement delay', () => {

    // Arrange (Given)
    let unhealthyServiceUuid = uuid4();
    let persistenceService = new PersistenceServiceTestDouble();
    persistenceService.createUnhealthyService(unhealthyServiceUuid); // Already unhealthy
    let escalationPoliciesService = createMock<EscalationPoliciesPort>();
    let smsService = createMock<SmsPort>();
    let mailService = createMock<MailPort>();
    let timerStartService = createMock<TimerStartPort>();
    let openIncidenceService = new OpenIncidenceService(
        persistenceService,
        escalationPoliciesService,
        smsService,
        mailService,
        timerStartService
    );

    // Act (When)
    openIncidenceService.openIncidence(unhealthyServiceUuid, 'Insisting on claiming the service is broken!');

    // Assert (Then)
    expect(escalationPoliciesService.readEscalationPolicy).not.toHaveBeenCalled(); // Escalation Policies NOT queried...
    expect(smsService.sendSMS).not.toHaveBeenCalled(); // Not called sms targets...
    expect(mailService.sendMail).not.toHaveBeenCalled(); // Not called email targets...
    expect(timerStartService.startTimer).not.toHaveBeenCalled(); // Not restarted timer...
})


test('Given a Monitored Service in any state ' +
    'when OpenIncidenceService experiences an error while opening an incidence ' +
    'then a PagerServiceError is thrown', () => {

    // Arrange (Given)
    let errorMsg = 'Did not work!';
    let errorThrower = jest.fn().mockImplementation(() => {throw new Error(errorMsg)});
    let persistenceService = createMock<PersistencePort>({readUnhealthyService: errorThrower});
    let openIncidenceService = new OpenIncidenceService(
        persistenceService,
        createMock<EscalationPoliciesPort>(),
        createMock<SmsPort>(),
        createMock<MailPort>(),
        createMock<TimerStartPort>()
    );

    // Act & Assert (When and Then)
    expect(openIncidenceService.openIncidence).toThrow(PagerServiceError);
})
