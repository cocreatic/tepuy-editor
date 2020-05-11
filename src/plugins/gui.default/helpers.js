import i18next from 'i18next';
import { Validators } from './components/validators';

const iconMap = {
    "file": "file",
    "folder": "folder",
    "file-image": "file-image",
    "file-pdf": "file-pdf",
    "file-audio": "file-audio",
    "file-video": "file-video",
    "file_properties": "list",
    "file_metadata": "tags",
    "file_download": "download",
    "file_exit": "power-off",
    "view": "eye",
    "view_preview": "globe",
    "view_responsive": "mobile-alt",
    "help": "question",
    "help_manual": "book",
    "help_about": "info",
    "content": "poll-h",
    "look": "palette",
    "resources": "archive",
    "log": "clipboard",
    "share": "share",
    "profile_logout": "sign-out-alt",
    "filter": "filter",
    "search": "search",
    "tree-expanded": "chevron-down",
    "tree-collapsed": "chevron-right",
    "add": "plus-circle",
    "remove": "trash-alt",
    "move-up": "chevron-circle-up",
    "move-down": "chevron-circle-down",
    "edit": "pen",
    "folders": "fas fa-folder",
    "png":"far fa-images",
    "pdf": "fa fa-file-pdf",
    "share-edit": "pen",
    "share-view": "eye"
};

export const helpers = {
    translate: (key) => {
        return i18next.t(key);
    },
    icon: (icon) => {
        if (!icon || !iconMap[icon]) return '';
        return icon ? ['<i class="fas fa-', iconMap[icon], '"></i>'].join('') : '';
    },
    debug: (data) => {
        console.log(data);
        return '';
    }
}

export const converters = {
    toYesNo: (value) => {
        return value ? 'yes' : 'not';
    },
    fromYesNo: (value) => {
        return value === 'yes';
    }
}

export const tree = {
    template: "#gui-default-editable-tree",
    editable: false,
    baseTag: 'include',
    rootLabel: '',
    //EVENTS
    init: function(tagCtx){
        //tagCtx.isRoot = (this.parent && this.parent.tagName==='editableTree');
    },
    onBind: function(tagCtx){
        if (!(tagCtx.props.root===false)) {
            this.contents(true, 'ul').addClass('ui-widget tpe-tree');
        }
        this.contents(true, '.tpe-tree-node').data('item', this.getData());
    },
    //METHODS
    toggle: function(){
        let data = this.getData(); // this.tagCtx.view.data;
        $.observable(data).setProperty("expanded", !data.expanded);
    },
    remove: function(){
        let parents = this.parent.tagCtx.view.data.pages,
        index = this.tagCtx.view.index;
        $.observable(parents).remove(index);
    },
    doAction: function(ev){
        if (!this.tagCtx.props.doAction) return;
        let data = this.getData();
        let target = ev.target;
        let action = $(target).data().action;
        this.tagCtx.props.doAction(data, action, ev.target).then(result => {
            if (!result) return;
            switch(result.action) {
                case 'add':
                    $.observable(data).setProperty("expanded", true);
                    break;
                case 'remove': {
                    let parent = data.parent;
                    if (!parent.children.length) {
                        $.observable(parent).setProperty("expanded", false);
                    }
                }
            }
        })
        .catch(reason => {
        });
    },
    getData: function(){
        return this.tagCtx.args && this.tagCtx.args[0] || this.tagCtx.view.data;
    },
    dataBoundOnly: true
};

export const shareList = {
    template: '#gui-default-sharelist',
    editable: true,
    bindTo: ["editable"],
    linkedCtxParam: ["canEdit"],
    displayElem: 'div',
    init: function(tagCtx) {
        this.itemTemplate = this.tagCtx.props.itemTemplate ||
            '#gui-default-sharelist-item'; //<div class="tpe-form-list-item"><span>{^{:email}}</span>{^{:~icon(edit?"share-edit":"share-view")}}';
        this.model = { email: '', role: 'edit' };
    },
    onBind: function(tagCtx){
    },
    //Methods
    add: function() {
        let contact = {...this.model};
        if (!contact.email || !contact.role) {
            return;
        }
        $.observable(this.tagCtx.contentView.data).insert(contact);
        $.observable(this.model).setProperty('email', '');
    },
    remove: function(index) {
        $.observable(this.tagCtx.contentView.data).remove(index);
    },
    invalidContact: function() {
        const ctrl = { value: this.model.email };
        return Validators.required(ctrl) || Validators.email(ctrl);
    },
    onUpdate: false,
    dataBoundOnly: true
};
shareList.invalidContact.depends = ["model.email"];