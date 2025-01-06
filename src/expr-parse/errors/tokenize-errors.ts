import { CBFFail, CBFFailHint } from '../../errors';
import {CBF_ERROR_TYPE} from '../../types';

export class InvalidTokenError extends CBFFail {
    constructor(message:string, hint:CBFFailHint) {
        super(message, CBF_ERROR_TYPE.INVALID_TOKEN, hint);
        this.name = 'InvalidTokenError';
    }
}
