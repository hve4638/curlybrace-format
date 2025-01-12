import { CBFFail, CBFFailHint } from '../../errors';
import { CBFErrorType } from '../../types';
import Evaluator from '../Evaluator';
import { tokenize, transformToken, parseAST } from '../../expr-parse';
import type { ExpressionArgs } from '../types/expr-hooks';

export function evaluate(expressionText:string, exprArgs:ExpressionArgs) {
    const tokens = tokenize(expressionText);
    const transformed = transformToken(tokens);
    const ast = parseAST(transformed);

    const evaluator = new Evaluator(exprArgs);
    return evaluator.evaluate(ast);
}
export function evaluateAndStringify(expressionText:string, exprArgs:ExpressionArgs) {
    const tokens = tokenize(expressionText);
    const transformed = transformToken(tokens);
    const ast = parseAST(transformed);

    const evaluator = new Evaluator(exprArgs);
    return evaluator.evaluateAndStringify(ast);
}
export function evaluateAndIterate(expressionText:string, exprArgs:ExpressionArgs) {
    const tokens = tokenize(expressionText);
    const transformed = transformToken(tokens);
    const ast = parseAST(transformed);

    const evaluator = new Evaluator(exprArgs);
    return evaluator.evaluateAndIterate(ast);
}

export function getThrownError(callback:()=>any) {
    try {
        callback();
    } catch (error) {
        return error;
    }
    throw new Error('Expected error but no error was thrown');
}

export function expectCBFFail(
    actualError:unknown,
    failType:CBFErrorType,
    hint:CBFFailHint
) {
    expect(actualError).toBeInstanceOf(CBFFail);
    if (actualError instanceof CBFFail) {
        const actual = {
            text : actualError.text,
            type: actualError.type,
            positionBegin : actualError.positionBegin,
            positionEnd : actualError.positionEnd,
        }
        const expected = {
            type: failType,
            text : hint.text,
            positionBegin : hint.positionBegin,
            positionEnd : hint.positionEnd,
        }
        expect(actual).toEqual(expected);
    }
}
