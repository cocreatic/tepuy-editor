import { App } from '../../js/app';
import { helpers, converters, tree, shareList } from './helpers';
import { FormManager, FormBuilder, FormArray, FormControl, FormGroup } from './components/formManager';
import { Dialog } from './components/dialog';
import { Validators } from './components/validators';

let layoutInitialized = false;

export class GuiDefault {

    constructor() {
        App.registerHook('gui_initialize', this.initialize.bind(this));
        this.menu = [];
    }

    initialize() {
        $.views.helpers(helpers);
        $.views.tags({ editableTree: tree, shareList });
        $.views.converters(converters);
        this.initializeGuiApi();
        App.invokeHook('gui_menu_initialize');
    }

    initializeGuiApi() {
        App.ui = {
            load: this.load.bind(this),
            registerMenuItem: this.registerMenuItem.bind(this),
            components: {
                FormManager,
                FormBuilder,
                FormArray,
                FormGroup,
                FormControl,
                Dialog: Dialog
            }
        };

        App.validation = { validators: {...Validators }};
    }

    menuAction(ev, ui) {
        if (ui.item.children("ul").length) return; //Not a leaf
        var hook = `gui_menu_${ui.item.data().id}`;
        //setTimeout(() => App.ui.$menu.menu('collapseAll', true), 200);
        setTimeout(() => {
            //App.ui.$menu.menu('collapseAll', true);
            App.invokeHook(hook);
            setTimeout(() => App.ui.$menu.menu('collapseAll', true), 200);
        }, 0);
    }

    buildLayout() {
        const template = $.templates("script#gui-default");
        this.user = App.data.user;
        template.link(App.$container, this);
        let $menu = App.ui.$menu = $('#tpe-menubar');
        App.ui.$sidebar = $('#tpe-sidebar');
        App.ui.$content = $('#tpe-content');

        $menu.menu({
            position: { my: 'left top', at: 'left bottom' },
            blur: () => {
                $menu.menu('option', 'position', { my: 'left top', at: 'left bottom' });
            },
            focus: (e, ui) => {
                if ($menu.get(0) !== $(ui).get(0).item.parent().get(0)) {
                    $menu.menu('option', 'position', { my: 'left top', at: 'right top' });
                }
            }
        });
        $(App.$container).addClass("tpe-editor-default").localize(); //ToDo: Change default to the theme name
        layoutInitialized = true;
    }

    load(view, params) {
        this.currentView = view;
        if (!layoutInitialized) {
            this.buildLayout();
        }
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