import moment from 'moment';

import { App } from '../../js/app';
import { TemplateManager } from './templateManager';
import { ContentTreeManager } from './contentTreeManager';
import { ResourceTreeManager } from './resourceTreeManager';
import { ComponentEditor } from './componentEditor';

const templateMap = {
    sidebar: 'script#gui-editor-sidebar',
    content: 'script#gui-editor-content',
    editPage: 'script#gui-editor-edit-page'
}

const CONTENT_TAB ='tab-1';
const LOOK_TAB ='tab-2';
const RESOURCES_TAB ='tab-3';
const LOG_TAB ='tab-4';
const SHARE_TAB ='tab-5';
const defaultDevice = 'iphone';

export class GuiEditor {

    constructor() {
        App.registerHook('gui_view_editor', this.initialize.bind(this));
        App.registerHook('gui_menu_initialize', this.registerMenu.bind(this));

        //Guarantee this context
        this.editProperties = this.editProperties.bind(this);
    }

    initialize(template) {
        const sidebarTpl = TemplateManager.get('sidebar');
        const contentTpl = TemplateManager.get('content');
        this.sidebarModel = { };
        this.contentModel = { responsiveDevice: defaultDevice };
        this.dco = App.data.dco;

        contentTpl.link(App.ui.$content, this.contentModel);
        sidebarTpl.link(App.ui.$sidebar, this.sidebarModel);

        $('#tabs').localize().tabs({
            activate: (event, ui) => {
                this.activateTab(ui.newTab, ui.oldTab);
            }
        });
        this.activateTab(App.ui.$sidebar.find('li[data-tab-id="tab-1"]'));
    }

    activateTab(tab, oldTab) {
        let id = tab.data().tabId;
        this.activeTab = id;
        switch(id) {
            case CONTENT_TAB:
                this.loadContentTab();
                break;
            case RESOURCES_TAB:
                this.loadResourceTab();
                break;
            default:
                $.observable(this.contentModel).setProperty('template', ['#gui-editor-', id, '-content'].join(''));
                break;
        }
    }

    registerMenu() {
        App.ui.registerMenuItem({ id: 'file'});
        App.ui.registerMenuItem({ id: 'file_properties', show: ['editor']}, 'file');
        App.ui.registerMenuItem({ id: 'file_metadata', show: ['editor']}, 'file');
        App.ui.registerMenuItem({ id: 'file_download', show: ['editor']}, 'file');
        App.ui.registerMenuItem({ id: 'file_exit', show: ['editor']}, 'file');
        App.ui.registerMenuItem({ id: 'view'});
        App.ui.registerMenuItem({ id: 'view_preview', show: ['editor']}, 'view');
        App.ui.registerMenuItem({ id: 'view_responsive', show: ['editor']}, 'view');
        App.ui.registerMenuItem({ id: 'help'});
        App.ui.registerMenuItem({ id: 'help_manual'}, 'help');
        App.ui.registerMenuItem({ id: 'help_about'}, 'help');

        //Register callbacks
        App.registerHook('gui_menu_file_properties', this.editProperties.bind(this));
        App.registerHook('gui_menu_file_metadata', this.notimplemented.bind(this));
        App.registerHook('gui_menu_file_download', this.notimplemented.bind(this));
        App.registerHook('gui_menu_file_exit', this.close.bind(this));
        App.registerHook('gui_menu_view_preview', this.notimplemented.bind(this));
        App.registerHook('gui_menu_view_responsive', this.responsiveView.bind(this));
        App.registerHook('gui_menu_help_manual', this.notimplemented.bind(this));
        App.registerHook('gui_menu_help_about', this.about.bind(this));
        App.registerHook('gui_menu_profile_logout', this.logout.bind(this));
    }

    loadContentTab() {
        if (!this.sidebarModel.content){
            const treeConfig = this.initializeContentTreeManager();
            let extras = App.data.dco.extras().slice(0);
            $.observable(this.sidebarModel).setProperty('content', {
                extras: extras,
                ...treeConfig
            });
            setTimeout(() => App.ui.$sidebar.localize(), 100);
        }
        $.observable(this.contentModel).setProperty('template', ['#gui-editor-', CONTENT_TAB, '-content', App.ui.responsive ? '-responsive': ''].join(''));
        this.headRendered = false;
        //this.renderFirst();
    }

