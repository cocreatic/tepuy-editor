import { App } from '../../js/index';

export class GuiDefault {

    constructor() {
        App.registerHook('gui_initialize', this.initialize.bind(this));
        this.menu = [
            { text: 'Save', icon: 'ui-icon-disk'},
            { text: 'Zoom In', icon: 'ui-icon-zoomin'}
        ];
    }

    initialize() {
        const template = $.templates("script#gui-default");
        template.link(App.container, {
            menuItems: this.menu
        }, {
            menuAction: this.menuClick
        });
    }

    menuClick(ev, ui) {
        console.log('menuClick');
        if (!ui.item.children("ul").length) {
          // Leaf menu item
          alert(ui.item.text());
        }
    }
}