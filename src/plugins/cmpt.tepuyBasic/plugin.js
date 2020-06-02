import * as components from './components';

export class CmptTepuyBasic {
    constructor() {

    }

    registerComponents(register) {
        register(components.HtmlBlock);
        register(components.ContentBox);
        register(components.InstructionBox);
    }
}