    initializeContentTreeManager() {
        this.contentTreeManager = new ContentTreeManager(
            this.contentTreeActionHandler.bind(this),
            this.contentTreeSelectionHandler.bind(this)
        );
        return this.contentTreeManager.getConfig();
    }

    contentTreeActionHandler(result) {
        let container = this.editor.container;
        if (/(add|move)/.test(result.action)){
            container = 'content'; //Only content allows moving operations
        }
        App.data.dco.updateHtml(container);
        if (result.action == 'add' && !this.editor.isIndex) {
            const node = this.contentTreeManager.getSelection();
            this.renderHead(node).then(() => this.render(node));
        }
        else {
            this.render(this.contentTreeManager.getSelection());
        }
    }

    contentTreeSelectionHandler(node) {
        if (!this.headRendered) {
            this.renderHead(node);
            this.headRendered = true;
        }
        this.render(node);
    }

    loadResourceTab() {
        if (!this.sidebarModel.resources) {
            const treeConfig = this.initializeResourceTreeManager();
            $.observable(this.sidebarModel).setProperty('resources', {
                ...treeConfig,
                onAction: this.resourceTreeManager.onSidebarAction
            });

            setTimeout(() => App.ui.$sidebar.localize(), 100);
        }
        $.observable(this.contentModel).setProperty('template', ['#gui-editor-', RESOURCES_TAB, '-content'].join(''));
    }

    initializeResourceTreeManager() {
        this.resourceTreeManager = new ResourceTreeManager();
        this.contentModel.resourceManager = this.resourceTreeManager;
        return this.resourceTreeManager.getConfig();
    }

    //Menu handlers
    close() {
        App.ui.load('home');
    }

    about() {
        if (!this.aboutTpl) this.aboutTpl = $.templates("script#gui-editor-about");
        $(this.aboutTpl.render({ theme: App.options.theme })).dialog({ modal: true});
    }

    logout(){
        App.exit();
    }

    editProperties() {
        const builder = App.ui.components.FormBuilder;
        const validators = App.validation.validators;

        const interactionModes = [
            { value: 'web', label: 'interactionMode.web' },
            { value: 'scorm', label: 'interactionMode.scorm' }
        ];
        const displayModes = [
            { value: 'inline', label: 'displayMode.inline' },
            { value: 'floating', label: 'displayMode.floating' },
            { value: 'modal', label: 'displayMode.modal' }
        ];
        const config = this.dco.manifest;
        const formConfig = builder.array([
            builder.group({
                shareAsTemplate: ['yesno', config.shareAsTemplate, { label: 'dco.shareAsTemplate', column: 1 }],
                interactionMode: ['radio', config.interactionMode, { label: 'dco.interactionMode', validators: [ validators.required ], options: interactionModes, column: 1 }],
                preview: ['imageInput', config.preview, { label: 'dco.imagePreview', validators: [], column: 2 }]
            }, { label: 'dco.generalconfig', template: builder.templates.group.twoColumns }),
            builder.group({
                skipHome: ['yesno', config.skipHome, { label: 'dco.skipHome' }],
                displayMode: ['optionList', config.displayMode, { label: 'dco.displayMode', options: displayModes }],
                width: ['text', config.width, { label: 'dco.width', validators:[validators.sizeUnit] , small: true }],
                height: ['text', config.height, { label: 'dco.height', validators:[validators.sizeUnit], small: true }],
            }, { label: 'dco.viewOptions' })
        ]);
        const titleText = config.name + ' - ' + App.i18n.t('dco.propertiesTitle');
        let manager = new App.ui.components.FormManager({formConfig, titleText});
        setTimeout(() => {
            manager.openDialog({ width: '60vw'}).then(updatedProperties => {
                let properties = Object.assign({}, updatedProperties[0]);
                properties = Object.assign(properties, updatedProperties[1]);
                this.dco.update(properties);
            }).catch((err) => {
                console.log(err);
            });
        }, 200);
    }

