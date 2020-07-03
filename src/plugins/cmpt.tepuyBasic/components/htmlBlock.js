import { Component, ComponentType } from '../../../js/component';
import { _ } from '../../../js/utils';

export class HtmlBlock extends Component {

    static get legacySelector() {
        return ':not([data-cmpt-type])';
    }

    static get type() {
        return ComponentType.TEXTBLOCK;
    }

    constructor(element) { //All controls must receive the host element as a parameter, if no element or string provided, the element will be created but not added to the DOM
        super(element);
        this.setPropertyValue('content', element ? element.innerHTML : '&nbsp;'); //Required because during super, innerHTML is not cloned
    }

    initialize() {
        const content = {name: 'content', type: 'html', prop: 'innerHTML', editSettings: { label: 'cmpt.tepuyBasic:html-block.content' }};
        _(this).properties = [content];
    }
}