import { App } from '../../js/app';
import i18next from 'i18next';
import { Dco, Page } from '../../js/dco';
import { TemplateManager } from './templateManager';
import { TreeItemEditor } from './treeItemEditor';
import moment from 'moment';

const templateMap = {
    sidebar: 'script#gui-editor-sidebar',
    content: 'script#gui-editor-content',
    editPage: 'script#gui-editor-edit-page'
}

export class GuiEditor {

    constructor() {
        App.registerHook('gui_view_editor', this.initialize.bind(this));
        App.registerHook('gui_menu_initialize', this.registerMenu.bind(this));
    }

    initialize(template) {
        const sidebarTpl = TemplateManager.get('sidebar');
        const contentTpl = TemplateManager.get('content');
        this.sidebarModel = {};
        this.contentModel = {};
        this.dco = App.data.dco;
        //App.data.dco = this.dco = new Dco(template, App.storage);

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
        switch(id) {
            case 'tab-1':
                this.loadContentTab();
                break;
            case 'tab-3':
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
        App.registerHook('gui_menu_view_responsive', this.notimplemented.bind(this));
        App.registerHook('gui_menu_help_manual', this.notimplemented.bind(this));
        App.registerHook('gui_menu_help_about', this.about.bind(this));
        App.registerHook('gui_menu_profile_logout', this.logout.bind(this));
 

    }

    loadContentTab() {
        if (!this.sidebarModel.content){
            const oTree = App.data.dco.objectTree();
            let tree = { children: [], expanded: true, root: true };
            for(var page of oTree.pages) {
                var node = {id: page.id, title: page.title, children: [], type: 'page', parent: tree };
                tree.children.push(node);
                if (page.sections && page.sections.length) {
                    node.children = page.sections.map(section => { return {id: section.id, title: section.title, type: 'section', parent: node }});
                }
            }
            let extras = App.data.dco.extras().slice(0);
            $.observable(this.sidebarModel).setProperty('content', {
                tree: tree,
                extras: extras,
                treeCommand: this.onTreeCommand.bind(this)
            });
            setTimeout(() => App.ui.$sidebar.localize(), 100);
        }
        $.observable(this.contentModel).setProperty('template', ['#gui-editor-', 'tab-1', '-content'].join(''));
        this.renderFirst();
    }

    loadResourceTab() {
        if (!this.sidebarModel.resources) {
            if (!this.contentModel.resources){
                this.loadResources('/');
            }
            setTimeout(() => App.ui.$sidebar.localize(), 100);
        }
        $.observable(this.contentModel).setProperty('template', ['#gui-editor-', 'tab-3', '-content'].join(''));
    }

    loadResources(path){
        var resources = this.dco.getResources(path);
        let children = [];
        if (!this.sidebarModel.resources) {
            let tree = { children: [], expanded: true, root: true, id: '/' };
            $.observable(this.sidebarModel).setProperty('resources', {
                tree: tree,
                treeCommand: this.onTreeCommand.bind(this),
                onAction: this.onResourceAction.bind(this)
            });
        }
        let parent = this.getNodeWithPath(path, this.sidebarModel.resources.tree);
        for(var resource of resources) {
            resource.icon = this.getIcon(resource);
            if (resource.thumbnail && resource.thumbnail != '') {
                resource.thumb = resource.thumbnail;
            }
            let child = {id: resource.path, title: resource.name, parent: parent, icon: resource.icon };
            if (resource.type == 'D') {
                child.loaded = false;
                child.children = [];
            }
            children.push(child);
        }
        $.observable(this.contentModel).setProperty("resourceClick", this.resourceClick.bind(this));
        $.observable(this.contentModel).setProperty("resourceDblClick", this.resourceDblClick.bind(this));
        $.observable(this.contentModel).setProperty("resourceDragEnter", this.resourceDragEnter.bind(this));
        $.observable(this.contentModel).setProperty("resourceDragLeave", this.resourceDragLeave.bind(this));
        $.observable(this.contentModel).setProperty("resourceDrop", this.resourceDrop.bind(this));
        $.observable(this.contentModel).setProperty("resources", resources);
        $.observable(this.contentModel).setProperty("resourcesPath", path);
        $.observable(parent.children).refresh(children);
    }

    resourceClick(resource, ev, args) {
        let $el = $(ev.target);
        $el
            .closest('.container')
            .find('.resource.thumbnail')
            .addClass('ui-state-default')
            .removeClass('ui-state-highlight');
        $el
            .closest('.resource.thumbnail')
            .addClass('ui-state-highlight');
    }

    resourceDblClick(resource, ev, args) {
    }

    resourceDragEnter(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        $('.dropzone').addClass('ui-state-highlight');
    }

    resourceDragLeave(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        $('.dropzone').removeClass('ui-state-highlight');
    }

    resourceDrop(ev) {
        let dt = ev.dataTransfer || ev.originalEvent.dataTransfer;
        let files = dt.files;
        this.uploadFiles([...files]);
    }

    onResourceAction(ev, args) {
        let $el = $(ev.target).closest('.ui-button');
        let action = $el.data().action;

        let method = this['resource'+action].bind(this);
        method($el);
    }

    resourceupload(target) {
        let $uploader = $('<input type="file" multiple="true"/>').css({display:'none'}).appendTo('body')
            .on('change', (ev) => {
                this.uploadFiles(ev.target.files);
                $uploader.remove();
            })
        $uploader.trigger('click');
    }

    uploadFiles(files) {
        for(let file of files) {
            let resource = {
                type: 'F',
                name: file.name,
                size: Math.round(file.size / 1024) + ' KB',
                createdAt: moment(file.lastModifiedDate).format('YYYY-MM-DD HH:mm'),
                extension: file.name.substring(file.name.lastIndexOf('.'))
            }
            resource.icon = this.getIcon(resource);

            let child = {id: this.contentModel.resourcesPath + file.name, title: file.name, parent: this.sidebarModel.resources.tree, icon: resource.icon };
            $.observable(this.sidebarModel.resources.tree.children).insert(child);
            $.observable(this.contentModel.resources).insert(resource);
        }
    }

    resourcenewfolder() {
        this.notimplemented();
    }

    getNodeWithPath(path, root) {
        if (path == root.id) {
            return root;
        }
        for(child of root.children) {
            if (child.path.indexOf(path)) {
                return this.getNodeWithPath(path, child)
            }
        }
        return null;
    }

    getIcon(resource) {
        if (resource.type == 'D') return 'folder';
        if (/^(png|jpg|gif|jpeg|)$/.test(resource.extension)) {
            return 'file-image';
        }
        if (/^(png|jpg|gif|jpeg|)$/.test(resource.extension)) {
            return 'file-doc';
        }
        if (/^(mp3|wav)$/.test(resource.extension)) {
            return 'file-audio';
        }
        if (/^(mp4|mpeg)$/.test(resource.extension)) {
            return 'file-video';
        }
        if (/^(pdf)$/.test(resource.extension)) {
            return 'file-pdf';
        }
        return 'file';
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
        const config = this.dco.config;
        const formConfig = builder.array([
            builder.group({
                shareAsTemplate: ['yesno', config.shareAsTemplate, { label: 'dco.shareAsTemplate', column: 1 }],
                interactionMode: ['radio', config.interactionMode, { label: 'dco.interactionMode', validators: [ validators.required ], options: interactionModes, column: 1 }],
                preview: ['imageInput', config.preview, { label: 'dco.imagePreview', validators: [], column: 2 }]
            }, { label: 'dco.generalconfig', template: builder.templates.group.twoColumns }),
            builder.group({
                skipHome: ['yesno', config.skipHome, { label: 'dco.skipHome' }],
                displayMode: ['optionList', config.displayMode, { label: 'dco.displayMode', options: displayModes }],
                width: ['text', config.width, { label: 'dco.width', validators:[validators.validateSize] , small: true }],
                height: ['text', config.height, { label: 'dco.height', validators:[validators.validateSize], small: true }],
            }, { label: 'dco.viewOptions' })
        ]);
        const titleText = this.dco.config.name + ' - ' + i18next.t('dco.propertiesTitle');
        let manager = new App.ui.components.FormManager({formConfig, titleText});
        setTimeout(() => {
            manager.openDialog().then(updatedProperties => {
                let properties = Object.assign({}, updatedProperties[0]);
                properties = Object.assign(properties, updatedProperties[1]);
                this.dco.update(properties);
            }).catch((err) => {
                console.log(err);
            });
        }, 200);
    }

    notimplemented(){
        alert('Esta opción aún no se ha implementado');
    }

    onTreeCommand(data, action, target) {
        let node = $(target).closest('.tpe-tree-node');

        let editor = new TreeItemEditor(action, data, target);
        return editor.run().then(result => {
            this.render();
            return result;
        });
    }

    renderFirst() {
        let $head = $('#editor-container-frame').contents().find('head');
        let template = TemplateManager.get('pageViewStyles');
        $head.append(template.render());
        this.render();
    }

    render() {
        let $viewer = $('#editor-container-frame')
        let $body = $viewer.contents().find('body');

        let html = [];
        let template = TemplateManager.get('pageView');
        let home = App.data.dco.getHome();
        html.push(template.render(home));
        for(let page of App.data.dco.getPages()) {
            html.push(template.render(page));
        }

        $body.html(html.join('<br\\>'));
        this.resize($viewer);
    }

    resize($viewer) {
        let height = $viewer.get(0).contentWindow.document.documentElement.scrollHeight + 'px';
        $viewer.css({height: height});
    }

/*
  $("#form1a").validate({
    //required to validate jQuery UI select menu
    ignore: [],
    //rules for all form fields
    rules:{
      name1a: {required: true, fullName: true,},
      gender1a: {required: true, },
      drinks1a: {required: true, },
      food1a: {required: true,},
      food1a_1: {required: function(element) {
        return $("#food1a").val() == 1;
        }}
      },
      errorPlacement: function(error, element) {
if ( element.is(":radio") || element.is(":checkbox")) {
error.appendTo( element.parent());
} else if (element.is("select")) {
  error.appendTo( element.parent().next());
} else {
error.insertAfter(element);
}},
      errorClass: "ui-tooltip ui-widget ui-corner-all ui-widget-content",
    errorElement: "span",
    highlight: function(element, errorClass, validClass) {$(element).addClass("ui-widget-content").removeClass(validClass);},
    unhighlight: function(element, errorClass, validClass) {$(element).removeClass("ui-widget-content").addClass(validClass);},
    });
    //
    //  End of Form Validation
    ///////////////////////////////*/
}