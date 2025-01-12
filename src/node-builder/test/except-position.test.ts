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
        const actual = getThrownError(() => build(text));

        expectCBFFail(
            actual,
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
        const actual = getThrownError(() => build(text));

        expectCBFFail(
            actual,
            CBFErrorType.INVALID_TOKEN,
            {
                text : '0a',
                positionBegin : 8,
                positionEnd : 10,
            }
        )
    });
});