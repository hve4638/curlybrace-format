import {
    HookError,
    NoHookError,
    OperatorNotSupportedError,
    IdentifierResolveFail,
    InvalidASTFormatError,
} from './errors';
import {
    ExpressionType,
    AnyExpression,
    EvaluatableExpression,
    IdentifierExpression,
    LiteralExpression,
    ObjectExpression,
    CallExpression,
    ParamExpression
} from '../expr-parse/types/expressions';
import { ExpressionArgs, ExpressionEventHooks, OPERATOR_HOOKS, Vars } from './types/expr-hooks';
import { LITERAL_ACTIONS } from './literal-actions';
import { Tokens } from '../expr-parse/Tokens';

class Evaluator {
    #vars:Vars;
    #builtInVars:Vars;
    #currentScope:Vars;
    #expressionEventHooks:Partial<ExpressionEventHooks>;
    
    constructor(args:ExpressionArgs) {
        const {expressionEventHooks, vars, builtInVars, currentScope} = args;
        this.#expressionEventHooks = expressionEventHooks ?? {};
        this.#vars = vars ?? {};
        this.#currentScope = currentScope ?? {};
        this.#builtInVars = builtInVars ?? {};
    }

    evaluateAndStringify(expressionAST:EvaluatableExpression) {
        const result = this.#evaluateExpr(expressionAST) as EvaluatableExpression;

        if (this.#isLiteral(result)) {
            return result.value.toString();
        }
        else {
            const hookName = OPERATOR_HOOKS.STRINGIFY;
            const hook = this.#expressionEventHooks[hookName];
            if (hook) {
                return hook(result);
            }
            else {
                throw new NoHookError(hookName, result);
            }
        }
    }

    evaluate(expressionAST:EvaluatableExpression) {
        const result = this.#evaluateExpr(expressionAST);

        if (this.#isLiteral(result)) {
            return result.value;
        }
        else {
            return result;
        }
    }

    evaluateAndIterate(expressionAST:EvaluatableExpression) {
        const expr = this.#evaluateExpr(expressionAST) as EvaluatableExpression;
        const hookName = OPERATOR_HOOKS['ITERATE'];

        if (this.#isLiteral(expr)) {
            throw new OperatorNotSupportedError('iterate', expr);
        }
        else {
            const hook = this.#expressionEventHooks[hookName];
            if (hook) {
                try {
                    return hook(expr);
                }
                catch(e:any) {
                    throw new HookError(e, expr);
                }
            }
            else {
                throw new NoHookError(hookName, expr);
            }
        }
    }

