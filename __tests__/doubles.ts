import { v4 as uuid4 } from 'uuid';
import {createMock} from 'ts-auto-mock';
import {PersistencePort} from '../src/infrastructure/persistence/persistence-port';
import {MonitoredServiceEntity} from '../src/domain/entities/monitored-service-entity';
import {EscalationPoliciesPort} from '../src/infrastructure/escalation-policies/escalation-policies-port';
import {EmailTarget, EscalationLevel, EscalationPolicy, SmsTarget} from '../src/domain/value-objects/escalation-policy';

/**
 * A handcrafted test double class for PersistencePort
 * The two motivations behind doing this test double are:
 * 1: I feel that using a ts-auto-mock for this would overcomplicate the unit tests
 * 2: Show how the Pager DB could work if it was implemented as a key-value database (which is what I feel fits better),
 * so we can think of this double also as a proposal (given that Pager DB requirements have not been specified)
 *
 * IMPORTANT NOTE: In any case, the ACTUAL Pager DB MUST be ACID compliant!!! (as far as I understand DynamoDB it is).
 */
export class PersistenceServiceTestDouble implements PersistencePort {

    private db: Map<uuid4, MonitoredServiceEntity>;

    /**
     * Init with an empty db Map
     */
    constructor() {
        this.db = new Map();
    }

    /**
     * Adds an entry to instance's db Map
     * It receives the uuid from an external service, assuming that Pager tracks only unhealthy services
     * @param serviceUuid Service's UUID
     */
    createUnhealthyService(serviceUuid: uuid4): any {
        let unhealthyService =
            new MonitoredServiceEntity(serviceUuid, false, 0, '');
        this.db.set(serviceUuid, unhealthyService)
        return unhealthyService;
    }

    /**
     * Reads unhealthy service by uuid
     * @param serviceUuid Service's UUID
     */
    readUnhealthyService(serviceUuid: uuid4): MonitoredServiceEntity {
        return this.db.get(serviceUuid);
    }

    /**
     * Updates an unhealthy service: mainly when its been acknowledged or when it has been escalated to the next level
     * @param service MonitoredServiceEntity
     */
    updateUnhealthyService(service: MonitoredServiceEntity): MonitoredServiceEntity {
        this.db.set(service.serviceUuid, service);
        return this.db.get(service.serviceUuid)
    }

    /**
     * Removes an unhealthy service, which assuming Pager only tracks unhealthy services, would be equivalent to say
     * that that service is now healthy
     * @param serviceUuid Service's UUID
     */
    deleteUnhealthyService(serviceUuid: uuid4): any {
        this.db.delete(serviceUuid);
    }
}

/**
 * The EscalationPoliciesService is a bit more complicated to mock. The reason is that what is expected from that
 * unimplemented service is to provide EscalationPolicy objects through querying the actual service. So this method
 * helps to mock an EscalationPoliciesService that returns a EscalationPolicy (see value-objects module).
 *
 * Notes: Yes, both the EmailTarget & SmsTarget value objects have been oversimplified, that is why the email field is
 * just a string and the phoneNumber field is just a number, while in the reality should be a bit more sophisticated
 * than that (i.e. like having an Email value object with email address validation or having a PhoneNumber value object
 * with prefix, validations and so on).
 * @param serviceUuid Service's UUID
 */
export const getMockedEscalationPoliciesService = (serviceUuid) => {

    let emailTargets = [];
    emailTargets.push(new EmailTarget('fake-email@undefined.com'));

    let smsTargets = []
    smsTargets.push(new SmsTarget('42'));

    let escalationLevels = [];
    escalationLevels.push(new EscalationLevel(0, emailTargets.concat(smsTargets)));
    escalationLevels.push(new EscalationLevel(1, emailTargets.concat(smsTargets)));

    let escalationPoliciesService = new EscalationPolicy(serviceUuid, escalationLevels);

    let mockedReadEscalationPolicy = jest.fn();
    mockedReadEscalationPolicy.mockReturnValueOnce(escalationPoliciesService);

    return createMock<EscalationPoliciesPort>({
        readEscalationPolicy: mockedReadEscalationPolicy
    });
}
