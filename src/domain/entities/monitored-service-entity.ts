import { v4 as uuid4 } from 'uuid';

/**
 * Due to the description of the challenge, the main (and only) Entity we have by now is this one. It represents an
 * unhealthy service. If we want to keep track of healthy services, we could just add a "_healthy" field here.
 *
 * Notes:
 * - currentEscalationLevel: once its time to escalate, the escalation level is increased after sending the
 * notifications, but while opening an incidence (lvl 0) notifications are sent but level is not increased. This way
 * this property always reflects who are the last targets that have been notified.
 * - alertMsg: It could potentially be a list instead of a string, for the shake of simplicity, let's leave this way
 * - Getter & setters: No, I am not commenting them because this class is actually just a
 * PO<InsertProgrammingLanguageInitialLetterHere>O . I am not familiar enough with TypeScript and I did not have enough
 * time to check if there is a Java/Lombok equivalent for TypeScript; so sorry for the boilerplate here.
 */
export class MonitoredServiceEntity {

    private _serviceUuid: uuid4;
    private _acknowledged: boolean;
    private _currentEscalationLevel: number;
    private _alertMsg: string;

    /**
     *
     * @param serviceUuid Service's UUID
     * @param acknowledged boolean stating whether the service has been acknowledged (true) or not (false)
     * @param currentEscalationLevel number reflecting which was the last level where notifications where sent
     * @param alertMsg string indicating the original message received when created the incidence
     */
    constructor(serviceUuid: uuid4, acknowledged: boolean, currentEscalationLevel: number, alertMsg: string) {
        this._serviceUuid = serviceUuid;
        this._acknowledged = acknowledged;
        this._currentEscalationLevel = currentEscalationLevel;
        this._alertMsg = alertMsg;
    }

    get serviceUuid(): uuid4 {
        return this._serviceUuid;
    }

    set serviceUuid(value: uuid4) {
        this._serviceUuid = value;
    }

    get acknowledged(): boolean {
        return this._acknowledged;
    }

    set acknowledged(value: boolean) {
        this._acknowledged = value;
    }

    get currentEscalationLevel(): number {
        return this._currentEscalationLevel;
    }

    set currentEscalationLevel(value: number) {
        this._currentEscalationLevel = value;
    }

    get alertMsg(): string {
        return this._alertMsg;
    }

    set alertMsg(value: string) {
        this._alertMsg = value;
    }
}
