import { CBFNode, CBFResult, CBFParserExecuteArgs } from './types';
import TemplateSplitter from './template-splitter';
import NodeBuilder from './node-builder';
import { execute } from './cbf-execute';
import { CBFFail } from './errors';

class CBFParser {
    #cache:Map<string, { nodes:CBFNode[], errors:CBFFail[] }> = new Map();
    #templateSplitter:TemplateSplitter = new TemplateSplitter();
    #nodeBuilder:NodeBuilder = new NodeBuilder();

    build(text: string):{ nodes:CBFNode[], errors:CBFFail[] } {
        if (this.#cache.has(text)) {
            return this.#cache.get(text)!;
        }
        const fragments = this.#templateSplitter.spliteTemplate(text);
        const result = this.#nodeBuilder.build(fragments);
        this.#cache.set(text, result);
        return result;
    }

    execute(nodes:CBFNode[], executeArgs:CBFParserExecuteArgs):Generator<CBFResult> {
        return execute(nodes, executeArgs);
    }
}


export default CBFParser;