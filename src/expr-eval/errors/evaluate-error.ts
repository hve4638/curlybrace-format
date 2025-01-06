import type { CBFFailHint } from '../../errors';
import { AnyExpression, ParamExpression } from '../../expr-parse/types/expressions';
import { CBF_ERROR_TYPE } from '../../types';
import EvaluateFail from './EvaluateFail';

export class NoHookError extends EvaluateFail {
    constructor(hookName:string, expr: Exclude<AnyExpression, ParamExpression>) {
        super(
            `No hook found for '${hookName}'`,
            CBF_ERROR_TYPE.NO_HOOK,
            expr
        );
        this.name = 'NoHookError';
    }
}

export class HookError extends EvaluateFail {
    constructor(error:Error, expr: Exclude<AnyExpression, ParamExpression>) {
        super(
            `${error.name} in hook : '${error.message}'`,
            CBF_ERROR_TYPE.EXCEPTION_IN_HOOK,
            expr
        );
        this.name = 'HookError';
    }
}

export class IdentifierResolveFail extends EvaluateFail {
    constructor(message:string, expr: Exclude<AnyExpression, ParamExpression>) {
        super(message, CBF_ERROR_TYPE.IDENTIFIER_RESOLVE_FAIL, expr);
        this.name = 'IdentifierResolveFail';
    }
}

export class OperatorNotSupportedError extends EvaluateFail {
    constructor(operator:string, expr: Exclude<AnyExpression, ParamExpression>) {
        super(
            `Unsupport operator : '${operator}'`,
            CBF_ERROR_TYPE.OPERATOR_NOT_SUPPORTED,
            expr
        );
        this.name = 'OperatorNotSupportedError';
    }
}

export class InvalidASTFormatError extends EvaluateFail {
    constructor(message:string, expr: Exclude<AnyExpression, ParamExpression>) {
        super(message, CBF_ERROR_TYPE.INVALID_AST_FORMAT, expr);
        this.name = 'InvalidASTFormatError';
    }
}