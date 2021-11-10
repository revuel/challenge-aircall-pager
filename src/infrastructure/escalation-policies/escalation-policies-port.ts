import { v4 as uuid4 } from 'uuid';
import {EscalationPolicy} from '../../domain/value-objects/escalation-policy';


export interface EscalationPoliciesPort {
    readEscalationPolicy(serviceUuid: uuid4): EscalationPolicy;
}
