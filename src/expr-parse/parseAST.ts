import { InvalidCallExpressionFormatError, InvalidOperandError, NoExpressionError, UnhandleExpressionRemainError } from './errors';
import {
    ExpressionType,
    EvaluatableExpression,
    ParamExpression,
    LiteralExpression,
    IdentifierExpression,
    AnyExpression,
    CallExpression
} from './types/expressions';
import {
    OperatorToken,
    Token,
    TokenType
} from './types/token';

function parseAST(tokens:Token[]):EvaluatableExpression {
    return new ASTParser(tokens).parse();
}

class ASTParser {
    #tokens:Token[];
    #output:(AnyExpression|Token)[];

    constructor(tokens:Token[]) {
        this.#tokens = tokens;
        this.#output = [];
    }

    parse():EvaluatableExpression {
        this.#output = [];

        for(const token of this.#tokens) {
            if (token.type === TokenType.OPERATOR) {
                if (token.value === '()') {
                    this.#parseCallOperator(token);
                }
                else {
                    this.#parseBinaryOperator(token);
                }
            }
            else {
                this.#output.push(token);
            }
        }

        if (this.#output.length === 1) {
            return this.#output[0] as EvaluatableExpression;
        }
        else if (this.#output.length === 0) {
            throw new NoExpressionError('Invalid expression', {
                positionBegin: 0,
                positionEnd: 0,
                text: '',
            });
        }
        else {
            // 여러 표현식 리턴시 이곳에 도달
            // 정상적인 입력의 경우 이곳에 도달하지 않음
            throw new UnhandleExpressionRemainError('Unhandled token remaining', {
                positionBegin: 0,
                positionEnd: 0,
                text: '',
            });
        }
    }

    #parseBinaryOperator(token:OperatorToken) {
        // 이항 연산자 처리 메서드
        // [operand1, operand2, operator] 형태이며
        // operator는 외부에서 pop() 되어 인자로 전달됨
        let operand2 = this.#output.pop() as AnyExpression;
        const operand1 = this.#output.pop() as EvaluatableExpression;
        
        if (operand1 == null || operand2 == null) {
            throw new InvalidOperandError(`Invalid operand (null)`,{
                text: token.value,
                positionBegin: token.position,
                positionEnd: token.position + token.size,
            });
        }
        else if (operand2.type === TokenType.PARAM) {
            throw new InvalidOperandError(`Invalid operand : right operand is param`, {
                positionBegin: operand2.position,
                positionEnd: operand2.position + operand2.size,
                text: '',
            });
        }
        if (token.value === '.') {
            // access 연산의 operand2는 토크나이저에서 IDENTIFIER로 분류하지만
            // 실제로는 문자열을 통해 엑세스하므로 LITERAL로 변환 필요
            if (this.#isIdentifierExpression(operand2)) {
                operand2 = {
                    type: ExpressionType.LITERAL,
                    value: operand2.value,
                    position: operand2.position,
                    size: operand2.size,
                } as LiteralExpression;
            }
            else {
                throw new InvalidOperandError(
                    `Invalid operand : right operand '${operand2.value}' is not identifier`,
                {
                    positionBegin: token.position,
                    positionEnd: token.position + token.size,
                    text: token.value,
                });
            }
        }

        const operands = [operand1, operand2];
        const expr = this.#getOperatorExpression(
            token.value,
            operands,
            {
                position: operand1.position,
                size: (
                    operand2.size + operand2.position - operand1.position
                    + (token.value === '[]' ? 1 : 0) 
                ),
            }
        )
        this.#output.push(expr);
    }

    #parseCallOperator(token:OperatorToken) {
        // [caller, [PARAM], param1, param2, ..., ()] 형태
        // '()' 는 외부에서 pop() 되어 인자로 전달됨
        const args:EvaluatableExpression[] = [];
        
        while(this.#output.length > 0 && this.#output.at(-1)?.type !== TokenType.PARAM) {
            args.unshift(this.#output.pop() as EvaluatableExpression);
        }

        if (this.#output.length == 0) {
            // PARAM 토큰 누락시

            throw new InvalidCallExpressionFormatError(
                'Invalid CallExpression format',
                {
                    text: token.value,
                    positionBegin: token.position,
                    positionEnd: token.position + token.size,
                }
            );
        }
        this.#output.pop(); // PARAM 토큰

        const caller = this.#output.pop() as EvaluatableExpression;
        this.#output.push(
            this.#getOperatorExpression(
                token.value, // '()'
                [
                    caller,
                    {
                        type : ExpressionType.PARAM,
                        args : args
                    } as ParamExpression
                ],
                {
                    position: caller.position,
                    size: token.size + token.position - caller.position,
                }
            )
        )
    }

    #getOperatorExpression(value:string, operands:AnyExpression[], hint:{position:number,size:number}):CallExpression {
        return {
            type: ExpressionType.CALL,
            value: value,
            operands : operands,
            ...hint,
        };
    }

    #isIdentifierExpression(expr:AnyExpression):expr is IdentifierExpression {
        return expr.type === 'IDENTIFIER';
    }
}

export default parseAST;