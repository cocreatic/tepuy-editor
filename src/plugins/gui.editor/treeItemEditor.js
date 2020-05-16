import { App } from '../../js/app';
import { TemplateManager } from './templateManager';

export class TreeItemEditor {
    constructor(action, data, target) {
        this.action = action;
        this.data = data;
        this.target = target;
    }

    run() {
        this.promise = new Promise((resolve, reject) => {
            this.accept = resolve;
            this.cancel = reject;
            let method = this[this.action].bind(this);
            if (method) method();
        });
        return this.promise;
    }

    add() {
        let formOptions = {};
        let model = { isNew: true };
        let data = this.data;

        if (data.type == 'page') {
            formOptions.template = TemplateManager.get('editSection');
            formOptions.title = 'editSection.newTitle';
            model.id = 'section_' + Date.now();
            formOptions.accept = this.acceptSection.bind(this);
        }
        else {
            formOptions.template = TemplateManager.get('editPage');
            formOptions.title = 'editPage.newTitle';
            model.id = 'page_' + Date.now();
            formOptions.accept = this.acceptPage.bind(this);
        }
        model.title = '';
        model.appendAt = 'end';
        model.refPos = -1;
        model.references = data.children;
        formOptions.model = model;
        formOptions.acceptText = 'commands.add';
        formOptions.cancelText = 'commands.cancel';
        this.openForm(formOptions);
    }

    edit() {
        let formOptions = {};
        let model = {};
        let data = this.data;
        let index = data.parent.children.indexOf(data);

        if (data.type == 'page') {
            formOptions.template = TemplateManager.get('editPage');
            formOptions.title = 'editPage.editTitle';
            let page = App.data.dco.getPage(data.id);
            model.id = page.id;
            model.title = page.title;
            formOptions.accept = this.acceptPage.bind(this);
        }
        else {
            formOptions.template = TemplateManager.get('editSection');
            formOptions.title = 'editSection.editTitle';
            let page = App.data.dco.getPage(data.parent.id);
            let section = page.getSection(data.id);
            model.id = section.id;
            model.title = section.title;
            formOptions.accept = this.acceptSection.bind(this);
        }
        model.appendAt = index == 0 ? 'first' : 'after';
        model.refPos = --index;
        model.references = data.parent.children;
        formOptions.model = model;
        formOptions.acceptText = 'commands.edit';
        formOptions.cancelText = 'commands.cancel';
        this.openForm(formOptions);
    }

    moveup() {
        let data = this.data;
        let index = data.parent.children.indexOf(data);
        if (data.type == 'page') {
            this.movePage(index, --index);
        }
        else {
            this.moveSection(index, --index);
        }
    }

    movedown() {
        let data = this.data;
        let index = data.parent.children.indexOf(data);
        if (data.type == 'page') {
            this.movePage(index, ++index);
        }
        else {
            this.moveSection(index, ++index);
        }
    }

    acceptPage(page) {
        let data = this.data;
        if (!page.title || page.title == '') {
            return false; //Invalid
        }

        let item = {
            id: page.id,
            title: page.title
        };
        let index = -1;
        if (page.isNew) {
            item.type = 'page';
            item.parent = data;
            item.children = [];
        }
        else {
            $.observable(data).setProperty('title', item.title);
        }
        item.appendAt = page.appendAt;
        item.refPos = parseInt(page.refPos);

        //let index = -1; //page.isNew ? data.children.length : data.parent.children.indexOf(data);
        let end = page.isNew ? data.children.length : data.parent.children.length;
        if (item.appendAt == 'before' || item.appendAt == 'after') {
            index = item.refPos + (item.appendAt == 'before' ? 0 : 1);
        }
        else {
            index = item.appendAt == 'first' ? 0 : data.children.length;
        }
        if (index < 0) index = 0;
        if (index > end) index = end;
        if (page.isNew) {
            $.observable(data.children).insert(index, item);
            App.data.dco.addPage(item, index);
        }
        else {
            let current = data.parent.children.indexOf(data);
            if (current != index) {
                $.observable(data.parent.children).move(current, index);
                App.data.dco.movePage(page.id, index);
            }
            let oPage = App.data.dco.getPage(page.id);
            oPage.title = page.title;
        }
        this.accept({action: page.isNew ? 'add' : 'edit', item });
        return true;
    }

