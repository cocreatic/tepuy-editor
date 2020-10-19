import * as components from './components';

export class CmptTepuyBasic {
    constructor(app) {
        this.app = app;
    }

    registerComponents(register) {
        const ns = 'cmpt.tepuyBasic';
        register(components.HtmlBlock, ns);
        register(components.ContentBox, ns);
        register(components.InstructionBox, ns);
        register(components.InteractiveVideo, ns)
        register(components.ActivityQuiz, ns);
        register(components.ActivityDroppable, ns);
    }
}