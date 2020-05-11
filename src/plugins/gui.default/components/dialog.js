import { App } from '../../../js/app';

import { privateMap, _, getSafe } from '../../../js/utils';

export class Dialog {

    constructor(settings) {
        this.host = settings.host;
        if (!this.host) {
            this.host = $('<div style="display:none"/>').appendTo(App.$container);
        }
        privateMap.set(this, {
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


    showModal() {
        let options = {
            modal: true,
            appendTo: App.$container,
            resizable: false
        };
        let { settings, buttons } = {..._(this)};
        if (settings.width) {
            options.width = settings.width
        }
        if (settings.title) options.title = settings.title;

        if(!buttons) {
            buttons = [ Dialog.acceptButton ];
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
                of: App.ui.$content
            };
        }

        this.$dlg = $(this.host).dialog(options);
    }

    close(destroy) {
        if (!this.$dlg) return;
        this.$dlg.dialog(destroy?'destroy':'close');
    }

    static closeButton(callback=null) {
        return {text: App.i18n.t('commands.accept'), callback: callback || this.close.bind(this, true)};
    }

    static acceptButton(callback=null) {
        return {text: App.i18n.t('commands.cancel'), callback: callback || this.close.bind(this, true)};
    }
}