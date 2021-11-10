import { v4 as uuid4 } from 'uuid';


export interface TimerTimeoutPort {
    escalateIncidence(serviceUuid: uuid4);
}
