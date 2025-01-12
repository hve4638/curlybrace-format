import { CBFFail, CBFFailHint } from '../../errors';
import {CBFErrorType} from '../../types';

export class InvalidTokenError extends CBFFail {
    constructor(message:string, hint:CBFFailHint) {
        super(message, CBFErrorType.INVALID_TOKEN, hint);
        this.name = 'InvalidTokenError';
    }
}
