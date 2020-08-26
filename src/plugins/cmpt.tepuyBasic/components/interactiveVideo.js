import { Component, ComponentType, ContainerComponent } from '../../../js/component';
import { _, formatDuration } from '../../../js/utils';
import { deepClone } from 'lodash';
import { App } from '../../../js/app';

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
    }

    initialize() {
        const source = {name: 'source', type: 'text', attr: 'data-src', editSettings: { label: 'cmpt.tepuyBasic:interactive-video.source' }};
        const autoplay = { name: 'autoplay', type: 'boolean', attr: 'data-autoplay', editSettings: { label: 'cmpt.tepuyBasic:interactive-video.autoplay' }};

        source.value = this.getAttribute(source.attr);
        autoplay.value = this.getAttribute(autoplay.attr);

        _(this).properties = [ source, autoplay ];

        this.childProperties = [
            {name: 'triggerAt', type: 'duration', attr: 'data-ivideo-show', editSettings: { label: 'cmpt.tepuyBasic:interactive-video.triggerAt' }},
            {name: 'stopAt', type: 'duration', attr: 'data-ivideo-hide', editSettings: { label: 'cmpt.tepuyBasic:interactive-video.hideAt' }},
            {name: 'wait', type: 'boolean', attr: 'data-wait', editSettings: { label: 'cmpt.tepuyBasic:interactive-video.waitFor' }}
        ];
    }

    setPropertyValue(prop, value) {
        super.setPropertyValue(prop, value);
        if (!this.$host) return;

        if (prop == 'source') {

        }
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