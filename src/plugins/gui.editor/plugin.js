import moment from 'moment';

import { App } from '../../js/app';
import { TemplateManager } from './templateManager';
import { ContentTreeManager } from './contentTreeManager';
import { ResourceTreeManager } from './resourceTreeManager';


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
        //App.data.dco = this.dco = new Dco(template, App.storage);

        contentTpl.link(App.ui.$content, this.contentModel);
        sidebarTpl.link(App.ui.$sidebar, this.sidebarModel);

        $('#tabs').localize().tabs({
            activate: (event, ui) => {
                this.activateTab(ui.newTab, ui.oldTab);
            }
        });

        this.activateTab(App.ui.$sidebar.find('li[data-tab-id="tab-1"]'));
        $( "#tpe-modal-create-folder" ).hide();
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
        this.renderFirst();
    }

    initializeContentTreeManager() {
        this.contentTreeManager = new ContentTreeManager(this.contentTreeActionHandler.bind(this));
        return this.contentTreeManager.getConfig();
    }

    contentTreeActionHandler(result) {
        this.render();
    }

    loadResourceTab() {
        if (!this.sidebarModel.resources) {
            const treeConfig = this.initializeResourceTreeManager();
            $.observable(this.sidebarModel).setProperty('resources', {
                ...treeConfig,
                onAction: this.resourceTreeManager.onSidebarAction
            });

            if (!this.contentModel.resources){
                this.loadResources();
            }
            setTimeout(() => App.ui.$sidebar.localize(), 100);
        }
        $.observable(this.contentModel).setProperty('template', ['#gui-editor-', RESOURCES_TAB, '-content'].join(''));
    }

    initializeResourceTreeManager() {
        this.resourceTreeManager = new ResourceTreeManager();
        this.contentModel.resourceManager = this.resourceTreeManager;

        $.observe(this.resourceTreeManager, 'currentPath', () => {
            this.loadResources();
        });
        return this.resourceTreeManager.getConfig();
    }

    loadResources(){
        this.resourceTreeManager.getResources().then(resources => {
            $.observable(this.contentModel).setProperty({
                resources: resources
            });
        })
//        $.observable(this.contentModel).setProperty({
//            "resourceClick": this.resourceTreeManager.resourceClick.bind(this),
//            "resourceDblClick": this.resourceTreeManager.resourceDblClick.bind(this),
//            "resourceDragEnter": this.resourceTreeManager.resourceDragEnter.bind(this),
//            "resourceDragLeave": this.resourceTreeManager.resourceDragLeave.bind(this),
//            "resourceDrop": this.resourceTreeManager.resourceDrop.bind(this)
//        });
//
        //$.observable(this.contentModel).setProperty("resourcesPath", path);
        //$.observable(parent.children).refresh(children);

/*

        this.dco.getResources(path).then((resources) => {
            let children = [];
            if (!this.sidebarModel.resources) {
                let tree = { children: [], expanded: true, root: true, id: '/' };
                $.observable(this.sidebarModel).setProperty('resources', {
                    tree: tree,
                    //treeCommand: this.onTreeCommand.bind(this),
                    onAction: this.onResourceAction.bind(this)
                });
            }
            let parent = this.getNodeWithPath(path, this.sidebarModel.resources.tree);
            for(const resource of resources) {
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
            
            $.observable(this.contentModel).setProperty("resources", resources);
            $.observable(this.contentModel).setProperty("resourcesPath", path);
            $.observable(parent.children).refresh(children);
        });
        */
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

            this.dco.addResource(resource, this.contentModel.resourcesPath).then(response => {
                let child = {id: this.contentModel.resourcesPath + file.name, title: file.name, parent: this.sidebarModel.resources.tree, icon: resource.icon };
                $.observable(this.sidebarModel.resources.tree.children).insert(child);
                $.observable(this.contentModel.resources).insert(resource);
                resource.path = response.path;
            })

        }
    }

    resourcenewfolder() {
//        const now = new Date();
//        this.dco.addResource({
//            name: 'Folder ' + now.getTime(),
//            type: 'D',
//            createdAt: moment(now).format('YYYY-MM-DD HH:mm')
//        }, this.contentModel.resourcesPath).then(res => {
//            this.loadResources(this.contentModel.resourcesPath);
//        });

        var pahtFolder  =this.contentModel.resourcesPath;
        var date  = new Date();
        var createDate = (date.getFullYear()) + "-" + (date.getMonth() +1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes();
        var resource = $.observable(this.contentModel.resources);


         $( "#tpe-modal-create-folder" ).dialog({
            resizable: false,
            height: "auto",
            width: 400,
            modal: true,
            buttons: {
            "Crear": function() {            
                    var newFolder = 
                    { 
                        id: $('#name_folder').val(),                       
                        name: $('#name_folder').val(),
                        type: "D",
                        path: pahtFolder,
                        createdAt: createDate,
                        isDro: false,
                        extension: '',
                        thumbnail: ''
                    };
                    console.log(newFolder);
                    resource.insert(newFolder);
                    $( this ).dialog( "close" );
                }
            }
        });
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
            this.renderFirst();
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

    renderFirst() {
        const $head = $('#editor-container-frame').contents().find('head');
        if (App.ui.responsive) {
            $head.append('<meta name="viewport" content="width=device-width, initial-scale=1.0" />');
        }
        const template = TemplateManager.get('pageViewStyles');
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