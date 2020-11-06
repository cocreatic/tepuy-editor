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
        '</div>' +
    '</div>';

export class ResourceLookup {
    constructor(filter, container) {
        this.filter = filter;
        this.$container = $(container);
        this.submit = this.submit.bind(this);
        this.cancel = this.cancel.bind(this);
        this.onResourceAction = this.onResourceAction.bind(this);
    }

    initializeDialog() {
        if (this.dlg) {
            this.resourceManager.jtSelectNode({id: '_root'}); //Select the root;
            return;
        }

        const dlgOptions = {
            minWidth: 800,
            minHeight: 600
        };
        if (this.$container && this.$container.length) {
            dlgOptions.minWidth = this.$container.width() * .8;
        }
        const template = $.templates(modalTemplate);
        const dlg = new Dialog(Object.assign({
            title: App.i18n.t('commands.browse'),
            centerOnContent: true
        }, dlgOptions));

        dlg.setButtons([
            { text: App.i18n.t(App.i18n.t('commands.cancel')), click: this.cancel },
            { text: App.i18n.t(App.i18n.t('commands.browse')), click: this.submit, 'data-default': true }
        ]);
        dlg.create();

        this.resourceManager = new ResourceTreeManager({
            actionHandler: this.onResourceAction,
            filter: this.filter
        }, App);
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
    }

    setFilter(filter) {
        this.resourceManager && this.resourceManager.setFilter(filter);
    }

    showModal() {
        this.initializeDialog();
        return new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
            this.dlg.showModal();
        });
    }

    destroy() {
        this.dlg && this.dlg.close(true);
        this.resourceManager && $(this.resourceManager).off('tpy:resource-dbl-click');
        this.resourceManager = null;
        this.dlg = null;
    }

    submit() {
        if (!this.resourceManager.selectedLeaf) return;
        this.dlg.close(false);
        this.resolve(this.resourceManager.selectedLeaf);
    }
    
    cancel() {
        this.reject(false);
        this.dlg.close(false);
    }

    onResourceAction(){}
}