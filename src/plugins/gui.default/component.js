import { App } from '../../js/app';
import { helpers, tree } from './helpers';

export class GuiDefault {

    constructor() {
        App.registerHook('gui_initialize', this.initialize.bind(this));
        this.menu = [];
    }

    initialize() {
        $.views.helpers(helpers);
        $.views.tags({ editableTree: tree });
        const template = $.templates("script#gui-default");
        App.ui = {
            load: this.load.bind(this),
            registerMenuItem: this.registerMenuItem.bind(this)
        };
        App.invokeHook('gui_menu_initialize');
        this.user = App.api.call('getUserData');
        template.link(App.$container, this);
        App.ui.$menu = $('#tpe-menubar');
        App.ui.$sidebar = $('#tpe-sidebar');
        App.ui.$content = $('#tpe-content');

        App.ui.$menu.menu({
            position: { my: 'left top', at: 'left bottom' },
            blur: function() {
                $(this).menu('option', 'position', { my: 'left top', at: 'left bottom' });
            },
            focus: function(e, ui) {
                if (App.ui.$menu.get(0) !== $(ui).get(0).item.parent().get(0)) {
                    $(this).menu('option', 'position', { my: 'left top', at: 'right top' });
                }
            },
        });
        $(App.$container).addClass("tpe-editor-default").find('header').localize(); //ToDo: Change default to the theme name
    }

    menuAction(ev, ui) {
        if (ui.item.children("ul").length) return; //Not a leaf
        var hook = `gui_menu_${ui.item.data().id}`;
        setTimeout(() => App.invokeHook(hook), 500);
    }

    load(view, params) {
        App.invokeHook(`gui_view_${view}`, params);
    }

    registerMenuItem(menuItem, parentId) {
        var container = this.menu;
        if (parentId) {
            var parent = container.find(it => it.id == parentId);
            container = parent && (parent.menuItems || (parent.menuItems = [])) || container;
        }
        $.observable(container).insert(menuItem);
    }



}