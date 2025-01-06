import { CBFFail, CBFFailHint } from '../../errors';
import {CBF_ERROR_TYPE} from '../../types';

export class TransfromPostfixFail extends CBFFail {
    constructor(message:string, type:CBF_ERROR_TYPE, hint:CBFFailHint) {
        super(message, type, hint);
        this.name = 'TransfromPostfixFail';
    }
}

export class MultipleExpressionError extends CBFFail {
    constructor(message:string, hint:CBFFailHint) {
        super(message, CBF_ERROR_TYPE.MULTIPLE_EXPRESSION, hint);
        this.name = 'MultipleExpressionError';
    }
}

export class TokenMissingError extends CBFFail {
    constructor(message:string, hint:CBFFailHint) {
        super(message, CBF_ERROR_TYPE.TOKEN_MISSING, hint);
        this.name = 'TokenMissingError';
    }
}
