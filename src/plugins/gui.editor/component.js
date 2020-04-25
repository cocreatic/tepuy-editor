import { App } from '../../js/app';
import i18next from 'i18next';
import { Page } from '../../js/dco';
import { TemplateManager } from './templateManager';
import { TreeItemEditor } from './treeItemEditor';

const templateMap = {
    sidebar: 'script#gui-editor-sidebar',
    content: 'script#gui-editor-content',
    editPage: 'script#gui-editor-edit-page'
}

let active = true;


export class GuiEditor {

    constructor() {
        App.registerHook('gui_view_editor', this.initialize.bind(this));
        App.registerHook('gui_menu_initialize', this.registerMenu.bind(this));
        this.menu = [
            { text: 'Save', icon: 'ui-icon-disk'},
            { text: 'Zoom In', icon: 'ui-icon-zoomin'}
        ];
    }

    initialize(template) {
        const sidebarTpl = TemplateManager.get('sidebar');
        sidebarTpl.link(App.ui.$sidebar, this.getSidebarData());
        const contentTpl = TemplateManager.get('content');
        let viewModel = { template: '#gui-editor-tab-1-content', data: {} };
        contentTpl.link(App.ui.$content, { viewModel });
        $('#tabs').localize().tabs({
            activate: (event, ui) => {
                this.activateTab(ui.newTab, ui.oldTab);
            }
        });
        $('.container_resource').tooltip();

        this.renderFirst();

        $('.filter').click(function(e){
            e.preventDefault();
            var resources = App.api.call('getResources', {path:this.text}); 
        });
    }

    activateTab(tab, oldTab) {
        let id = tab.data().tabId;
        $.observable(viewModel).setProperty('template', ['#gui-editor-', id, '-content'].join(''));
    }

    showResources(){
        var resources = App.api.call('getResources');
    }

    registerMenu() {
        if (active) {
            App.ui.registerMenuItem({ id: 'file'});
            App.ui.registerMenuItem({ id: 'file_properties'}, 'file');
            App.ui.registerMenuItem({ id: 'file_metadata'}, 'file');
            App.ui.registerMenuItem({ id: 'file_download'}, 'file');
            App.ui.registerMenuItem({ id: 'file_exit'}, 'file');
            App.ui.registerMenuItem({ id: 'view'});
            App.ui.registerMenuItem({ id: 'view_preview'}, 'view');
            App.ui.registerMenuItem({ id: 'view_responsive'}, 'view');
        }
        App.ui.registerMenuItem({ id: 'help'});
        App.ui.registerMenuItem({ id: 'help_manual'}, 'help');
        App.ui.registerMenuItem({ id: 'help_about'}, 'help');

        //Register callbacks
        App.registerHook('gui_menu_file_properties', this.notimplemented.bind(this));
        App.registerHook('gui_menu_file_metadata', this.notimplemented.bind(this));
        App.registerHook('gui_menu_file_download', this.notimplemented.bind(this));
        App.registerHook('gui_menu_file_exit', this.close.bind(this));
        App.registerHook('gui_menu_view_preview', this.notimplemented.bind(this));
        App.registerHook('gui_menu_view_responsive', this.notimplemented.bind(this));
        App.registerHook('gui_menu_help_manual', this.notimplemented.bind(this));
        App.registerHook('gui_menu_help_about', this.about.bind(this));
        App.registerHook('gui_menu_profile_logout', this.logout.bind(this));
 

    }

    getSidebarData() {
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
        var resources = App.api.call('getResources');
        return { 
            content: {
                tree: tree,
                extras: extras,
                treeCommand: this.onTreeCommand.bind(this),
                resources: resources
            }
        };
    }

    //Menu handlers
    close() {
        active = false;
        App.ui.load('home');
    }

    about() {
        if (!this.aboutTpl) this.aboutTpl = $.templates("script#gui-editor-about");
        $(this.aboutTpl.render({})).dialog({ modal: true});
    }

    logout(){
        App.exit();
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