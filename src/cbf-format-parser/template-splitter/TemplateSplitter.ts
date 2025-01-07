import { DirectiveKeywords, Fragment, FragmentType } from './types';

export const RE_DIRECTIVE_MARKER = /(\{\{::.*?\}\})/ms
export const RE_DIRECTIVE = /\{\{\s*::\s*(\S+)(?:\s+(.*?))?\s*\}\}/ms
export const RE_EXPRESSION_MARKER = /(\{\{[^{}]*?\}\})/ms
export const RE_EXPRESSION = /\{\{\s*(.*?)\s*\}\}/ms

class TemplateSplitter {
    #fragments:FragmentAdder = new FragmentAdder();
    
    spliteTemplate(template: string):Fragment[] {
        this.#fragments = new FragmentAdder();

        const splitted = template.split(RE_DIRECTIVE_MARKER);
        for (const item of splitted) {
            this.#parseDirectiveSplitted(item);
        }
        return this.#fragments.result;
    }

    #parseDirectiveSplitted(text: string) {
        let group: RegExpMatchArray | null;
        if (group = text.match(RE_DIRECTIVE)) {
            this.#fragments.addDirective(group);
        }
        else {
            // directive 문법 앞뒤의 공백은 제거
            const {
                left, value, right,
            } = this.#trimText(text);

            this.#fragments.addPosition(left.length);

            const splitted = value.split(RE_EXPRESSION_MARKER);
            for (const item of splitted) {
                this.#parseExpressionSplitted(item);
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

    #parseExpressionSplitted(text: string) {
        let group: RegExpMatchArray | null;
        if (group = text.match(RE_EXPRESSION)) {
            this.#fragments.addExpression(group);
        }
        else {
            this.#fragments.addText(text);
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

    addExpression(expressionMatch: RegExpMatchArray) {
        const expression = expressionMatch[1] as string; // 내부 표현식
        
        this.#add({
            type : FragmentType.EXPRESSION,
            full_text : expressionMatch[0],
            expression_text : expression,
        } as Fragment);
    }

    addDirective(directiveMatch: RegExpMatchArray) {
        const keyword = directiveMatch[1] as string;
        const field = directiveMatch[2] as string;
        
        if (keyword in DirectiveKeywords) {
            this.#add({
                type : FragmentType.DIRECTIVE,
                full_text : directiveMatch[0],
                keyword : keyword as DirectiveKeywords,
                field : field,
            } as Fragment);
        }
        else {
            throw new Error(`Invalid keyword '${keyword}'`);
        }
    }
    
    addText(text: string) {
        if (text.length === 0) return;

        this.#add({
            type : FragmentType.TEXT,
            full_text : text
        });
    }
}

export default TemplateSplitter;