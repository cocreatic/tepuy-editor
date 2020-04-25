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
        contentTpl.link(App.ui.$content, {});
        $('#tabs').localize().tabs();
        this.renderFirst();
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
        return { 
            content: {
                tree: tree,
                extras: extras,
                treeCommand: this.onTreeCommand.bind(this)
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

    appendTreeItem(data, resolve, reject) {
        let item = {}
        if (data.type == 'page') {
            item.title = "Sección ";
            item.type = 'section';
        }
        else {
            this.editPage(null, data).then(newPage => {
                item.title = newPage.title;
                item.type = 'page';
                item.parent = data;
                item.appendAt = newPage.appendAt;
                item.refPage = parseInt(newPage.refPage);
                item.children = [];
                let index = data.children.length;
                if (item.appendAt == 'before' || item.appendAt == 'after') {
                    index = item.refPage + (item.appendAt == 'before' ? -1 : 1);
                }
                else {
                    index = item.appendAt == 'first' ? 0 : data.children.length;
                }
                if (index < 0) index = 0;
                if (index > data.children.length) index = data.children.length;
                $.observable(data.children).insert(index, item);
                resolve({action: 'add', item });
            });
        }
        //item.title +=  (data.children.length + 1);
        //item.parent = data;
    }

    removeTreeItem(data, resolve, reject) {
        let parent = data.parent;
        let index = parent.children.indexOf(data);
        $.observable(parent.children).remove(index);
        resolve({action: 'remove', item: data});
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