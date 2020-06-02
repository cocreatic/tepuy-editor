import { Component } from '../../../js/component';
import { _ } from '../../../js/utils';

export class InstructionBox extends Component {

    static get legacySelector() {
        return '.instruction';
    }

    constructor(element) { //All controls must receive the host element as a parameter, if no element or string provided, the element will be created but not added to the DOM
        super(element);
    }

    initialize() {
        const type = { name: 'type', type: 'optionList', options: ['info', 'danger', 'alert', 'none'], attr: 'type' };
        type.value = this.getAttribute(type.attr);

        _(this).properties = [type];
    }
}