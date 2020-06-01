import { Component } from '../../../js/component';
import { _ } from '../../../js/utils';

console.log(Component);

export class HtmlBlock extends Component {

    static get legacySelector() {
        return ':not([data-cmpt-type])';
    }

    constructor(element) { //All controls must receive the host element as a parameter, if no element or string provided, the element will be created but not added to the DOM
        super(element);
    }

    initialize() {
        const properties = [];
        _(this).properties = properties;
    }
}