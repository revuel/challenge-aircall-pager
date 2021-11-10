import { v4 as uuid4 } from 'uuid';


export interface TimerStartPort {
    startTimer(serviceUuid: uuid4, minutes: number): any;
}
