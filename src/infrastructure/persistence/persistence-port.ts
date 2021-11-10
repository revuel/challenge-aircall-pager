import { v4 as uuid4 } from 'uuid';
import {MonitoredServiceEntity} from '../../domain/entities/monitored-service-entity';


export interface PersistencePort {
    createUnhealthyService(serviceUuid: uuid4): MonitoredServiceEntity;
    readUnhealthyService(serviceUuid: uuid4): MonitoredServiceEntity;
    updateUnhealthyService(service: MonitoredServiceEntity): MonitoredServiceEntity;
    deleteUnhealthyService(serviceUuid: uuid4);
}
