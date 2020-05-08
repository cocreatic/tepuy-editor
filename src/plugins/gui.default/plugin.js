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
        this.user = App.auth.getUserInfo();
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
            }
        });
        $(App.$container).addClass("tpe-editor-default").find('header').localize(); //ToDo: Change default to the theme name
    }

    menuAction(ev, ui) {
        if (ui.item.children("ul").length) return; //Not a leaf
        var hook = `gui_menu_${ui.item.data().id}`;
        setTimeout(() => App.invokeHook(hook), 500);
    }

    load(view, params) {
        this.currentView = view;
        App.invokeHook(`gui_view_${view}`, params);
        this.resolveMenuState(this.menu);
        //$.observable(this.menu).refresh(this.menu);
        App.ui.$menu.menu("refresh");
    }

    registerMenuItem(menuItem, parentId) {
        var container = this.menu;
        let item = { ...menuItem };
        if (parentId) {
            var parent = container.find(it => it.id == parentId);
            container = parent && (parent.menuItems || (parent.menuItems = [])) || container;
        }
        $.observable(container).insert(item);
    }

    resolveMenuState(menuItem) {
        if (Array.isArray(menuItem)) {
            for(let item of menuItem) {
                this.resolveMenuState(item);
            }
            return;
        }

        let enabled = false;
        let visible = false;
        if (menuItem.menuItems && menuItem.menuItems.length) {
            for(let item of menuItem.menuItems) {
                this.resolveMenuState(item);
                enabled = enabled || item.enabled;
                visible = visible || item.visible;
            }
            //menuItem.enabled = enabled;
            //menuItem.visible = visible;
            $.observable(menuItem).setProperty('enabled', enabled);
            $.observable(menuItem).setProperty('visible', visible);
            return;
        }

        if (Array.isArray(menuItem.show)) {
            visible = menuItem.show.indexOf(this.currentView) >= 0;
        }
        else {
            visible = true;
        }

        if (Array.isArray(menuItem.enable)) {
            enabled = menuItem.enable.indexOf(this.currentView) >= 0;
        }
        else {
            enabled = true;
        }

        //menuItem.enabled = enabled;
        //menuItem.visible = visible;
        $.observable(menuItem).setProperty('enabled', enabled);
        $.observable(menuItem).setProperty('visible', visible);
    }

}