import { CBFFail, CBFFailHint } from '../../errors';
import { CBFErrorType } from '../../types';

export class NoExpressionError extends CBFFail {
    constructor(message:string, hint:CBFFailHint) {
        super(message, CBFErrorType.NO_EXPRESSION, hint);
        this.name = 'NoExpressionError';
    }
}

export class UnhandleExpressionRemainError extends CBFFail {
    constructor(message:string, hint:CBFFailHint) {
        super(message, CBFErrorType.UNHANDLE_EXPRESSION_REMAIN, hint);
        this.name = 'UnhandleExpressionRemainError';
    }
}

export class InvalidOperandError extends CBFFail {
    constructor(message:string, hint:CBFFailHint) {
        super(message, CBFErrorType.INVALID_TOKEN, hint);
        this.name = 'InvalidTokenError';
    }
}

export class InvalidCallExpressionFormatError extends CBFFail {
    constructor(message:string, hint:CBFFailHint) {
        super(message, CBFErrorType.INVALID_CALLEXPRESSION_FORMAT, hint);
        this.name = 'InvalidCallExpressionFormatError';
    }
}
