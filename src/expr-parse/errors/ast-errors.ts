import { CBFFail, CBFFailHint } from '../../errors';
import { CBF_ERROR_TYPE } from '../../types';

export class NoExpressionError extends CBFFail {
    constructor(message:string, hint:CBFFailHint) {
        super(message, CBF_ERROR_TYPE.NO_EXPRESSION, hint);
        this.name = 'NoExpressionError';
    }
}

export class UnhandleExpressionRemainError extends CBFFail {
    constructor(message:string, hint:CBFFailHint) {
        super(message, CBF_ERROR_TYPE.UNHANDLE_EXPRESSION_REMAIN, hint);
        this.name = 'UnhandleExpressionRemainError';
    }
}

export class InvalidOperandError extends CBFFail {
    constructor(message:string, hint:CBFFailHint) {
        super(message, CBF_ERROR_TYPE.INVALID_TOKEN, hint);
        this.name = 'InvalidTokenError';
    }
}

export class InvalidCallExpressionFormatError extends CBFFail {
    constructor(message:string, hint:CBFFailHint) {
        super(message, CBF_ERROR_TYPE.INVALID_CALLEXPRESSION_FORMAT, hint);
        this.name = 'InvalidCallExpressionFormatError';
    }
}
