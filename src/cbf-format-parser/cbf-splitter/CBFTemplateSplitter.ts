import { DirectiveKeywords, Fragment, FragmentType } from './types';

export const RE_DIRECTIVE_MARKER = /(\{\{::.*?\}\})/ms
export const RE_DIRECTIVE = /\{\{\s*::\s*(\S+)(?:\s+(.*?))?\s*\}\}/ms
export const RE_EXPRESSION_MARKER = /(\{\{[^{}]*?\}\})/ms
export const RE_EXPRESSION = /\{\{\s*(.*?)\s*\}\}/ms

class CBFTemplateSplitter {
    #fragments:Fragment[] = [];
    #lastPosition = 0;

    constructor() {

    }

    spliteTemplate(template: string):Fragment[] {
        
        this.#resetFragments();
        try {
            const splitted = template.split(RE_DIRECTIVE_MARKER);
            for (const item of splitted) {
                this.#parseDirectiveSplitted(item);
            }
        }
        catch (e) {
            
        }

        return this.#fragments;
    }

    #resetFragments() {
        this.#fragments = [];
        this.#lastPosition = 0;
    }

    #addFragments(fragment: Fragment) {
        this.#fragments.push(fragment);
        this.#lastPosition += fragment.full_text.length;
    }

    #parseDirectiveSplitted(text: string) {
        let group: RegExpMatchArray | null;
        if (group = text.match(RE_DIRECTIVE)) {
            this.#addDirectiveFragment(group);
        }
        else {
            // directive 문법 앞뒤의 공백은 제거
            const {
                left, value, right,
            } = this.#trimText(text);

            this.#addTextFragment(left);

            const splitted = value.split(RE_EXPRESSION_MARKER);
            for (const item of splitted) {
                this.#parseExpressionSplitted(item);
            }

            this.#addTextFragment(right);
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

    #addTextFragment(text: string) {
        if (text.length !== 0) return;

        this.#addFragments({
            type : FragmentType.TEXT,
            full_text : text
        });
    }

    #addDirectiveFragment(directiveMatch: RegExpMatchArray) {
        const keyword = directiveMatch[1] as string;
        const field = directiveMatch[2] as string;
        
        if (keyword in DirectiveKeywords) {
            this.#addFragments({
                type : FragmentType.DIRECTIVE,
                full_text : directiveMatch[0],
                keyword : keyword as unknown as DirectiveKeywords,
                field : field,
            })
        }
        else {
            throw new Error(`Invalid keyword '${keyword}'`);
        }
    }

    #parseExpressionSplitted(text: string) {
        let group: RegExpMatchArray | null;
        if (group = text.match(RE_DIRECTIVE)) {
            this.#addExpressionFragment(group);
        }
        else {
            this.#addTextFragment(text);
        }
    }

    #addExpressionFragment(expressionMatch: RegExpMatchArray) {
        const expression = expressionMatch[1] as string;
        
        this.#addFragments({
            type : FragmentType.EXPRESSION,
            full_text : expressionMatch[0],
            expression : expression,
        })
    }
}