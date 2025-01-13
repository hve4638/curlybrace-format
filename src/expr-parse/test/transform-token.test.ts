import { tokenize, transformToken } from '..';
import { Tokens } from '../Tokens';

const transform = (expressionText:string) => {
    return transformToken(tokenize(expressionText));
}
describe('transform-postfix test', () => {
    test('number', ()=>{
        const actual = transform('1 + 2 - 3');
        const expected = [
            Tokens.number('1', { position: 0, size: 1 }),
            Tokens.number('2', { position: 4, size: 1 }),
            Tokens.operator('+', { position: 2, size: 1 }),
            Tokens.number('3', { position: 8, size: 1 }),
            Tokens.operator('-', { position: 6, size: 1 }),
        ]
        expect(actual).toEqual(expected);
    });
    test('number with precedence', ()=>{
        const actual = transform('1 + 2 * 3 % 5');
        const expected = [
            Tokens.number('1', { position: 0, size: 1 }),
            Tokens.number('2', { position: 4, size: 1 }),
            Tokens.number('3', { position: 8, size: 1 }),
            Tokens.operator('*', { position: 6, size: 1 }),
            Tokens.number('5', { position: 12, size: 1 }),
            Tokens.operator('%', { position: 10, size: 1 }),
            Tokens.operator('+', { position: 2, size: 1 }),
        ]
        expect(actual).toEqual(expected);
    });
    test('string', ()=>{
        const actual = transform('"hello" + \'world\'');
        const expected = [
            Tokens.string('"hello"', { position: 0, size: 7 }),
            Tokens.string('\'world\'', { position: 10, size: 7 }),
            Tokens.operator('+', { position: 8, size: 1 }),
        ]
        expect(actual).toEqual(expected);
    });
    test('function', ()=>{
        const actual = transform('function()');
        const expected = [
            Tokens.identifier('function', { position: 0, size: 8 }),
            Tokens.param(),
            Tokens.operator('()', { position: 8, size: 2 }),
        ]
        expect(actual).toEqual(expected);
    })
    test('function with args', ()=>{
        const actual = transform('function(1, 2 + 3)');
        const expected = [
            Tokens.identifier('function', { position: 0, size: 8 }),
            Tokens.param(),
            Tokens.number('1', { position: 9, size: 1 }),
            Tokens.number('2', { position: 12, size: 1 }),
            Tokens.number('3', { position: 16, size: 1 }),
            Tokens.operator('+', { position: 14, size: 1 }),
            Tokens.operator('()', { position: 8, size: 10 }),
        ]
        expect(actual).toEqual(expected);
    });
    test('sum with function', ()=>{
        const actual = transform('sum(1, 2) + 3');
        const expected = [
            Tokens.identifier('sum', { position: 0, size: 3 }),
            Tokens.param(),
            Tokens.number('1', { position: 4, size: 1 }),
            Tokens.number('2', { position: 7, size: 1 }),
            Tokens.operator('()', { position: 3, size: 6 }),
            Tokens.number('3', { position: 12, size: 1 }),
            Tokens.operator('+', { position: 10, size: 1 }),
        ]
        expect(actual).toEqual(expected);
    })
    test('indexor 0', ()=>{
        const actual = transform('array[0]');
        const expected = [
            Tokens.identifier('array', { position: 0, size: 5 }),
            Tokens.number('0', { position: 6, size: 1 }),
            Tokens.operator('[]', { position: 5, size: 3 }),
        ]
        expect(actual).toEqual(expected);
    });
    test('indexor 1', ()=>{
        const actual = transform('array[i + 1]');
        const expected = [
            Tokens.identifier('array', { position: 0, size: 5 }),
            Tokens.identifier('i', { position: 6, size: 1 }),
            Tokens.number('1', { position: 10, size: 1 }),
            Tokens.operator('+', { position: 8, size: 1 }),
            Tokens.operator('[]', { position: 5, size: 7 }),
        ]
        expect(actual).toEqual(expected);
    });
    test('chain 1', ()=>{
        const actual = transform('data.get()');
        const expected = [
            Tokens.identifier('data', { position: 0, size: 4 }),
            Tokens.identifier('get', { position: 5, size: 3 }),
            Tokens.operator('.', { position: 4, size: 1 }),
            Tokens.param(),
            Tokens.operator('()', { position: 8, size: 2 }),
        ]
        expect(actual).toEqual(expected);
    });
    test('chain 2', ()=>{
        const actual = transform('data.get()[1][2]');
        const expected = [
            Tokens.identifier('data', { position: 0, size: 4 }),
            Tokens.identifier('get', { position: 5, size: 3 }),
            Tokens.operator('.', { position: 4, size: 1 }),
            Tokens.param(),
            Tokens.operator('()', { position: 8, size: 2 }),
            Tokens.literal(1, { position: 11, size: 1 }),
            Tokens.operator('[]', { position: 10, size: 3 }),
            Tokens.literal(2, { position: 14, size: 1 }),
            Tokens.operator('[]', { position: 13, size: 3 }),
        ]
        expect(actual).toEqual(expected);
    });
});
