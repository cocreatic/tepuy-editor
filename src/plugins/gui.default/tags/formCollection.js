import { Validators } from '../components/validators';

export const formCollection = {
    template: '#gui-default-formgroup-collection',
    editable: true,
    deleteConfirmation: false,
    bindTo: [0],
    bindFrom: ["editable", "deleteConfirmation"],
    linkedCtxParam: ["canEdit", "shouldConfirm"],
    displayElem: 'div',
    init: function(tagCtx) {
        //this.controlsarr = this.tagCtx.args[0];
        this.settings = this.tagCtx.props.settings;
        this.required = this.settings && this.settings.required;
    },
    //Methods
    add: function() {
        const defaultValue = JSON.parse(this.settings.defValue||'{}');
        const group = this.settings.groupBuilder(defaultValue);
        const formArray = this.tagCtx.contentView.data;

        console.log(this.tagCtx.contentView.data);
        formArray.push(group); //Push on FormArray
        $(this.tagCtx.view.parentElem).localize();
    },
    remove: function(index) {
        let confirmPromise = Promise.resolve(true);
        if (this.shouldConfirm) {
            const app = window.tepuyEditor.App;
            confirmPromise = app.ui.components.Dialog.confirm(app.i18n.t('dco.removeAccessConfirmation'), app.i18n.t('dco.removeAccessTitle'));
        }
        confirmPromise.then(confirmed => {
            if (confirmed) {
                const formArray = this.tagCtx.contentView.data;
                formArray.removeAt(index);
            }
        });
    },
    onBind: function(tagCtx) {
        this.editable = !(tagCtx.props.editable === false);
        this.shouldConfirm = tagCtx.props.deleteConfirmation === true;
    },
//    invalidContact: function() {
//        const ctrl = { value: this.model.email };
//        return Validators.required(ctrl) || Validators.email(ctrl);
//    },
    onUpdate: false,
    dataBoundOnly: true
};
//shareList.invalidContact.depends = ["model.email"];
