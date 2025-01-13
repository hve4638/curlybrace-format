import { CBFFail, CBFFailHint } from '../errors';
import { CBFErrorType } from '../types';
import { DirectiveKeywords, Fragment, FragmentType } from '../types/fragment';
import {
    type DirectiveStruct,
    type ExpressionStruct,
    splitByDirective,
    splitByExpression,
    parseDirective,
    parseExpression,
} from './utils';

type Hint = {
    position: number;
    size: number;
    text: string;
}

class TemplateSplitter {
    #fragments:FragmentAdder = new FragmentAdder();
    
    spliteTemplate(template: string):Fragment[] {
        this.#fragments = new FragmentAdder();

        let position = 0;
        let size = 0;
        const splitted = splitByDirective(template);
        for (const item of splitted) {
            position += size;
            size = item.length;
            this.#parseDirectiveSplitted(item, {position, size, text:item});
        }
        return this.#fragments.result;
    }

    #parseDirectiveSplitted(text: string, hint:Hint) {
        let directive: DirectiveStruct | null;
        if (directive = parseDirective(text)) {
            this.#fragments.addDirective(directive, hint);
        }
        else {
            // directive 문법 앞뒤의 공백은 제거
            const {
                left, value, right,
            } = this.#trimText(text);

            this.#fragments.addPosition(left.length);

            const splitted = splitByExpression(value);
            for (const item of splitted) {
                this.#parseExpressionSplitted(item, hint);
            }

            this.#fragments.addPosition(right.length);
        }
    }

    #trimText(text:string) {
        const leftTrimmed = text.trimStart();
        const trimmed = leftTrimmed.trimEnd();
        const originalLength = text.length;
        const leftLength = originalLength - leftTrimmed.length;
        const rightLength = originalLength - leftLength - trimmed.length;
        
        return {
            left : text.slice(0, leftLength),
            value : trimmed,
            right : leftTrimmed.slice(originalLength-rightLength)
        }
    }

    #parseExpressionSplitted(text: string, hint:Hint) {
        let expression: ExpressionStruct | null;
        if (expression = parseExpression(text)) {
            this.#fragments.addExpression(expression, hint);
        }
        else {
            this.#fragments.addText(text, hint);
        }
    }
}

class FragmentAdder {
    #fragments:Fragment[] = [];
    #position = 0;

    get result() {
        return this.#fragments;
    }

    /** Fragment는 추가하지 않고 position만 변경 */
    addPosition(size: number) {
        this.#position += size;
    }
    
    #add(fragment:Omit<Fragment, 'position'|'size'>) {
        this.#fragments.push({
            ...fragment,
            position : this.#position,
            size : fragment.full_text.length
        } as Fragment);
        this.#position += fragment.full_text.length;
    }

    addExpression(expression: ExpressionStruct, hint:Hint) {
        this.#add({
            type : FragmentType.EXPRESSION,
            full_text : expression.full_text,
            expression_text : expression.expression_text,
            expression_text_left : expression.expression_text_left
        } as Fragment);
    }

    addDirective(directive: DirectiveStruct, hint:Hint) {
        const keyword = directive.keyword.toUpperCase();
        
        this.#add({
            type : FragmentType.DIRECTIVE,
            full_text : directive.full_text,
            keyword : keyword as DirectiveKeywords,
            keyword_left : directive.keyword_left,
            field : directive.field,
            field_left : directive.field_left,
        } as Fragment);
    }
    
    addText(text: string, hint:Hint) {
        if (text.length === 0) return;

        this.#add({
            type : FragmentType.TEXT,
            full_text : text
        });
    }
}

export default TemplateSplitter;