    acceptSection(section) {
        let data = this.data;
        if (!section.title || section.title == '') {
            return false; //Invalid
        }

        let item = {
            id: section.id,
            title: section.title
        };
        let index = -1;
        if (section.isNew) {
            item.type = 'section';
            item.parent = data;
        }
        else {
            $.observable(data).setProperty('title', item.title);
        }
        item.appendAt = section.appendAt;
        item.refPos = parseInt(section.refPos);

        //let index = -1; //page.isNew ? data.children.length : data.parent.children.indexOf(data);
        let end = section.isNew ? data.children.length : data.parent.children.length;
        if (item.appendAt == 'before' || item.appendAt == 'after') {
            index = item.refPos + (item.appendAt == 'before' ? 0 : 1);
        }
        else {
            index = item.appendAt == 'first' ? 0 : data.children.length;
        }
        if (index < 0) index = 0;
        if (index > end) index = end;
        let oPage = App.data.dco.getPage(section.isNew ? data.id : data.parent.id);
        if (section.isNew) {
            $.observable(data.children).insert(index, item);
            oPage.addSection({id: item.id, title: item.title});
        }
        else {
            let current = data.parent.children.indexOf(data);
            if (current != index) {
                $.observable(data.parent.children).move(current, index);
                oPage.moveSection(section.id, index);
            }
            let oSection = oPage.getSection(section.id);
            oSection.title = section.title;
        }
        this.accept({action: section.isNew ? 'add' : 'edit', item });
        return true;
    }

    openForm(formOptions) {
        let $dlg = $("#tpe-modal-edit-dlg").dialog({
            appendTo: '.tpe-editor-default',
            modal: true,
            autoOpen: false,
            resizable: false,
            title: App.i18n.t(formOptions.title),
            buttons: {
                [App.i18n.t(formOptions.acceptText)]: () => {
                    if (formOptions.accept(formOptions.model)) $dlg.dialog('close');
                },
                [App.i18n.t(formOptions.cancelText)]: () => {
                    this.cancel();
                    $dlg.dialog('close');
                }
            },
            close: () => $dlg.empty().dialog('destroy')
        });
        formOptions.template.link("#tpe-modal-edit-dlg", formOptions.model);
        $dlg.dialog('open');
    }

    movePage(from, to) {
        let data = this.data;
        let parent = data.parent;
        if (to < 0 || to >= parent.children.length) return;
        App.data.dco.movePage(data.id, to);
        $.observable(parent.children).move(from, to);
        let action = from < to ? 'movedown' : 'moveup';
        this.accept({action});
    }

    moveSection(from, to) {
        let data = this.data;
        let parent = data.parent;
        let pidx = parent.parent.children.indexOf(parent);
        if (to < 0 && pidx == 0 || to >= parent.children.length && pidx >= parent.parent.children.length) {
            return;
        }

        let fPage = App.data.dco.getPage(parent.id);
        if (to < 0 || to >= parent.children.length) {
            let tidx = pidx + (to < 0 ? -1 : 1);
            let tpage = parent.parent.children[tidx];
            let tPage = App.data.dco.getPage(tpage.id);
            let section = data;
            $.observable(parent.children).remove(from);
            section.parent = tpage;
            let toidx = to < 0 ? tpage.children.length : 0;
            $.observable(tpage.children).insert(toidx, section);
            $.observable(tpage).setProperty("expanded", true);
            let oSection = fPage.removeSection(section.id);
            tPage.addSection(oSection, toidx);
        }
        else {
            $.observable(parent.children).move(from, to);
            fPage.moveSection(data.id, to);
        }
        let action = from < to ? 'movedown' : 'moveup';
        this.accept(action);
    }

    removeTreeItem(data, resolve, reject) {
        let parent = data.parent;
        let index = parent.children.indexOf(data);
        $.observable(parent.children).remove(index);
        resolve({action: 'remove', item: data});
    }

    getTemplate(templateName) {
        if (!$.templates[templateName]) {
            $.templates({[templateName]: templateMap[templateName]});
        }
        return $.templates[templateName];
    }

}