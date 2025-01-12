import Evaluator from '../Evaluator';
import {
    ExpressionType, 
    LiteralExpression, 
    ObjectExpression,
    ParamExpression,
} from '../../expr-parse/types/expressions';
import type { ExpressionArgs, ExpressionEventHooks } from '../types/expr-hooks';
import { tokenize, transformToken, parseAST } from '../../expr-parse';
import {
    evaluate,
    evaluateAndIterate,
    evaluateAndStringify,
} from './utils'

const EMPTY_ARGS = {
    vars : {},
    expressionEventHooks : {},
    builtInVars:{},
    scope : {}
} as ExpressionArgs;

describe('Evaluate Test', () => {
    test('number literal', ()=>{
        const actual = evaluate('10', EMPTY_ARGS);
        
        expect(actual).toEqual(10);
    });
    test('string literal', ()=>{
        const actual = evaluate('"hello world"', EMPTY_ARGS);

        expect(actual).toEqual('hello world');
    });
    test('operation', ()=>{
        const actual = evaluate('1 + 2', EMPTY_ARGS);
        
        expect(actual).toEqual(3);
    });
    test('variable', ()=>{
        const actual = evaluate('num', {
            ...EMPTY_ARGS,
            vars : {
                'num' : 5
            }
        });
        
        expect(actual).toEqual(5);
    });
    test('variable + literal sum', ()=>{
        const actual = evaluate('num + 5', {
            ...EMPTY_ARGS,
            vars : {
                'num' : 5
            }
        })

        expect(actual).toEqual(10);
    });
});

describe('Iterate Test', () => {
    const hooks:Partial<ExpressionEventHooks> =  {
        indexor(array, index) {
            if (Array.isArray(array)) {
                return array[index];
            }
            else {
                throw new Error(`${array} is not an array`);
            }
        },
        access(obj, index) {
            if (obj == null) {
                throw new Error('obj is null');
            }
            else if (typeof(obj) !== 'object') {
                throw new Error(`${obj} is not an object`);
            }
            else {
                return obj[index];
            }
        },
        call(caller, args:unknown[]) {
            if (typeof(caller) === 'function') {
                return caller.apply({}, args);
            }
            else {
                throw new Error('caller is not a function');
            }
        },
        objectify(value) {
            return value;
        },
        iterate(array) {
            if (Array.isArray(array)) {
                return array.values();
            }
            else {
                throw new Error(`${array} is not an array`);
            }
        }
    }

    const iterateResult = (iterator:Iterator<any>)=>{
        const result:any[] = [];
        while (true) {
            const next = iterator.next();
            if (next.done) {
                break;
            }
            result.push(next.value);
        }
        return result;
    }

    test('array', ()=>{
        const result = evaluateAndIterate('array', {
            ...EMPTY_ARGS,
            vars : {
                'array' : [0, 1, 2, 3]
            },
            expressionEventHooks : hooks
        });
        
        const actual = iterateResult(result);
        const expected = [0, 1, 2, 3];

        expect(actual).toEqual(expected);
    });
});