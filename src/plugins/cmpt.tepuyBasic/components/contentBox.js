import { Component, ContainerComponent } from '../../../js/component';
import { _ } from '../../../js/utils';

export class ContentBox extends ContainerComponent {
    static get legacySelector() {
        return '.box-text';
    }

    constructor(element) { //All controls must receive the host element as a parameter, if no element or string provided, the element will be created but not added to the DOM
        super(element);
        //Initialize public properties
        this.host.classList.add('box-text');
    }

    initialize() {
        const type = {name: 'type', type: 'optionList', options: ['important', 'example', 'note', 'link', 'connection', 'activity']};
        const label = {name: 'label', type: 'text', attr: 'label'};

        type.value = this.classesInUse(type.options)[0] || '';
        label.value = this.getAttribute(label.attr);

        _(this).properties = [ type, label ];
    }
}