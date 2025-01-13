import NodeBuilder from '..';
import TemplateSplitter from '../../template-splitter';
import { expectCBFFail, getThrownError } from '../../test-utils';
import { CBFErrorType } from '../../types';

describe('NodeBuilder', () => {
    const splitter = new TemplateSplitter();
    const builder = new NodeBuilder();
    function build(text:string) {
        const fragments = splitter.spliteTemplate(text);
        return builder.build(fragments);
    }

    test('unknown directive', () => {
        const text = 'text {{::BUG user}}'
        const result = build(text);

        expectCBFFail(
            result.errors[0],
            CBFErrorType.UNKNOWN_DIRECTIVE,
            {
                text : '{{::BUG user}}',
                positionBegin : 5,
                positionEnd : 19,
            }
        )
    });
    test('invalid expression', () => {
        const text = 'text {{ 0a }}'
        const result = build(text);

        expectCBFFail(
            result.errors[0],
            CBFErrorType.INVALID_TOKEN,
            {
                text : '0a',
                positionBegin : 8,
                positionEnd : 10,
            }
        )
    });
    test('no endif', () => {
        const text = 'text1 {{::IF 1 }} text2'
        const result = build(text);

        expectCBFFail(
            result.errors[0],
            CBFErrorType.MISSING_FRAGMENT,
            {
                text : '{{::IF 1 }}',
                positionBegin : 6,
                positionEnd : 17,
            }
        )
    });
    test('multiple error', () => {
        const text = '{{ + }} {{ - }}'
        const result = build(text);

        expectCBFFail(
            result.errors[0],
            CBFErrorType.INVALID_TOKEN,
            {
                text : '+',
                positionBegin : 3,
                positionEnd : 4,
            }
        )
        expectCBFFail(
            result.errors[1],
            CBFErrorType.INVALID_TOKEN,
            {
                text : '-',
                positionBegin : 11,
                positionEnd : 12,
            }
        )
    });
});