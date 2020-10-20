import { App } from '../../js/app';
import { privateMap, _ } from '../../js/utils';
import { Component } from '../../js/component';
import { TemplateManager } from './templateManager';

export class StylesheetEditor {
    constructor(file) {
        this.file = file;
        this.css = file.content;
        const titleText = App.i18n.t('dco.stylesheetWindowTitle') + ' - ' + file.filename;
        const dlg = new App.ui.components.Dialog({
            title: titleText,
            width: '60vw'
        });
        const acceptBtn = { text: App.i18n.t('commands.update'), click: this.submit.bind(this), 'data-default': true };
        const cancelBtn = { text: App.i18n.t('commands.close'), click: this.cancel.bind(this) };
        dlg.setButtons([acceptBtn, cancelBtn]);
        const template = TemplateManager.get('stylesheetEditor')
        privateMap.set(this, {
            dlg,
            acceptBtn,
            cancelBtn,
            template,
        });
        this.onDialogClose = this.onDialogClose.bind(this);
        this.onDialogOpen = this.onDialogOpen.bind(this);
        //Configure ace
        ace.config.set('basePath', 'vendor/assets/ace');
    }

    setTitle(title) {
        const priv = _(this);
        if (priv.initialized) {
            priv.dlg.host.dialog('option', 'title', title);
        }
        else {
            priv.dlg.host.attr('title', title);
        }
    }

    setAcceptText(text) {
        const priv = _(this);
        priv.acceptBtn.text = text;
        if (priv.initialized) {
            priv.dlg.host.find('.ui-dialog-buttonset > button:first').html(text);
        }
    }

    show() {
        console.log('loading editor');
        const priv = _(this);
        const dlg = priv.dlg;
        const me = this;
        this.setMode('loading');

        if (!priv.initialized) {
            dlg.create({
                open: this.onDialogOpen,
                close: this.onDialogClose
            });
            dlg.host.addClass('tpy-stylesheet-editor')
            dlg.host.empty();
            priv.template.link(dlg.host, this);
            $.observe(this, 'mode', () => {
                dlg.host && dlg.host.localize();
            });
            priv.initialized = true;
        }
        
        return new Promise((resolve, reject) => {
            priv.resolve = resolve;
            priv.reject = reject;
            dlg.showModal();
        });
    }

    onDialogOpen() {
        const dlg = _(this).dlg;
        dlg.toggleFullMode(true);
        this.initializeControls().then(() => {
            //const cats = dlg.host.localize();
            setTimeout(() => {
                this.setMode('edit');
                const $editEl = dlg.host.find('#aceeditor');
                this.editor = ace.edit($editEl.get(0), {
                    mode: 'ace/mode/css',
                    theme: 'ace/theme/clouds',
                    selectionStyle: 'text'
                });
                $editEl.on('keydown', (e) => {
                    if (e.keyCode == 13) {
                        e.stopPropagation();
                    }
                });
            }, 0);
        });
    }

    onDialogClose() {
        if (this.editor) {
            this.editor.destroy();
        }
    }

    setMode(mode) {
        $.observable(this).setProperty('mode', mode);
    }

    initializeControls() {
        //Load the ace editor here
        return Promise.resolve({});
    }

    submit() {
        const css = this.editor.getValue();
        console.log(css);
        const blob = new Blob([css], {type : 'text/css'});
        console.log(blob);
        const resource = {
            type: 'F',
            name: this.file.filename,
            size: Math.round(blob.size / 1024) + ' KB',
            createdAt: moment(new Date()).unix(), // .format('YYYY-MM-DD HH:mm'),
            extension: '.css',
            //path: '/content/css/'+this.file.filename,
            blob
        }
        const priv = _(this);
        this.file.content = css;
        console.log(resource);
        App.data.dco.addResource(resource, '/content/css/').then(response => {
            priv.resolve(this.file);
            priv.close(true);
        }, (error) => {
            App.ui.components.Dialog.message(App.i18n.t('dco.errors.cssUpdateFailed'), App.i18n.t('tepuy'));
            console.log(error);
        });
        return;
    }

    cancel() {
        const priv = _(this);
        priv.reject();
        priv.dlg.close(true);
    }
}