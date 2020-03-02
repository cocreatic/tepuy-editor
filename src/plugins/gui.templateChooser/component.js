import { App } from '../../js/app';

export class GuiTemplateChooser {

    constructor() {
        App.registerHook('gui_templatechooser', this.initialize.bind(this));
        this.menu = [
            { text: 'Save', icon: 'ui-icon-disk'},
            { text: 'Zoom In', icon: 'ui-icon-zoomin'}
        ];
    }

    initialize() {
        const sidebarTpl = $.templates("script#gui-tplchooser-sidebar");
        sidebarTpl.link(App.ui.$sidebar, {});
        const contentTpl = $.templates("script#gui-tplchooser-content");
        contentTpl.link(App.ui.$content, {});

        console.log(App.api.call('getTemplates', { keyword: 'Lorem' }));
    }

}
