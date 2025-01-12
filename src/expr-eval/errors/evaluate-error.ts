import type { CBFFailHint } from '../../errors';
import { AnyExpression, ParamExpression } from '../../expr-parse/types/expressions';
import { CBFErrorType } from '../../types';
import EvaluateFail from './EvaluateFail';

export class NoHookError extends EvaluateFail {
    constructor(hookName:string, expr: Exclude<AnyExpression, ParamExpression>) {
        super(
            `No hook found for '${hookName}'`,
            CBFErrorType.NO_HOOK,
            expr
        );
        this.name = 'NoHookError';
    }
}

export class HookError extends EvaluateFail {
    constructor(error:Error, expr: Exclude<AnyExpression, ParamExpression>) {
        super(
            `${error.name} in hook : '${error.message}'`,
            CBFErrorType.EXCEPTION_IN_HOOK,
            expr
        );
        this.name = 'HookError';
    }
}

export class IdentifierResolveFail extends EvaluateFail {
    constructor(message:string, expr: Exclude<AnyExpression, ParamExpression>) {
        super(message, CBFErrorType.IDENTIFIER_RESOLVE_FAIL, expr);
        this.name = 'IdentifierResolveFail';
    }
}

export class OperatorNotSupportedError extends EvaluateFail {
    constructor(operator:string, expr: Exclude<AnyExpression, ParamExpression>) {
        super(
            `Unsupport operator : '${operator}'`,
            CBFErrorType.OPERATOR_NOT_SUPPORTED,
            expr
        );
        this.name = 'OperatorNotSupportedError';
    }
}

export class InvalidASTFormatError extends EvaluateFail {
    constructor(message:string, expr: Exclude<AnyExpression, ParamExpression>) {
        super(message, CBFErrorType.INVALID_AST_FORMAT, expr);
        this.name = 'InvalidASTFormatError';
    }
}

