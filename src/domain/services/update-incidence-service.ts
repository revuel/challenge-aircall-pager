import { v4 as uuid4 } from 'uuid';
import {WebConsolePort} from '../../presentation/web-console/web-console-port';
import {PersistencePort} from '../../infrastructure/persistence/persistence-port';
import {PagerServiceError} from "../pager-service-error";

/**
 * Use Cases:
 *  1: Closes Monitored Service incidence
 *  2: Acknowledges Monitored Service incidence
 *
 * "This console also allows the engineer, when the incident is closed, to inform the Pager Service that the Monitored
 * Service is now Healthy (2)"
 *
 * "A target must acknowledge the alert within 15-minutes (8)"
 */
export class UpdateIncidenceService implements WebConsolePort {

    private persistenceService: PersistencePort;

    /**
     * DI service constructor
     * @param persistenceService Implements PersistencePort
     */
    constructor(persistenceService: PersistencePort) {
        this.persistenceService = persistenceService;
    }

    /**
     * Closes a Monitored Service incidence acknowledge value *marks a monitored service as closed* by service uuid
     *
     * Notes: ** There is no such use case of differentiating among healthy/unhealthy services within the Pager Service.
     * We could consider that all the services that have an entry in Pager's DB are unhealthy.
     * This way, if we have 1M services, and just 10 of them are unhealthy, we do not have such a huge DB. I also
     * suspect that the services themselves are kept in another place... maybe I am wrong
     * @param serviceUuid Service's UUID
     */
    closeIncidence(serviceUuid: uuid4): any {
        try {
            this.persistenceService.deleteUnhealthyService(serviceUuid);
        } catch (error) {
            throw new PagerServiceError(error.message);
        }
    }

    /**
     * Updates a Monitored Service incidence acknowledge value *marks a monitored service as acknowledged* by uuid
     * @param serviceUuid
     */
    acknowledgeIncidence(serviceUuid: uuid4): any {
        try {
            let monitoredService = this.persistenceService.readUnhealthyService(serviceUuid);
            monitoredService.acknowledged = true;
            this.persistenceService.updateUnhealthyService(monitoredService);
        } catch (error) {
            throw new PagerServiceError(error.message);
        }
    }
}