    #evaluateExpr(expr:AnyExpression):AnyExpression {
        switch(expr.type) {
            case ExpressionType.CALL:
                return this.#evaluateCallExpr(expr);
            case ExpressionType.IDENTIFIER:
                return this.#evaluateIdentifier(expr);
            case ExpressionType.PARAM:
                return this.#evaluateParamExpr(expr);
            default:
                return expr;
        }
    }
    
    #evaluateIdentifier(expr:IdentifierExpression):ObjectExpression|LiteralExpression {
        const identifier = expr.value;

        let data;
        if (identifier.at(0) === ':') { // 내장 변수 처리
            const sliced = identifier.slice(1);
            if (sliced in this.#builtInVars) {
                data = this.#builtInVars[sliced];
            }
            else {
                throw new IdentifierResolveFail('Invalid built-in variable', expr);
            }
        }
        else {
            if (identifier in this.#currentScope) {
                data = this.#currentScope[identifier];
            }
            else if (identifier in this.#vars) {
                data = this.#vars[identifier];
            }
            else {
                throw new IdentifierResolveFail('Variable is not defined', expr);
            }
        }
        switch(typeof data) {
            case 'string':
            case 'number':
            case 'boolean':
                return {
                    type : ExpressionType.LITERAL,
                    value : data,
                    position : expr.position,
                    size : expr.size
                };
            case 'object':
            {
                const hookName = OPERATOR_HOOKS.OBJECTIFY;
                const objectify = this.#expressionEventHooks[hookName];
                if (objectify == null) {
                    throw new NoHookError(hookName, expr);
                }
                return {
                    type : ExpressionType.OBJECT,
                    value : objectify(data),
                    position : expr.position,
                    size : expr.size,
                };
            }
            default:
                throw new IdentifierResolveFail(
                    `Invalid variable type '${typeof data}'`,
                    expr
                );
        }
    }
    
    #evaluateCallExpr(expr:CallExpression):ObjectExpression|LiteralExpression {
        const operator = expr.value;
        const operand1 = this.#evaluateExpr(expr.operands[0]);
        const operand2 = this.#evaluateExpr(expr.operands[1]);
        
        const hookName = OPERATOR_HOOKS[operator]
        
        // 리터럴간 연산은 외부 hook를 사용하지 않음
        if (operand1.type === ExpressionType.LITERAL && this.#isLiteral(operand2)) {
            if (hookName in LITERAL_ACTIONS) {
                const caller = LITERAL_ACTIONS[hookName];
                const result = caller(operand1.value, operand2.value);

                return {
                    type : ExpressionType.LITERAL,
                    value : result,
                    position : expr.position,
                    size : expr.size
                };
            }
            else {
                throw new OperatorNotSupportedError(operator, expr);
            }
        }
        else {
            if (operator in OPERATOR_HOOKS) {
                const hookName = OPERATOR_HOOKS[operator]
                const hook = this.#expressionEventHooks[hookName];
                
                if (hook == null) {
                    throw new NoHookError(hookName, expr);
                }

                let result;
                if (operator === '()') {
                    if (!this.#isParam(operand2)) {
                        // 하위 단계(expr-parse)를 거친 정상 AST에서는 발생하지 않아야 함
                        throw new InvalidASTFormatError(
                            'No ParamExpression found',
                            expr
                        );
                    }

                    // call hook 시 (호출자, 인자 배열) 형태로 전달
                    result = this.#handleHookError(()=>hook(operand1, operand2.args), expr);
                }
                else {
                    result = this.#handleHookError(()=>hook(operand1, operand2), expr);
                }

                if (
                    typeof result === 'number' ||
                    typeof result === 'string' ||
                    typeof result === 'boolean'
                ) {
                    return {
                        type : ExpressionType.LITERAL,
                        value : result,
                        position : expr.position,
                        size : expr.size
                    };
                }
                else {
                    const hookName = OPERATOR_HOOKS.OBJECTIFY;
                    const objectify = this.#expressionEventHooks[hookName];
                    if (objectify == null) {
                        throw new NoHookError(hookName, expr);
                    }

                    const objectifed = this.#handleHookError(()=>objectify(result), expr);
                    return {
                        type : ExpressionType.OBJECT,
                        value : objectifed,
                        position : expr.position,
                        size : expr.size
                    };
                }
            }
            else {
                // 사용자 Hook에 관계없이 지원하는 Hook가 아닌 연산자 사용시 예외 처리
                // 하위 단계(expr-parse)를 거친 정상 AST에서는 발생하지 않아야 함
                throw new InvalidASTFormatError(
                    'Invalid operator',
                    expr
                );
            }
        }
    }

    #evaluateParamExpr(expr:ParamExpression):ParamExpression {
        const args:any[] = [];
        for(const child of expr.args) {
            args.push(this.#evaluateExpr(child));
        }
        return {
            type : ExpressionType.PARAM,
            args : args,
            position : expr.position,
            size : expr.size
        }
    }

    #isLiteral(expr):expr is LiteralExpression {
        return expr.type === ExpressionType.LITERAL;
    }
    #isParam(expr):expr is ParamExpression {
        return expr.type === ExpressionType.PARAM;
    }
    #handleHookError(callback:()=>any, expr) {
        try {
            return callback();
        }
        catch(e:any) {
            throw new HookError(e, expr);
        }
    }
}

export default Evaluator;

// let result: any;
// try {
//     result = caller(operand1.value, operand2.value);
// }
// catch(e:any) {
//     throw new HookError(e, expr);
// }