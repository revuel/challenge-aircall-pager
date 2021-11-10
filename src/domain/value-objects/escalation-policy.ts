/**
 * " Through the web console, the Aircall engineer is able to read and edit the Escalation Policy (1). An Escalation
 * Policy references a Monitored Service by its identifier. It contains an ordered list of levels. Each level contains a
 * set of targets. Each target can be of two types: email or SMS. Email Target contains the email address and SMS Target
 * contains the Phone Number."
 */
import { v4 as uuid4 } from 'uuid';

/**
 * TODO remove?
 */
export interface Target {
    // N/A
}

/**
 * EmailTarget V.O.
 * Notes: for the shake of simplicity, emailAddress is just a string instead of a more realistic additional Email V.O.
 */
export class EmailTarget implements Target {

    private readonly _emailAddress: string;

    /**
     * Regular constructor
     * @param emailAddress a string representing an email address
     */
    constructor(emailAddress: string) {
        this._emailAddress = emailAddress;
    }

    public get emailAddress() {
        return this._emailAddress;
    }
}

/**
 * Notes: for the shake of simplicity, phoneNumber is just a num instead of a more realistic additional PhoneNumber V.O.
 */
export class SmsTarget implements Target {

    private readonly _phoneNumber: number;

    /**
     * Regular constructor
     * @param phoneNumber number representing a phone number
     */
    constructor(phoneNumber: number) {
        this._phoneNumber = phoneNumber;
    }

    public get phoneNumber() {
        return this._phoneNumber;
    }
}

/**
 * Its assumed the EscalationPoliciesService gi
 */
export class EscalationLevel {

    private readonly _level: number;
    private readonly _emailTargets: Array<EmailTarget>;
    private readonly _smsTargets: Array<SmsTarget>;

    /**
     * Regular constructor
     * @param level Ordinal number of this level
     * @param emailTargets Array of EmailTarget
     * @param smsTargets Array of SmsTarget
     */
    constructor(level: number, emailTargets: Array<EmailTarget>, smsTargets: Array<SmsTarget>) {
        this._level = level;
        this._emailTargets = emailTargets;
        this._smsTargets = smsTargets;
    }

    public get level() {
        return this._level;
    }

    public get emailTargets() {
        return this._emailTargets;
    }

    public get smsTargets() {
        return this._smsTargets;
    }
}

/**
 * This value object serves as a DTO to talk with an EscalationPolicyService. Its needed to query this service, so its
 * response must be translated to this type of composite class.
 * It is assumed that the external EP service is providing escalation policies with integrity, (it should be its
 * responsibility) so there is no point on doing validations in "our" (Pager Service) side. I feel, not at least for the
 * purposes of this exercise...
 */
export class EscalationPolicy {
    private readonly _serviceUuid: uuid4;
    private readonly _escalationLevels: Array<EscalationLevel>;

    /**
     * Regular constructor
     * @param serviceUuid Service's UUID
     * @param escalationLevels EscalationLevels list
     */
    constructor(serviceUuid: uuid4, escalationLevels: Array<EscalationLevel>) {
        this._serviceUuid = serviceUuid;
        this._escalationLevels = escalationLevels;
    }

    public get serviceUuid() {
        return this._serviceUuid;
    }

    public get escalationLevels() {
        return this._escalationLevels;
    }
}
