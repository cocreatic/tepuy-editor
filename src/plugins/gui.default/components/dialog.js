import { App } from '../../../js/app';
import { privateMap, _, getSafe } from '../../../js/utils';

export class Dialog {

    constructor(settings) {
        this.host = settings.host;
        this.orphan = false;
        if (!this.host) {
            this.host = $('<div style="display:none"/>').appendTo(App.$container);
            this.orphan = true;
        }
        privateMap.set(this, {
            buttons: settings.buttons,
            settings
        });
    }

    addButton(button) {
        let buttons = _(this).buttons || [];
        buttons.push(button);
        _(this).buttons = buttons;
    }

    setButtons(buttons) {
        _(this).buttons = buttons
    }


    create() {
        let options = {
            autoOpen: false,
            appendTo: App.$container,
            resizable: false
        };

        let { settings, buttons } = {..._(this)};
        const { width, maxWidth, title } = { ...settings };
        options.width = width;
        options.maxWidth = maxWidth;
        options.title = title;

        if(!buttons) {
            buttons = [ Dialog.acceptButton() ];
        }

        options.buttons = {};
        const noop = () => {};
        for(const button of buttons) {
            options.buttons[button.text] = button.callback || noop;
        }

        if (!(settings.centerOnContent === false)) {
            options.position = {
                my: 'center center',
                at: 'center center',
                of: App.ui.$content.parent()
            };
        }
        this.$dlg = $(this.host).dialog(options);
    }

    showModal() {
        if (!this.$dlg) {
            this.create();
        }
        this.$dlg.dialog('option', {
            'modal': true
        }).dialog('open');
    }

    close(destroy) {
        if (!this.$dlg) return;
        this.$dlg.dialog(destroy?'destroy':'close');
        if (destroy && this.orphan) {
            this.$dlg.remove();
        }
        this.$dlg = null;
    }

    static confirm(question, title) {
        return new Promise((resolve, reject) => {
            const dlg = new Dialog({
                title: title,
                buttons: [
                    {
                        text: App.i18n.t('general.yes'),
                        callback: () => {
                            dlg.close(true);
                            resolve(true);
                        }
                    },
                    Dialog.closeButton(() => {
                        dlg.close(true);
                        resolve(false)
                    })
                ]
            });
            $(dlg.host).html('<p>'+question+'</p>');
            dlg.showModal();
        });
    }

    static acceptButton(callback=null) {
        return {text: App.i18n.t('commands.accept'), callback: callback || this.close.bind(this, true)};
    }

    static closeButton(callback=null) {
        return {text: App.i18n.t('commands.cancel'), callback: callback || this.close.bind(this, true)};
    }
}