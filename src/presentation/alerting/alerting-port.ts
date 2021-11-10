import { v4 as uuid4 } from 'uuid';


export interface AlertingPort {
    openIncidence(serviceUuid: uuid4, alertMsg: string);
}
