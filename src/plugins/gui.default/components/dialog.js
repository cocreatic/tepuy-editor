import { privateMap, _, getSafe } from '../../../js/utils';

export class Dialog {

    static register(app) {
        Dialog._app = app;
        return Dialog;
    }

    constructor(settings) {
        this.host = settings.host;
        this.orphan = false;
        if (!this.host) {
            this.host = $('<div style="display:none"/>').appendTo(Dialog._app.$container);
            this.orphan = true;
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
            appendTo: Dialog._app.$container,
            resizable: false
        };

        let { settings, buttons } = {..._(this)};
        const { width, maxWidth, title } = { ...settings };
        options.width = width;
        options.maxWidth = maxWidth;
        options.title = title;

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
                of: Dialog._app.ui.$content
            };
        }
        this.$dlg = $(this.host).dialog(options);
    }

    close(destroy) {
        if (!this.$dlg) return;
        this.$dlg.dialog(destroy?'destroy':'close');
        if (destroy && this.orphan) {
            this.$dlg.remove();
        }
        this.$dlg = null;
    }

    static closeButton(callback=null) {
        return {text: Dialog._app.i18n.t('commands.accept'), callback: callback || this.close.bind(this, true)};
    }

    static acceptButton(callback=null) {
        return {text: Dialog._app.i18n.t('commands.cancel'), callback: callback || this.close.bind(this, true)};
    }
}