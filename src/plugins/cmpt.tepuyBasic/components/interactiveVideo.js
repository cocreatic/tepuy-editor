import { Component, ComponentType, ContainerComponent } from '../../../js/component';
import { _, formatDuration, round } from '../../../js/utils';
import { deepClone } from 'lodash';
import { App } from '../../../js/app';

const MAX_DECIMALS = 2;

export class InteractiveVideo extends ContainerComponent {
    static get legacySelector() {
        return '.tpy-ivideo';
    }

    static get type() {
        return ComponentType.MEDIA;
    }

    static get tepuyPluginName() {
        return 'tepuyInteractiveVideo';
    }

    static get iconName() {
        return 'icon2-3';
    }

    constructor(element) { //All controls must receive the host element as a parameter, if no element or string provided, the element will be created but not added to the |
        super(element);
        //Initialize public properties
        this.host.classList.add('tpy-ivideo');
        this.addChildText = 'cmpt.tepuyBasic:interactive-video.addChildText';
    }

    initialize() {
        const source = {name: 'source', type: 'resourceInput', attr: 'data-src', editSettings: { label: 'cmpt.tepuyBasic:interactive-video.source', filter: 'video' }};
        const autoplay = { name: 'autoplay', type: 'boolean', attr: 'data-autoplay', editSettings: { label: 'cmpt.tepuyBasic:interactive-video.autoplay' }};

        source.value = this.getAttribute(source.attr);
        source.editSettings.editable = !source.value; 
        autoplay.value = this.getAttribute(autoplay.attr);

        _(this).properties = [ source, autoplay ];

        this.childProperties = [
            {name: 'triggerAt', type: 'duration', attr: 'data-ivideo-show', editSettings: { label: 'cmpt.tepuyBasic:interactive-video.triggerAt' }},
            {name: 'stopAt', type: 'duration', attr: 'data-ivideo-hide', editSettings: { label: 'cmpt.tepuyBasic:interactive-video.hideAt' }},
            {name: 'wait', type: 'boolean', attr: 'data-wait', editSettings: { label: 'cmpt.tepuyBasic:interactive-video.waitFor' }},
            {name: 'posTop', type: 'text', attr: 'data-pos-top', editSettings: { visible: false }},
            {name: 'posLeft', type: 'text', attr: 'data-pos-left', editSettings: { visible: false }}
        ];
    }

    updateProperties(value) {
        if (value == null) return false;
        const currentSource = this.getPropertyValue('source');
        let source = value['source'];
        if (source && source != currentSource) {

        }

        super.updateProperties(value);
    }

    setPropertyValue(prop, value) {
        if (prop.name == 'source') {
            //Update url link and clear 
        }

        super.setPropertyValue(prop, value);
        if (!this.$host) return;
    }

    resolveChildProperties(jQuery) {
        let properties = this.childProperties.map(p => Object.assign({}, p));
        if (!this.$host && jQuery) {
            this.$host = jQuery(`#${this.id}`);
        }
        if (this.$host) {
            const ivideo = this.$host.data('ivideo');
            const currentTime = ivideo.currentTime;
            const duration = ivideo.duration;
            const triggerAt = properties[0];
            const stopAt = properties[1];
            const wait = properties[2];
            const validators = App.validation.validators;

            triggerAt.value = formatDuration(currentTime);
            triggerAt.editSettings.validators = [ validators.required, validators.duration, validators.maxDuration(duration) ];

            stopAt.value = formatDuration(Math.min(duration, currentTime + 10));
            stopAt.editSettings.validators = [ validators.duration, validators.maxDuration(duration), validators.greatherThan('triggerAt') ];
            stopAt.editSettings.validityDepends = ['triggerAt'];
            wait.value = false;
        }
        return properties;
    }

    get canHideAppendButton() {
        return false;
    }

    setChildPosition(e, ui) {
        const cmpt = this;
        cmpt.host.setAttribute('data-pos-top', round(ui.position.top, MAX_DECIMALS));
        cmpt.host.setAttribute('data-pos-left', round(ui.position.left, MAX_DECIMALS));
        $(cmpt.host.ownerDocument).trigger('tpy:document-changed');
    }

    setChildSize(e, ui) {
        const cmpt = this;
        cmpt.host.setAttribute('data-pos-top', round(ui.position.top, MAX_DECIMALS));
        cmpt.host.setAttribute('data-pos-left', round(ui.position.left, MAX_DECIMALS));
        cmpt.host.setAttribute('data-size-width', round(ui.size.width, MAX_DECIMALS));
        cmpt.host.setAttribute('data-size-height', round(ui.size.height, MAX_DECIMALS));
        $(cmpt.host.ownerDocument).trigger('tpy:document-changed');
    }

    onEditorLoaded() {
        const registerHandler = (child) => {
            if (child.$host) {
                child.$host
                    .on('tpy:drag-completed', this.setChildPosition.bind(child))
                    .on('tpy:resize-completed', this.setChildSize.bind(child));
            }
            else {
                setTimeout(registerHandler.bind(null, child), 100);
            }
        }

        this.children.forEach(registerHandler);
    }

    onBeforeAppendChild(component, index) {
        component.host.classList.add('tpy-no-sibligs-allowed');
    }

    onChildUpdated(cmpt) {
        if (!this.$host) return;
        const ivideo = this.$host.data('ivideo');
        ivideo.refreshInteractions();
        const start = cmpt.getPropertyValue('triggerAt');
        if (start) {
            ivideo.seek(start);
        }
    }

    appendRuntimeChild($refEl, html, method) {
        const $wrapper = $refEl.find('.tpy-ivideo-wrapper');
        $(html).appendTo($wrapper).hide();  //Add the element to the current DOM and hide it
        return true;
    }

    afterRuntimeChildAdded(component, $refEl) {
        $refEl.on('tpy:drag-completed', this.setChildPosition.bind(component));
        $refEl.on('tpy:resize-completed', this.setChildSize.bind(component));
        component.host.style.display = 'none'; //Hide it by default
        const ivideo = $refEl.data('ivideo');
        ivideo.refreshInteractions();
        const start = component.getPropertyValue('triggerAt');
        if (start) {
            ivideo.seek(start);
        }
    }

    onChildRemovedX(child, index) {
        if (!child.$host) return;
        const action = child.$host.data('ivideoaction');
        action.ivideo.refreshInteractions();
    }

}