    responsiveView(ui) {
        $(ui.item).toggleClass('checked');
        $.observable(App.ui).setProperty('responsive', !App.ui.responsive);
        if (this.activeTab == CONTENT_TAB) {
            const template = ['#gui-editor-', CONTENT_TAB, '-content', App.ui.responsive ? '-responsive': ''].join('');
            $.observable(this.contentModel).setProperty('template', template);
            this.headRendered = false;
            this.contentTreeSelectionHandler(this.contentTreeManager.getSelection());
            //this.renderFirst();
        }

        App.ui.$content.toggleClass('responsive-view');
        if (App.ui.responsive) {
            $.observe(this.contentModel, 'responsiveDevice', this.onDeviceChanged.bind(this));
            App.ui.$content.addClass(this.contentModel.responsiveDevice);
        }
        else {
            $.unobserve(this.contentModel, 'responsiveDevice');
            App.ui.$content.removeClass(this.contentModel.responsiveDevice);
        }
    }

    onDeviceChanged(ev, args) {
        let oldDevice = args.oldValue || defaultDevice;
        App.ui.$content.removeClass(oldDevice).addClass(this.contentModel.responsiveDevice);
    }

    notimplemented(){
        alert('Esta opción aún no se ha implementado');
    }

    renderHead(node) {
        const $frame = $('#editor-container-frame');
        this.editor = $frame.get(0);
        if (node.id == '_root') {
            this.editor.isIndex = true;
            this.editor.container = 'index';
        }
        else {
            this.editor.isIndex = false;
            this.editor.container = 'content';
        }
        const html = App.data.dco.getHtml(this.editor.container);
        let promise = new Promise((resolve, reject) => {
            this.editor.resolve = resolve;
            this.editor.reject = reject;
            this.editor.srcdoc = html; //HTML5 only property
        })
        $frame.off('load').on('load', () => {
            const $content = $frame.contents();
            const $head = $content.find('head');
            if (App.ui.responsive) {
                $head.append('<meta name="viewport" content="width=device-width, initial-scale=1.0" />');
            }
            const template = TemplateManager.get('pageViewStyles');
            $head.append(template.render());
            this.registerEditHandlers();
            this.editor.resolve();
        });
        return promise;
    }

    render(node) {
        let section;
        if (node.id == '_root') {
            if (!this.editor.isIndex) {
                this.renderHead(node);
                return;
            }
        }
        else {
            if (this.editor.isIndex) {
                this.renderHead(node).then(() => this.render(node));
                return;
            }

            if (node.type == 'page') {
                const page = App.data.dco.getPage(node.id);
                section = page.getSectionAt(0);
                this.loadPageInEditor(page, section);
            }
            else {
                if (node.parent == '_floating') {
                    return; //ToDo: Need to display the hidden section
                }
                else {
                    const page = App.data.dco.getPage(node.parent);
                    section = page.getSection(node.id);
                    this.loadPageInEditor(page, section);
                }
            }
        }
        return;
    }

    get editorWindow() {
        return this.editor.contentWindow;
    }
    get tepuyApp() {
        return this.editorWindow.dhbgApp;
    }

    loadPageInEditor(page, section) {
        const pageIndex = App.data.dco.pages.indexOf(page);
        const sectionIndex = page.sections.indexOf(section);
        this.tepuyApp.loadPage(pageIndex, sectionIndex);
    }

