import { App } from '../../js/app';

import { Validators } from './components/validators';

const iconMap = {
    "file": "file",
    "folder": "folder",
    "file-image": "file-image",
    "file-pdf": "file-pdf",
    "file-audio": "file-audio",
    "file-video": "file-video",
    "file-archive": "file-archive",
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
    "share-view": "eye",
    "check": "check",
    "box": "box"
};

export const helpers = {
    translate: (key) => {
        return App.i18n.t(key);
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
    },
    isoDateTime: (value) => {
        return moment.unix(value).format('YYYY-MM-DD hh:mm a');
    },
    isoDate: (value) => {
        return moment.unix(value).format('YYYY-MM-DD');
    },
    localDateTime: (value) => {
        return moment.unix(value).format('L LT');
    },
    localDate: (value) => {
        return moment.unix(value).format('L');
    }
}

export const icon = {
    init: function(tagCtx) {
        const iconName = tagCtx.args[0];
        this.iconClass = (!iconName || !iconMap[iconName]) ? '' : 'fas fa-'+iconMap[iconName];
        if (tagCtx.props.class) {
            this.iconClass += ' ' + tagCtx.props.class;
        }
    },
    template: '<i data-link="class{merge:true toggle=~tag.iconClass}"></i>',
    render: function(iconName) {
        if (this.iconClass == '') return '';
        return undefined;
    }
}

export const svgIcon = {
    render: function(iconName, ns) {
        if (!iconName) return '';
        return ['<svg class="svgicon"><use xlink:href="themes/svg-icons.svg#', iconName, '" /></svg>'].join('');
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
            this.contents(true, 'ul').addClass('ui-widget tpy-tree');
        }
        this.contents(true, '.tpy-tree-node').data('item', this.getData());
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
    select: function(){

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
            '#gui-default-sharelist-item'; //<div class="tpy-form-list-item"><span>{^{:email}}</span>{^{:~icon(edit?"share-edit":"share-view")}}';
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



function Uploader() {
    let resolveFn;
    let open = false;
    const defaultOptions = {
        multiple: false,
    }
    const $uploader = $('<input type="file"/>').css({display:'none'}).appendTo('body')
        .on('change', (ev) => {
            open = false;
            resolveFn(ev.target.files);
            $uploader.attr(defaultOptions);
        });

    this.open = (options) => {
        if (open) return;
        open = true;
        const { accept, capture, multiple } = {...options};
        $uploader.attr({accept, capture, multiple});
        return new Promise((resolve, reject) => {
            $uploader.trigger('click');
            resolveFn = resolve;
        });
    };

}

const uploader = new Uploader();

function uploadFile() {
    let $uploader = $('<input type="file" multiple="true"/>').css({display:'none'}).appendTo('body')
        .on('change', (ev) => {
            this.uploadFiles(ev.target.files);
            $uploader.remove();
        })
    $uploader.trigger('click');
}

export const imageInput = {
    template: '#gui-default-imageinput',
    editable: true,
    bindTo: [0, "editable"],
    linkedCtxParam: ["src", "canEdit"],
    init: function(tagCtx) {
        this.emptyText = tagCtx.props.emptyText ? tagCtx.props.emptyText : 'tags.imageinput.emptySrc';
    },
    onBind: function(tagCtx){
    },
    //Methods
    setValue: function(src) {
        if (src != null && typeof(src) !== 'string') return;
        $.observable(this).setProperty('src', src);
    },
    delete: function() {
        this.setValue(null);
        this.updateValue(null);
    },
    update: function() {
        uploader.open({
            accept: 'image/*'
        }).then(files => {
            if (!files.length) return;
            const file = files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                this.setValue(reader.result);
                this.updateValue(reader.result, true);
            }, false);
            reader.readAsDataURL(file);
        });
    },
    onUpdate: false,
    dataBoundOnly: true
};