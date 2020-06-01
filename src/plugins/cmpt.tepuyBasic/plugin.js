import * as components from './components';

export class CmptTepuyBasic {
    constructor() {

    }

    registerComponents(register) {
        console.log('Register components invoked');
        register(components.HtmlBlock);
        register(components.ContentBox);
    }
}