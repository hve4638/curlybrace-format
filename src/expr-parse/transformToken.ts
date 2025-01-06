import { Tokens } from './Tokens';
import { RawToken } from './types/tokenize';
import {
    OPERATOR_PRECEDENCE,
    EXCEPT_PRECEDENCE,
    HIGHEST_PRECEDENCE,
    ParenType,
} from './types/transform';
import type {
    Token, TokenType
} from './types/token';
import { CBFFail, CBFLogicError } from '../errors';
import { InvalidTokenError, MultipleExpressionError, TokenMissingError, TransfromPostfixFail } from './errors';

const UNKNOWN_HINT = {} as any;

function transformToken(tokens:RawToken[]):Token[] {
    const stacks = new TokenStacks();

    let position = 0;

    // ()이 함수 호출인지, 우선순위 처리인지 확인
    let isLastTokenExpression = false;

    for (const token of tokens) {
        const size = token.value.length;
        try {
            switch(token.type) {
            case 'NUMBER':
                stacks.add(Tokens.number(token.value, { position, size }));
                isLastTokenExpression = true;
                break;
            case 'STRING':
                stacks.add(Tokens.string(token.value, { position, size }));
                isLastTokenExpression = true;
                break;
            case 'IDENTIFIER':
                stacks.add(Tokens.identifier(token.value, { position, size }));
                isLastTokenExpression = true;
                break;
            case 'INDEXOR':
                if (token.value === '[') {
                    stacks.addOperator('[', false, { position, size });
                }
                else if (token.value === ']') {
                    const beginIndexor = stacks.moveOperatorUntilChar('[');
                    stacks.add(Tokens.operator('[]', {
                        position : beginIndexor.position,
                        size : size + position - beginIndexor.position,
                    }));
                }
                isLastTokenExpression = false;
                break;
            case 'OPERATOR':
                stacks.addOperator(token.value, false, { position, size });
                isLastTokenExpression = false;
                break;
            case 'DELIMITER':
                // ',' 는 함수 인자 구분자로만 사용
                if (stacks.lastParenType !== ParenType.FUNCTION) {
                    throw new MultipleExpressionError(
                        'Multiple value in a single expression are not allowed',
                        UNKNOWN_HINT
                    );
                }
                break;
            case 'PAREN':
                if (token.value === '(') {
                    if (isLastTokenExpression) {
                        stacks.addOpenParen(ParenType.FUNCTION, { position, size });
                    }
                    else {
                        stacks.addOpenParen(ParenType.EXPRESSION, { position, size });
                    }
                }
                else if (token.value === ')') {
                    stacks.addCloseParen({ position, size });
                }
                isLastTokenExpression = false;
                break;
            case 'SPACE':
                break;
            default:
                throw new InvalidTokenError('Invalid Token', UNKNOWN_HINT);
            }
        }
        catch(e:unknown) {
            if (e instanceof CBFFail) {
                const text = token.value;
                throw new TransfromPostfixFail(
                    e.message,
                    e.type,
                {
                    text,
                    positionBegin : position,
                    positionEnd : position + text.length,
                });
            }
            else {
                throw e;
            }
        }
        
        position += token.value.length;
    }

    stacks.moveOperatorAll();
    return stacks.result;
}

class TokenStacks {
    #result:Token[] = [];
    #operatorStack:{ operator:string, position:number, size:number }[] = [];
    #parenStack:ParenType[] = [];

    get result() {
        return this.#result;
    }

    get lastParenType() {
        return this.#parenStack.at(-1);
    }

    add(token:Token) {
        this.#result.push(token);
    }

    addOperator(operator:string, noPrecedenceCheck:boolean, hint:{position:number, size:number}) {
        if (!noPrecedenceCheck && OPERATOR_PRECEDENCE[operator] !== EXCEPT_PRECEDENCE) {
            this.moveOperatorUntilLowerPrecedence(operator);
        }
        this.#operatorStack.push({operator, ...hint});
    }

    addOpenParen(parenType:ParenType, hint:{position:number, size:number}) {
        this.#parenStack.push(parenType);
        if (parenType === ParenType.EXPRESSION) {
            this.addOperator('(', true, hint);
        }
        else if (parenType === ParenType.FUNCTION) {
            this.moveOperatorUntilLowerPrecedence(HIGHEST_PRECEDENCE);
            this.add(Tokens.param());
            this.addOperator('(', true, hint);
        }
        else {
            throw new CBFLogicError(
                'Logic Error (SyntaxTokenStacks.addOpenParen)',
                UNKNOWN_HINT,
            )
        }
    }
    addCloseParen(hint:{position:number, size:number}):void {
        const parenType = this.#parenStack.pop();
        if (parenType === ParenType.EXPRESSION) {
            this.moveOperatorUntilChar('(');
        }
        else if (parenType === ParenType.FUNCTION) {
            const beginParen = this.moveOperatorUntilChar('(');
            const parenHint = {
                position: beginParen.position,
                size: hint.position + hint.size - beginParen.position,
            }
            this.addOperator('()', false, parenHint);
            this.#moveOperator();
        }
        else {
            throw new CBFLogicError(
                `Logic Error (SyntaxTokenStacks.addCloseParen) : ParenType '${parenType}'`,
                UNKNOWN_HINT,
            )
        }
    }

    moveOperatorUntilLowerPrecedence(target:string|number) {
        let targetPrecedence = 0;
        
        if (typeof target === 'string') {
            targetPrecedence = OPERATOR_PRECEDENCE[target];    
        }
        else {
            targetPrecedence = target;
        }
        
        while (
            !this.#isOperatorStackEmpty()
            && OPERATOR_PRECEDENCE[this.#topOperatorStack().operator] !== EXCEPT_PRECEDENCE
            && OPERATOR_PRECEDENCE[this.#topOperatorStack().operator] >= targetPrecedence) {
            this.#moveOperator();
        }
    }

    moveOperatorAll() {
        while (!this.#isOperatorStackEmpty()) {
            this.#moveOperator();
        }
    }

    // 타겟 operator를 찾을 때까지 operatorStack -> resultStack으로 이동
    // 타겟 operator는 추가되지 않고 반환
    moveOperatorUntilChar(target:string) {
        while (!this.#isOperatorStackEmpty() && this.#topOperatorStack().operator !== target) {
            this.#moveOperator();
        }
        
        if (this.#isOperatorStackEmpty()) {
            // char를 찾지 못한 경우
            throw new TokenMissingError(
                `Token '${target}' not found`,
                UNKNOWN_HINT,
            );
        }
        else {
            return this.#operatorStack.pop()!;
        }
    }

    #moveOperator() {
        const op = this.#operatorStack.pop()!;
        this.add(Tokens.operator(op.operator, { position: op.position, size: op.size }));
    }

    #isOperatorStackEmpty() {
        return this.#operatorStack.length == 0;
    }

    #topOperatorStack() {
        return this.#operatorStack[this.#operatorStack.length-1];
    }
}

export default transformToken;