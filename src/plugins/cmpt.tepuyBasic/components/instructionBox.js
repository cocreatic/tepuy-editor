import { Component, ComponentType } from '../../../js/component';
import { _ } from '../../../js/utils';

export class InstructionBox extends Component {

    static get legacySelector() {
        return '.instruction';
    }

    static get type() {
        return ComponentType.TEXTBLOCK;
    }

    static get tepuyPluginName() {
        return 'tepuyInstructionBox';
    }

    static get iconName() {
        return 'icon1-2';
    }

    constructor(element) { //All controls must receive the host element as a parameter, if no element or string provided, the element will be created but not added to the DOM
        super(element);
        this.setPropertyValue('content', element ? element.innerHTML : '&nbsp;'); //Required because during super, innerHTML is not cloned
        this.host.classList.add('instruction');
    }

    initialize() {
        const typeOptions = ['info', 'danger', 'alert', 'none'];
        const type = { name: 'type', type: 'optionList', options: typeOptions, attr: 'type', editSettings: {
                label: 'cmpt.tepuyBasic:instruction-box.type',
                options: typeOptions.map(o => ({value: o, label: o})) //ToDo: Translation for labels
            }
        };
        type.value = this.getAttribute(type.attr);

        const content = {name: 'content', type: 'html', prop: 'innerHTML', editSettings: { label: 'cmpt.tepuyBasic:instruction-box.content' }};
        content.value = this.host.innerHTML;

        _(this).properties = [type, content];
    }
}