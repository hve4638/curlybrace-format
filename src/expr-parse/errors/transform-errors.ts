import { CBFFail, CBFFailHint } from '../../errors';
import {CBFErrorType} from '../../types';

export class TransfromPostfixFail extends CBFFail {
    constructor(message:string, type:CBFErrorType, hint:CBFFailHint) {
        super(message, type, hint);
        this.name = 'TransfromPostfixFail';
    }
}

export class MultipleExpressionError extends CBFFail {
    constructor(message:string, hint:CBFFailHint) {
        super(message, CBFErrorType.MULTIPLE_EXPRESSION, hint);
        this.name = 'MultipleExpressionError';
    }
}

export class TokenMissingError extends CBFFail {
    constructor(message:string, hint:CBFFailHint) {
        super(message, CBFErrorType.TOKEN_MISSING, hint);
        this.name = 'TokenMissingError';
    }
}