    registerEditHandlers() {
        const _$ = this.editorWindow.$;
        _$(this.editorWindow.document).on('click', '[data-cmpt-type] .tepuy-action', (ev) => {
            const $target = _$(ev.target); //Need to use jQuery form the frame window so it has all the tepuy plugins added
            const data = $target.data();
            if (/^add/.test(data.tepuyAction)) {
                this.appendComponentDialog(data, $target, data.tepuyAction);
            }
            else if (data.tepuyAction == 'remove') {
                this.removeComponent(data, $target);
            }
            else if (/^move-(up|down)$/.test(data.tepuyAction)) {
                this.moveComponent(data, $target);
            }
            else if (data.tepuyAction == 'edit') {
                this.editComponent(data, $target);
            }
        }).on('mouseover', '[data-cmpt-type]', function(e) {
            e.stopImmediatePropagation();
            _$('.tepuy-edit-toolbar.'+this.id).show();
        }).on('mouseout', '[data-cmpt-type]', function(e) {
            e.stopImmediatePropagation();
            _$('.tepuy-edit-toolbar.'+this.id).hide();
        }).on('tepuy.scorm-playing', (ev) => {
            ev.preventDefault();
            const page = App.data.dco.pages[0];
            page && this.contentTreeManager.setSelection(page.id);
        });
    }

    appendComponentDialog(data, $target, action) {
        const $cmpt = $target.closest('[data-cmpt-type]');
        const id = $cmpt.get(0).id;
        let ed = this.componentEditor;
        if (!ed) {
            ed = this.componentEditor = new ComponentEditor();
        }
        ed.setTitle(App.i18n.t('component.addTitle'));
        ed.setAcceptText(App.i18n.t('commands.add'));
        ed.show().then((child) => {
            //Find the parent by id then append the selected node
            let component = App.data.dco.getComponent(id, this.editor.container);
            const options = { refEl: $cmpt };
            if (action == 'add-before') {
                options.position = 'before';
                component = component.parent;
            }
            else if (action == 'add-after') {
                options.position = 'after';
                component = component.parent;
            }
            component.appendChild(child, options);
            component.parser.registerComponent(child, this.editor.container); //Required for the dco.getComponent() method to work with new added components
            App.data.dco.updateHtml(this.editor.container);
        }, (err) => {
            if (err == null) return; //Dialog cancelled
            //ToDo: handle error.
        });
    }

    editComponent(data, $target) {
        const $cmpt = $target.closest('[data-cmpt-type]');
        const id = $cmpt.get(0).id;

        let ed = this.componentEditor;
        if (!ed) {
            ed = this.componentEditor = new ComponentEditor();
        }

        ed.setTitle(App.i18n.t('component.editTitle'));
        ed.setAcceptText(App.i18n.t('commands.accept'));

        const component = App.data.dco.getComponent($cmpt.get(0).id, this.editor.container);
        component.$host = $cmpt;

        ed.show(component).then((cmpt) => {
            //update Html
            component.parser.updateComponentRegistration(this.editor.container, id, cmpt.id);
            App.data.dco.updateHtml(this.editor.container);
        }, (err) => {
            if (err == null) return; //Dialog cancelled
            //ToDo: handle error.
        });
    }

    removeComponent(data, $target) {
        const $cmpt = $target.closest('[data-cmpt-type]');
        const text = 'component.deleteConfirmation';
        const question = App.i18n.t(text, {  }, {interpolation: {escapeValue: false}});
        const title = App.i18n.t('component.deleteTitle');

        App.ui.components.Dialog.confirm(question, title).then(result => {
            if (!result) return;
            const component = App.data.dco.getComponent($cmpt.get(0).id, this.editor.container);
            component.$host = $cmpt;
            if (component) {
                component.parser.unregisterComponent(component);
                component.remove(); //Remove the node from the tree
                App.data.dco.updateHtml(this.editor.container);
            }
        });
    }

    moveComponent(data, $target) {
        const direction = data.tepuyAction.replace('move-', '');
        const $cmpt = $target.closest('[data-cmpt-type]');
        const id = $cmpt.get(0).id;
        const component = App.data.dco.getComponent(id, this.editor.container);
        component.$host = $cmpt;
        const parent = component.parent;

        if (data.tepuyAction == 'move-up') {
            parent.moveUp(component);
        }
        else {
            parent.moveDown(component);
        }
        App.data.dco.updateHtml(this.editor.container);
    }


    resize($viewer) {
        let height = $viewer.get(0).contentWindow.document.documentElement.scrollHeight + 'px';
        $viewer.css({height: height});
    }
}