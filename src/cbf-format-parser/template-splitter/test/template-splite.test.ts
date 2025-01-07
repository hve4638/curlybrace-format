import TemplateSplitter, { DirectiveKeywords, Fragment, FragmentType } from '../';

describe('TemplateSplite', () => {
    const splitter = new TemplateSplitter();

    test('text', () => {
        const template = 'hello world';
        const actual = splitter.spliteTemplate(template);
        const expected = [
            {
                type: FragmentType.TEXT,
                full_text: 'hello world',
                position: 0,
                size: 11
            }
        ]
        expect(actual).toEqual(expected);
    });

    test('text (trimmed)', () => {
        const template = '   hello world   ';
        const actual = splitter.spliteTemplate(template);
        const expected = [
            {
                type: FragmentType.TEXT,
                full_text: 'hello world',
                position: 3,
                size: 11
            }
        ]
        expect(actual).toEqual(expected);
    });

    test('directive', () => {
        const template = '{{:: ROLE user}}';
        const actual = splitter.spliteTemplate(template);
        const expected:Fragment[] = [
            {
                type: FragmentType.DIRECTIVE,
                full_text: '{{:: ROLE user}}',
                keyword: DirectiveKeywords.ROLE,
                field: 'user',
                position: 0,
                size: 16,
            }
        ]
        expect(actual).toEqual(expected);
    });

    test('expression', () => {
        const template = '{{ 1 + 2 * 3 }}';
        const actual = splitter.spliteTemplate(template);
        const expected:Fragment[] = [
            {
                type: FragmentType.EXPRESSION,
                full_text: '{{ 1 + 2 * 3 }}',
                expression_text : '1 + 2 * 3',
                position: 0,
                size: 15,
            }
        ]
        expect(actual).toEqual(expected);
    });

    test('mixed', () => {
        const template = '{{:: ROLE user}} hello {{ num }}';
        const actual = splitter.spliteTemplate(template);
        const expected:Fragment[] = [
            {
                type: FragmentType.DIRECTIVE,
                full_text: '{{:: ROLE user}}',
                keyword: DirectiveKeywords.ROLE,
                field: 'user',
                position: 0,
                size: 16,
            },
            {
                type: FragmentType.TEXT,
                full_text: 'hello ',
                position: 17,
                size: 6
            },
            {
                type: FragmentType.EXPRESSION,
                full_text: '{{ num }}',
                expression_text : 'num',
                position: 23,
                size: 9,
            }
        ]
        expect(actual).toEqual(expected);
    });
});