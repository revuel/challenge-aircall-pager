import {MonitoredServiceEntity} from '../entities/monitored-service-entity';
import {SmsTarget} from './escalation-policy';

/**
 * This value object serves as a DTO to talk with a SmsService. We do not really know what this service needs to
 * operate, so I feel that at least it will require information about the unhealthy service and an SmsTarget
 * Maybe instead of having an EmailTarget as argument it would be more appropriate to have an Array of SmsTargets, I
 * leave that option as an improvement.
 */
export class SmsNotification {
    private readonly service: MonitoredServiceEntity;
    private readonly target: SmsTarget;

    /**
     * Regular constructor
     * @param monitoredService MonitoredServiceEntity (an unhealthy service)
     * @param target SmsTarget
     */
    constructor(monitoredService: MonitoredServiceEntity, target: SmsTarget) {
        this.service = monitoredService;
        this.target = target;
    }
}
