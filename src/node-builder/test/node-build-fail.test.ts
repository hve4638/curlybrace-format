import NodeBuilder from '..';
import TemplateSplitter from '../../template-splitter';
import { expectCBFFail, getThrownError } from '../../test-utils';
import { CBFErrorType } from '../../types';

/**
 * NodeBuilder에서 발생할 수 있는 예외
 * 
 */
describe('NodeBuilder fail', () => {
    const splitter = new TemplateSplitter();
    const builder = new NodeBuilder();
    function build(text:string) {
        const fragments = splitter.spliteTemplate(text);
        return builder.build(fragments);
    }

    test('UNKNOWN_DIRECTIVE', () => {
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
    test('INVALID_TOKEN', () => {
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
    test('MISSING_ENDIF', () => {
        const text = 'text1 {{::IF 1 }} text2'
        const result = build(text);

        expectCBFFail(
            result.errors[0],
            CBFErrorType.MISSING_ENDIF,
            {
                text : '{{::IF 1 }}',
                positionBegin : 6,
                positionEnd : 17,
            }
        )
    });
    test('INVALID_FORMULA : multiple', () => {
        const text = '{{ + }} {{ - }}'
        const result = build(text);

        expectCBFFail(
            result.errors[0],
            CBFErrorType.INVALID_FORMULA,
            {
                text : '+',
                positionBegin : 3,
                positionEnd : 4,
            }
        );
        expectCBFFail(
            result.errors[1],
            CBFErrorType.INVALID_FORMULA,
            {
                text : '-',
                positionBegin : 11,
                positionEnd : 12,
            }
        )
    });
});