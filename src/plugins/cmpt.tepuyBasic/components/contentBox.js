import { Component, ComponentType, ContainerComponent } from '../../../js/component';
import { _ } from '../../../js/utils';

export class ContentBox extends ContainerComponent {
    static get legacySelector() {
        return '.box-text';
    }

    static get type() {
        return ComponentType.TEXTBLOCK;
    }

    static get tepuyPluginName() {
        return 'tepuyBoxText';
    }

    static get iconName() {
        return 'icon1-1';
    }

    constructor(element) { //All controls must receive the host element as a parameter, if no element or string provided, the element will be created but not added to the DOM
        super(element);
        //Initialize public properties
        this.host.classList.add('box-text');
    }

    initialize() {
        const typeOptions = ['important', 'example', 'note', 'link', 'connection', 'activity'];
        const type = {name: 'type', type: 'optionList', options: typeOptions, editSettings: {
                label: 'cmpt.tepuyBasic:content-box.type',
                options: typeOptions.map(o => ({value: o, label: o}))
            } 
        };
        const label = {name: 'label', type: 'text', attr: 'label', editSettings: { label: 'cmpt.tepuyBasic:content-box.label' }};

        type.value = this.classesInUse(typeOptions)[0] || '';
        label.value = this.getAttribute(label.attr);

        _(this).properties = [ type, label ];
    }

    setPropertyValue(prop, value) {
        super.setPropertyValue(prop, value);
        if (!this.$host) return;
        if (prop == 'label') {
            this.$host.find('.title').html(value);
        }
    }

    appendRuntimeChild(refEl, html, method) {
        if (method != 'append') return false;
        refEl.find('.box_body').append(html);
        return true;
    }
}