import { CBFNode, CBFResult, CBFParserExecuteArgs } from './types';
import TemplateSplitter from './template-splitter';
import NodeBuilder from './node-builder';
import { execute } from './cbf-execute';

class CBFParser {
    #cache:Map<string, CBFNode[]> = new Map();
    #templateSplitter:TemplateSplitter = new TemplateSplitter();
    #nodeBuilder:NodeBuilder = new NodeBuilder();

    build(text: string):CBFNode[] {
        if (this.#cache.has(text)) {
            return this.#cache.get(text)!;
        }
        const fragments = this.#templateSplitter.spliteTemplate(text);
        const nodes = this.#nodeBuilder.build(fragments);
        this.#cache.set(text, nodes);
        return nodes;
    }

    execute(nodes:CBFNode[], executeArgs:CBFParserExecuteArgs):Generator<CBFResult> {
        return execute(nodes, executeArgs);
    }
}


export default CBFParser;