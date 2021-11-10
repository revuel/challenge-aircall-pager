import { v4 as uuid4 } from 'uuid';


export interface WebConsolePort {
    closeIncidence(serviceUuid: uuid4);
    acknowledgeIncidence(serviceUuid: uuid4);
}
