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

class Evaluator {
    #vars:Vars;
    #builtInVars:Vars;
    #scope:Vars;
    #expressionEventHooks:Partial<ExpressionEventHooks>;
    
    constructor(args:ExpressionArgs) {
        const {expressionEventHooks, vars, builtInVars, scope} = args;
        this.#expressionEventHooks = expressionEventHooks ?? {};
        this.#vars = vars ?? {};
        this.#scope = scope ?? {};
        this.#builtInVars = builtInVars ?? {};
    }

    evaluate(expressionAST:EvaluatableExpression):any {
        const expr = this.#evaluateExpr(expressionAST);

        return this.#getRawValue(expr);
    }

    evaluateAndStringify(expressionAST:EvaluatableExpression):string {
        const expr = this.#evaluateExpr(expressionAST) as EvaluatableExpression;

        if (this.#isLiteral(expr)) {
            return expr.value.toString();
        }
        else {
            const item = this.#getRawValue(expr);
            
            const hookName = OPERATOR_HOOKS.STRINGIFY;
            const hook = this.#expressionEventHooks[hookName];
            if (hook) {
                return hook(item);
            }
            else {
                throw new NoHookError(hookName, expr);
            }
        }
    }

    evaluateAndIterate(expressionAST:EvaluatableExpression):Iterator<any> {
        const expr = this.#evaluateExpr(expressionAST) as EvaluatableExpression;
        const hookName = OPERATOR_HOOKS.ITERATE;

        if (this.#isLiteral(expr)) {
            throw new OperatorNotSupportedError(hookName, expr);
        }
        else {
            const item = this.#getRawValue(expr);
            
            const hook = this.#expressionEventHooks[hookName];
            if (hook) {
                try {
                    return hook(item);
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
                throw new IdentifierResolveFail(`Invalid built-in variable '${sliced}'`, expr);
            }
        }
        else {
            if (identifier in this.#scope) {
                data = this.#scope[identifier];
            }
            else if (identifier in this.#vars) {
                data = this.#vars[identifier];
            }
            else {
                throw new IdentifierResolveFail(`Variable is not defined '${identifier}'`, expr);
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
            case 'function':
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

                    const rawValue1 = this.#getRawValue(operand1);
                    const rawArgs = this.#getRawValue(operand2);

                    // call hook 시 (호출자, 인자 배열) 형태로 전달
                    result = this.#handleHookError(()=>hook(rawValue1, rawArgs), expr);
                }
                else {                    
                    const rawValue1 = this.#getRawValue(operand1);
                    const rawValue2 = this.#getRawValue(operand2);

                    result = this.#handleHookError(()=>hook(rawValue1, rawValue2), expr);
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
    #getRawValue(expr:AnyExpression) {
        switch(expr.type) {
            case ExpressionType.LITERAL:
            case ExpressionType.OBJECT:
                return expr.value;
            case ExpressionType.PARAM:
                return expr.args.map((ex)=>this.#getRawValue(ex));
            default:
                throw new InvalidASTFormatError(
                    'Fail to parse raw value',
                    expr
                );
        }
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