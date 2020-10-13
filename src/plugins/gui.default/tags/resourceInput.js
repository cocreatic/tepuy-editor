import { Validators } from '../components/validators';
import { Dialog } from '../components/dialog';
import { App } from '../../../js/app';

import { ResourceTreeManager } from '../../../js/resourceTreeManager';

const modalTemplate = '' +
    '<div class="tpy-resource-viewer">' +
        '<div id="tab-3" class="tpy-object-tree">' +
            '<div class="tpy-toolset">' +
                '<div class="tpy-toolset-content">' +
                    '{^{jstree resources.jtData config=resources.jtConfig /}}' +
                '</div>' +
//                '<h3 class="ui-widget-header" data-i18n="editor.resources.actions"></h3>' +
//                '<div class="tpy-toolset-content centered" data-link="{on \'click\' \'.ui-button\' resources.onAction}">' +
//                    '<div class="ui-widget ui-button" data-action="addFile">' +
//                        '<span data-i18n="commands.uploadFile">Subir Archivo</span>' +
//                    '</div>' +
//                    '<div class="ui-widget ui-button" data-action="addFolder">' +
//                        '<span data-i18n="commands.newFolder">Nueva carpeta</span>' +
//                    '</div>' +
//                '</div>' +
            '</div>' +
        '</div>' +
        '<div class="resource-list">' +
            '<div class="title">' +
                '{^{:resourceManager.currentPath}}' +
            '</div>' +
            '<div class="container">' +
                '{^{for resourceManager.files ~resMgr=resourceManager}}' +
                '<div class="resource thumbnail ui-state-default" data-link="' +
                '{on \'click\' ~resMgr.resourceClick #data}' +
                '{on \'dblclick\' ~resMgr.resourceDblClick #data}' +
                '">' +
                    '<div class="thumb">' +
                        '{{if thumb}}' +
                            '<img src="{{:thumb}}" alt=""/>' +
                        '{{else}}' +
                            '{{:~icon(icon)}}' +
                        '{{/if}}' +
                    '</div>' +
                    '<div class="info">' +
                        '<label title="{{:name}}">{{:name}}</label>' +
                        '<span>{{:size}}</span>' +
                        '<span>{{:createdAt convert="isoDateTime"}}</span>' +
                    '</div>' +
                '</div>' +
                '{{/for}}' +
            '</div>' +
//            '<div class="dropzone" data-link="' +
//            '{on \'dragenter dragover\' resourceManager.resourceDragEnter}' +
//            '{on \'dragleave drop\' resourceManager.resourceDragLeave}' +
//            '{on \'drop\' resourceManager.resourceDrop}' +
//            '">' +
//                '{{:~translate("resources.dropzone")}}' +
//            '</div>' +
        '</div>' +
    '</div>';



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
        //console.log(this['~settings']);
        const settings = this.ctxPrm('settings');
        const readonly = settings && settings.editable === false;
        this.ctxPrm('canEdit', !readonly);
        //$.observe(this, "~settings.*", this.onSettingsChange);
        //console.log(this);
        //this.editable = !(tagCtx.props.editable === false);
        //this.shouldConfirm = tagCtx.props.deleteConfirmation === true;
    },
    onDispose: function() {
        this.dlg && this.dlg.close(true);
        this.resourceManager && $(this.resourceManager).off('tpy:resource-dbl-click');
        this.resourceManager = null;
    },
    onSettingsChange: function(ev, eArgs) {
        console.log(ev);
    },
    //Methods
    browse: function(index) {

        this.prepareDialog();
        this.dlg.showModal();
    },
    prepareDialog: function() {
        if (this.dlg) {
            console.log('reloading tree');
            this.resourceManager.jtSelectNode({id: '_root'}); //Select the root;
            return;
        }

        const dlgOptions = {
            minWidth: 800,
            minHeight: 600
        };
        const $container = $(this.parentElem).closest('.tpy-form-container');
        if ($container.length) {
            dlgOptions.minWidth = $container.width() * .8;
        }
        const template = $.templates(modalTemplate);
        const dlg = new Dialog(Object.assign({
            title: App.i18n.t('commands.browse'),
            centerOnContent: true
        }, dlgOptions));

        dlg.setButtons([
            { text: App.i18n.t(App.i18n.t('commands.cancel')), click: this.cancel.bind(this) },
            { text: App.i18n.t(App.i18n.t('commands.browse')), click: this.submit.bind(this), 'data-default': true }
        ]);
        dlg.create();

        this.resourceManager = new ResourceTreeManager({
            actionHandler: this.onResourceAction.bind(this),
            filter: this.filter
        });
        const treeConfig = this.resourceManager.getConfig(true); //Read only resource manager
        this.resources = {
            ...treeConfig,
            onAction: this.resourceManager.onSidebarAction
        };

        $(this.resourceManager).on('tpy:resource-dbl-click', (ev, data) => {
            this.submit();
        });

        template.link(dlg.host, this);

        dlg.host.localize();
        this.dlg = dlg;
    },
    onResourceAction: function(arg) {
        console.log(arg);
    },
    submit: function() {
        if (!this.resourceManager.selectedLeaf) return;
        const path = this.resourceManager.selectedLeaf.path;
        this.ctxPrm('path', path);
        //this.updateValue(path, true);
        this.dlg.close(false);
    },
    cancel: function() {
        this.dlg.close(true);
    },
    onUpdate: false,
    dataBoundOnly: true
};
