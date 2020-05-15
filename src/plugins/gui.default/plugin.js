import { helpers, converters, tree, shareList, imageInput, icon } from './helpers';
import { FormManager, FormBuilder, FormArray, FormControl, FormGroup } from './components/formManager';
import { Dialog } from './components/dialog';
import { Validators } from './components/validators';

let layoutInitialized = false;

export class GuiDefault {

    constructor(app) {
        this.app = app;
        app.registerHook('gui_initialize', this.initialize.bind(this));
        this.menu = [];
    }

    initialize() {
        $.views.helpers({
            translate: helpers.translate(this.app.i18n),
            icon: helpers.icon,
            debug: helpers.debug
        });
        $.views.tags({ editableTree: tree, shareList, imageInput, icon });
        $.views.converters(converters);
        this.initializeGuiApi();
        this.app.invokeHook('gui_menu_initialize');
    }

    initializeGuiApi() {
        this.app.ui = {
            load: this.load.bind(this),
            registerMenuItem: this.registerMenuItem.bind(this),
            components: {
                FormManager: FormManager.register(this.app),
                FormBuilder,
                FormArray,
                FormGroup,
                FormControl,
                Dialog: Dialog.register(this.app)
            }
        };

        this.app.validation = { validators: {...Validators }};
    }

    menuAction(ev, ui) {
        if (ui.item.children("ul").length) return; //Not a leaf
        var hook = `gui_menu_${ui.item.data().id}`;
        //setTimeout(() => this.app.ui.$menu.menu('collapseAll', true), 200);
        setTimeout(() => {
            //this.app.ui.$menu.menu('collapseAll', true);
            this.app.invokeHook(hook, ui);
            setTimeout(() => this.app.ui.$menu.menu('collapseAll', true), 200);
        }, 0);
    }

    buildLayout() {
        const template = $.templates("script#gui-default");
        this.user = this.app.data.user;
        this.theme = this.app.options.theme;
        template.link(this.app.$container, this);
        let $menu = this.app.ui.$menu = $('#tpe-menubar');
        this.app.ui.$sidebar = $('#tpe-sidebar');
        this.app.ui.$content = $('#tpe-content');

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
        $(this.app.$container).addClass("tpe-editor tpe-editor-default").localize(); //ToDo: Change default to the theme name
        layoutInitialized = true;
    }

    load(view, params) {
        this.currentView = view;
        if (!layoutInitialized) {
            this.buildLayout();
        }
        this.app.invokeHook(`gui_view_${view}`, params);
        this.resolveMenuState(this.menu);
        //$.observable(this.menu).refresh(this.menu);
        this.app.ui.$menu.menu("refresh");
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