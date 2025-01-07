import { Fragment, FragmentType } from "../template-splitter";

class NodeBuilder {
    #nodes:NodeAdder = new NodeAdder();

    constructor() {

    }

    build(fragments:Fragment[]) {
        
        for (const index in fragments) {
            const fragment = fragments[index];
            
            if (fragment.type === FragmentType.TEXT) {
                this.addText(fragment);
            }
            else {

            }
        }
        return [];
    }
}

class NodeAdder {
    addText(fragment:Fragment) {

    }
}