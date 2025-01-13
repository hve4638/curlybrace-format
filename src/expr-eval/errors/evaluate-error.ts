import { AnyExpression, ParamExpression } from '../../expr-parse/types/expressions';
import { CBFErrorType } from '../../types';
import CBFEvalFail from './CBFEvalFail';

export class NoHookError extends CBFEvalFail {
    constructor(hookName:string, expr: Exclude<AnyExpression, ParamExpression>) {
        super(
            `No hook found for '${hookName}'`,
            CBFErrorType.NO_HOOK,
            expr
        );
        this.name = 'NoHookError';
    }
}

export class HookError extends CBFEvalFail {
    constructor(error:Error, expr: Exclude<AnyExpression, ParamExpression>) {
        super(
            `${error.name} in hook : '${error.message}'`,
            CBFErrorType.EXCEPTION_IN_HOOK,
            expr
        );
        this.name = 'HookError';
    }
}

export class IdentifierResolveFail extends CBFEvalFail {
    constructor(message:string, expr: Exclude<AnyExpression, ParamExpression>) {
        super(message, CBFErrorType.IDENTIFIER_RESOLVE_FAIL, expr);
        this.name = 'IdentifierResolveFail';
    }
}

export class OperatorNotSupportedError extends CBFEvalFail {
    constructor(operator:string, expr: Exclude<AnyExpression, ParamExpression>) {
        super(
            `Unsupport operator : '${operator}'`,
            CBFErrorType.OPERATOR_NOT_SUPPORTED,
            expr
        );
        this.name = 'OperatorNotSupportedError';
    }
}

export class InvalidASTFormatError extends CBFEvalFail {
    constructor(message:string, expr: Exclude<AnyExpression, ParamExpression>) {
        super(message, CBFErrorType.INVALID_AST_FORMAT, expr);
        this.name = 'InvalidASTFormatError';
    }
}

