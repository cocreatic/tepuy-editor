import { App } from '../../../js/app';
import { ResourceLookup } from '../components/resourceLookup';

export const resourceInput = {
    template: '#gui-default-resourceinput',
    bindTo: [0],
    bindFrom: [0, 'settings'], //'editable'],
    linkedCtxParam: ["path", "settings"], //"canEdit"],
    displayElem: 'div',
    init: function(tagCtx) {
        const settings = tagCtx.props.settings;
        this.filter = settings && settings.filter;
        this.ctxPrm("canEdit", true);
    },
    onBind: function(tagCtx) {
        const settings = this.ctxPrm('settings');
        const readonly = settings && settings.editable === false;
        this.ctxPrm('canEdit', !readonly);
    },
    onDispose: function() {
        this.lookup && this.lookup.destroy();
    },
    onSettingsChange: function(ev, eArgs) {
        console.log(ev);
    },
    //Methods
    browse: function(index) {
        if (!this.lookup) {
            const $container = $(this.parentElem).closest('.tpy-form-container');
            this.lookup = new ResourceLookup(this.filter, $container);
        }

        this.lookup.showModal().then(selected => {
            this.ctxPrm('path', selected.path);
        }, error => {});
    },
    onUpdate: false,
    dataBoundOnly: true
};
