import { CBFFail, CBFFailHint } from '../../errors';
import { CBFErrorType } from '../../types';
import parseAST from '../parseAST';
import tokenize from '../tokenize';
import transformToken from '../transformToken';

export function generateTransformedTokens(expressionText:string) {
    const tokens = tokenize(expressionText);
    const transformed = transformToken(tokens);
    return transformed;
}

export function generateAST(expressionText:string) {
    const tokens = tokenize(expressionText);
    const transformed = transformToken(tokens);
    const ast = parseAST(transformed);
    return ast;
}

