import {MonitoredServiceEntity} from '../entities/monitored-service-entity';
import {EmailTarget} from './escalation-policy';

/**
 * This value object serves as a DTO to talk with a MailService. We do not really know what this service needs to
 * operate, so I feel that at least it will require information about the unhealthy service and an EmailTarget
 * Maybe instead of having an EmailTarget as argument it would be more appropriate to have an Array of EmailTargets, I
 * leave that option as an improvement.
 */
export class EmailNotification {
    private readonly service: MonitoredServiceEntity;
    private readonly target: EmailTarget;

    /**
     * Regular constructor
     * @param monitoredService MonitoredServiceEntity (an unhealthy service)
     * @param target EmailTarget
     */
    constructor(monitoredService: MonitoredServiceEntity, target: EmailTarget) {
        this.service = monitoredService;
        this.target = target;
    }
}
