import { Component, ComponentType } from '../../../js/component';
import { _ } from '../../../js/utils';

export class ContentBox extends Component {

    constructor(element) { //All controls must receive the host element as a parameter, if no element or string provided, the element will be created but not added to the DOM
        super(element);
        //Initialize public properties
        this.host.addClass('box-text');
    }

    get selector() {
        return '.box-text';
    }

    initialize() {
        const properties = [];
        const type = {name: 'type', type: 'optionList', options: ['important', 'example', 'note', 'link', 'connection', 'activity']};
        const title = {name: 'title', type: 'text', attr: 'label'};

        type.value = this.classesInUse(type.options)[0] || '';
        title.value = this.getAttribute(title.name);

        properties.push(type);
        properties.push(title);
        _(this).properties = properties;
    }
}