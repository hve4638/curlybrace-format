import {
    splitByDirective,
    splitByExpression,
    parseDirective,
    parseExpression
} from '../utils';

describe('TemplatePattern', () => {
    test('splitByDirective', () => {
        const template = 'text1 {{::diretive1}} text2 text3 {{::diretive2}} text4';
        const actual = splitByDirective(template);
        const expected = [
            'text1 ',
            '{{::diretive1}}',
            ' text2 text3 ',
            '{{::diretive2}}',
            ' text4'
        ]
        expect(actual).toEqual(expected);
    });

    test('splitByExpression', () => {
        const template = 'text1 {{expr1}} text2 text3 {{expr1}} text4';
        const actual = splitByExpression(template);
        const expected = [
            'text1 ',
            '{{expr1}}',
            ' text2 text3 ',
            '{{expr1}}',
            ' text4'
        ]
        expect(actual).toEqual(expected);
    });

    test('parseDirective', () => {
        const text = '{{::keyword field}}';
        const actual = parseDirective(text);
        const expected = {
            full_text : '{{::keyword field}}',
            keyword : 'keyword',
            keyword_left : '{{::',
            field : 'field',
            field_left : '{{::keyword ',
        }
        expect(actual).toEqual(expected);
    });

    test('parseExpression', () => {
        const text = '{{ expression }}';
        const actual = parseExpression(text);
        const expected = {
            full_text : '{{ expression }}',
            expression_text : 'expression',
            expression_text_left : '{{ ',
        }
        expect(actual).toEqual(expected);
    });
});