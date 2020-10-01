import moment from 'moment';
import { App } from '../../js/app';

const resourceTypes = {
    'image': {
        pattern: /^\.?(png|jpg|gif|jpeg|)$/,
        icon: 'file-image'
    },
    'doc': {
        pattern: /^\.?(doc|docx|txt|odt|rtf)$/,
        icon: 'file-doc'
    },
    'audio': {
        pattern: /^\.?(mp3|wav|vlc)$/,
        icon: 'file-audio'
    },
    'video': {
        pattern: /^\.?(mp4|mpeg)$/,
        icon: 'file-video'
    },
    'pdf': {
        pattern: /^\.?(pdf)$/,
        icon: 'file-pdf'
    },
    'archive': {
        pattern: /^\.?(zip|rar|7z|cab)$/,
        icon: 'file-archive'
    }
}
const defaultResourceType = 'file';

function hashCode(string) {
    var hash = 0, i, chr;
    for (i = 0; i < string.length; i++) {
      chr   = string.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return ''+hash;
}

export class ResourceTreeManager {
    
    constructor(actionHandler) {
        this.actionHandler = actionHandler;
        this.dco = App.data.dco;

        //Ensure this context
        this.resourceDrop = this.resourceDrop.bind(this);
        this.onSidebarAction = this.onSidebarAction.bind(this);
        this.files = [];
    }

    getConfig() {
        return this.initializeJsTree();
    }

    initializeJsTree() {
        this.currentPath = '/';
        const me = this;
        const jtData = (node, callback) => {
            const path = me.getNodePath(node);
            me.getResources(path).then(resources => {
                let items = resources.filter(r => r.type == 'D').map(res => {
                    return {
                        id: hashCode(res.path),
                        li_attr: { 'data-path': res.path },
                        text: res.name,
                        parent: node.id,
                        type: me.getFileType(res),
                        state: { loaded: false, failed: false },
                        res: res
                    };
                });

                if (path == '/') {
                    items = [{
                        id: '_root',
                        text: path,
                        type: 'root',
                        li_attr: { "data-root": true, 'data-path': path },
                        children:  items
                    }]
                }
                callback.call(this, items);
            });
        };
        const core = {
            check_callback: (op, node, parent, position, more) => {
                return true;
            },
            multiple: false,
            themes: {
                ellipsis: true
            }
        };
        const valid_children = ['folder', 'file'];
        const types = {
            "root": {
                icon: "fas fa-folder"
            },
            "folder": {
                icon: "fas fa-folder"
            },
            "file": {
                icon: "fas fa-file",
                valid_children: []
            }
        }

        for(const key in resourceTypes) {
            const type = resourceTypes[key];
            types[key] = {
                icon: 'fas fa-' + type.icon,
                valid_children: []
            }
            valid_children.push(key);
        }

        types.root.valid_children = valid_children;
        types.folder.valid_children = valid_children;

        const contextmenu = {
            items: (node) => {
                const type = node.type;
                const actions = {};
                const action = this.jtContextMenuHandler.bind(this, node);
                if (type != 'file') {
                    actions.addFile = {
                        id: 'addFile',
                        label: App.i18n.t('resources.addFile'),
                        action: action,
                        icon: 'fas fa-file'
                    }
                    actions.addFolder = {
                        id: 'addFolder',
                        label: App.i18n.t('resources.addFolder'),
                        action: action,
                        icon: 'fas fa-folder-plus'
                    }
                }
                if (type != 'root') {
                    actions.rename = {
                        id: 'rename',
                        label: App.i18n.t('resources.rename'),
                        action: action,
                        icon: 'fas fa-pen'
                    }
                    actions.delete = {
                        id: 'delete',
                        label: App.i18n.t('resources.delete'),
                        action: action,
                        icon: 'fas fa-trash-alt'
                    }
                }
                return actions;
            }
        }

        const toolbar = {
            items: contextmenu.items
        };

        const dnd = {
            handler: () => {}
        };

        const events = {
            'move_node.jstree': this.jtNodeMoved.bind(this),
            'select_node.jstree': this.jtNodeSelected.bind(this),
            'loaded.jstree': (ev, data) => {
                this.tree = data.instance;
                this.tree.select_node('_root');
                this.tree.open_node('_root');
            }
        };

        const jtConfig = { core, types, contextmenu, dnd, events, toolbar };
        return { jtData, jtConfig };
        //$.observable(this.sidebarModel).setProperty();
    }

    getNodePath(node) {
        if (node.id == '#' || node.id == '_root') return '/';
        return node.li_attr['data-path'];
    }
    /* Events*/
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

    getResources(path) {
        path = path||this.currentPath;
        if (!/\/$/.test(path)) path += '/';
        return this.dco.getResources(path);
    }

    jtContextMenuHandler(node, menu) {
        this.runAction(menu.item.id, node, menu.element).then(result => {
            const handler = this.actionHandler;
            handler(result)
            return result;
        });
    }

    jtNodeMoved(ev, data) {
        const node = data.node;
        if (node.type == 'page') {
            App.data.dco.movePage(node.id, data.position);
        }
        else {
            if (data.old_parent == data.parent) {
                const oPage = App.data.dco.getPage(node.parent);
                oPage.moveSection(section.id, index);
            }
            else {
                const oldPage = App.data.dco.getPage(data.old_parent);
                const newPage = App.data.dco.getPage(data.parent);
                const section = oldPage.removeSection(node.id);
                newPage.addSection(section, data.position);
            }
        }
    }

    jtNodeSelected(ev, data) {
        const path = this.getNodePath(data.node);
        $.observable(this).setProperty('currentPath', path);
        this.getResources(path).then(resources => {
            $.observable(this.files).refresh(
                resources.filter(res => res.type != 'D')
                .map(res => ({...res, icon: this.getFileIcon(res)}))
            );
        })
    }

    jtGetSelection() {
        let selected = this.tree.get_selected();
        if (selected && selected.length) {
            selected = this.tree.get_node(selected);
        }
        else {
            selected = this.tree.get_node('_root');
        }
        return selected;
    }

    jtSelectNode(node) {
        if (!this.tree.is_selected(node)) {
            this.tree.deselect_all();
            this.tree.select_node(node);
        }
    }

    runAction(action, node, target) {
        this.node = node;
        this.action = action;
        this.target = target;
        const promise = new Promise((resolve, reject) => {
            this.accept = resolve;
            this.cancel = reject;
            if (this[action]) this[action]();
        });
        return promise;
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

        this.node = this.jtGetSelection();
        this.uploadFiles([...files]);
    }

    onSidebarAction(ev, args) {
        const $el = $(ev.target).closest('.ui-button');
        const action = $el.data().action;
        const node = this.jtGetSelection();
        const menu = {
            item: { id: action },
            element: $el
        }
        this.jtContextMenuHandler(node, menu);
    }

    addFile(target) {
        //Make the node selected so files will be added to it
        this.jtSelectNode(this.node);
        let $uploader = $('<input type="file" multiple="true"/>').css({display:'none'}).appendTo('body')
            .on('change', (ev) => {
                this.uploadFiles(ev.target.files);
                $uploader.remove();
            })
        $uploader.trigger('click');
    }

    uploadFiles(files) {
        for(let file of files) {
            const resource = {
                type: 'F',
                name: file.name,
                size: Math.round(file.size / 1024) + ' KB',
                createdAt: moment(file.lastModifiedDate).unix(), // .format('YYYY-MM-DD HH:mm'),
                extension: file.name.substring(file.name.lastIndexOf('.')),
                blob: file
            }
            resource.icon = this.getFileIcon(resource);

            this.dco.addResource(resource, this.currentPath).then(response => {
                resource.path = response.path;
                $.observable(this.files).insert(resource);
            }, (error) => {
                console.log(error);
            })

        }
    }

    resourceToNode(resource, parent) {
        return {
            id: hashCode(resource.path),
            text: resource.name,
            parent: parent,
            type: this.getFileType(resource),
            li_attr: { 'data-path': resource.path },
            res: resource
        };
    }

    getFileIcon(resource) {
        for(const key in resourceTypes) {
            const type = resourceTypes[key];
            if (type.pattern.test(resource.extension)) {
                return type.icon;
            }
        }
        return 'file';
    }

    getFileType(resource) {
        if (resource.type == 'D') return 'folder';
        for(const key in resourceTypes) {
            const type = resourceTypes[key];
            if (type.pattern.test(resource.extension)) {
                return key;
            }
        }
        return defaultResourceType;
    }

    addFolder(){
        const data = this.node;
        const model = { isNew: true, title: '' };
        model.label = 'folder';
        model.acceptText = 'resources.addFolder';
        this.editFolder(model);
    }

    rename() {
        const data = this.node;
        const model = { title: data.text };
        model.label = 'folder';
        model.acceptText = 'resources.rename';
        this.editFolder(model);
    }

    editFolder(model){
        const builder = App.ui.components.FormBuilder;
        const validators = App.validation.validators;
        const labelPrefix = model.label;
        const dataP = this.node;
        const pathFolder = this.getNodePath(this.node);
        const title = labelPrefix + (model.isNew ? '.newTitle' : '.editTitle');

        const controls = {
            isNew: ['boolean', model.isNew, { visible: false }],
            title: ['text', model.title, { label: labelPrefix+'.title', validators: [validators.pattern(/^[a-zA-Z0-9\-_+]+$/), validators.maxLength(256) ], maxLength: 256, default: true }],
        };

        const formConfig = builder.group(controls);
        const titleText = App.i18n.t(title);
        const manager = new App.ui.components.FormManager({
            formConfig, titleText,
            acceptText: model.acceptText
        });

        manager.openDialog().then(form => {
            if (model.isNew) {
                let folder = {
                    name: form.title,
                    type: 'D',
                    createdAt: moment().unix()
                };
                this.dco.addResource(folder, pathFolder).then(res => {
                    folder.path = res.path;
                    const node = this.resourceToNode(folder, dataP.id);
                    this.tree.create_node(node.parent, node);
                    this.tree.open_node(node.parent);
                });
            }
            else {
                const node = this.tree.get_node(this.node);
                if (node.text == form.title) return; //Nothing changed. Just return
                this.dco.renameResource(node.original.res, form.title).then(res => {
                    const node = this.tree.get_node(this.node);
                    node.original.text = form.title;
                    node.original.res.path = res.path;
                    node.original.li_attr['data-path'] = res.path;
                    node.li_attr['data-path'] = res.path;
                    this.tree.rename_node(this.node, form.title);
                    this.tree.refresh_node(this.node);
                })
            }
        }).catch((err) => {
            console.log(err);
        });
    }

    delete(){
        const data = this.node;
        const path = this.getNodePath(data);
        const text = 'folder.deleteConfirmation';
        const question = App.i18n.t(text, { [data.type]: data.text }, {interpolation: {escapeValue: false}});
        const title = App.i18n.t('folder.deleteTitle');

        App.ui.components.Dialog.confirm(question, title).then(result => {
            if (result) {
                App.data.dco.deleteResource(path).then(result => {
                    if (!result) {
                        return;
                    }
                    this.tree.delete_node(data);
                });
            }
        });
    }
}