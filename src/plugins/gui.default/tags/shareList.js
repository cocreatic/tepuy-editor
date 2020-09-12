import { Validators } from '../components/validators';

export const shareList = {
    template: '#gui-default-sharelist',
    editable: true,
    deleteConfirmation: false,
    bindTo: [0],
    bindFrom: ["editable", "deleteConfirmation"],
    linkedCtxParam: ["canEdit", "shouldConfirm"],
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
        let confirmPromise = Promise.resolve(true);
        if (this.shouldConfirm) {
            const app = window.tepuyEditor.App;
            confirmPromise = app.ui.components.Dialog.confirm(app.i18n.t('dco.removeAccessConfirmation'), app.i18n.t('dco.removeAccessTitle'));
        }
        confirmPromise.then(confirmed => {
            if (confirmed) {
                $.observable(this.tagCtx.contentView.data).remove(index);
            }
        });
    },
    toggleRole: function(index) {
        const data = this.tagCtx.contentView.data[index];
        const oldData = { ...data };
       $.observable(data).setProperty('role', data.role == 'edit' ? 'read' : 'edit');
       $.observable(this.tagCtx.contentView.data)._trigger(data, {change: "set", path: index, value: data, oldValue: oldData, remove: undefined})
    },
    onBind: function(tagCtx) {
        this.editable = !(tagCtx.props.editable === false);
        this.shouldConfirm = tagCtx.props.deleteConfirmation === true;
    },
    invalidContact: function() {
        const ctrl = { value: this.model.email };
        return Validators.required(ctrl) || Validators.email(ctrl);
    },
    onUpdate: false,
    dataBoundOnly: true
};
shareList.invalidContact.depends = ["model.email"];
