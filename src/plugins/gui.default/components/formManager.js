import { privateMap, _, getSafe } from '../../../js/utils';
import { Dialog } from './dialog';
import i18next from 'i18next';

export const VALID = 'VALID';
export const INVALID = 'INVALID';
export const DISABLED = 'DISABLED';

const filterByColumn = function(item, index, items) {
    return item.prop.settings.column == this.props.column;
};

export class FormManager {
    constructor({formConfig,
        titleText = '',
        acceptText = 'commands.accept',
        cancelText = 'commands.cancel',
        template = '#gui-default-form-container'
    }) {
        this.formConfig = formConfig;
        this.template = template;
        this.titleText = titleText;
        this.acceptText = acceptText;
        this.cancelText = cancelText;
        privateMap.set(this, {});
    }

    get value() {
        return this.formConfig.value;
    }

    openDialog() {
        const priv = _(this);
        priv.template = $.templates(this.template);
        const dlg = new Dialog({
            width: '60vw',
            maxWidth: 650,
            title: i18next.t(this.titleText),
            centerOnContent: true
        });
        priv.template.link(dlg.host, this, {
            byColumn: filterByColumn
        });
        dlg.host.localize();
        priv.dialog = dlg;
        dlg.setButtons([
            { text: i18next.t(this.acceptText), callback: this.submit.bind(this) },
            { text: i18next.t(this.cancelText), callback: this.cancel.bind(this) }
        ]);
        
        return new Promise((resolve, reject) => {
            priv.resolve = resolve;
            priv.reject = reject;
            dlg.showModal();
        });
    }

    displayTo(element) {
        const priv = _(this);
        priv.template = $.templates(this.template);
        priv.template.link($(element), this);
        $(element).localize();
    }

    submit() {
        if (this.formConfig.valid) {
            _(this).dialog.close(true);
            _(this).resolve(this.formConfig.value);
            return;
        }
        $.observable(this).setProperty('submitted', true);
    }

    cancel() {
        //ask for confirmation
        if (this.formConfig.dirty) {
            //ToDo: ask for confirmation
        }
        _(this).dialog.close(true);
        _(this).reject('cancelled');
    }
}

export class AbstractControl {
    constructor(template, settings) {
        privateMap.set(this, {
            status: INVALID,
            validators: getSafe(settings, 'validators', null),
            template: template,
            settings: settings
        });

        $.observe(this, 'value', () => this.updateValidity());
    }

    get parent() {
        return _(this).parent;
    }

    get valid() {
        return _(this).status === VALID;
    }

    get invalid() {
        return _(this).status === INVALID;
    }

    get disabled() {
        return _(this).status === DISABLED;
    }

    get enabled() {
        return _(this).status !== DISABLED;
    }

    get template() {
        return _(this).template;
    }

    get label() {
        return getSafe(_(this).settings, 'label', '');
    }

    get settings() {
        return _(this).settings || {};
    }

    is(status) {
        return _(this).status === status;
    }

    setValue(value) {
        $.observable(this).setProperty('value', value);
    }

    setParent(parent) {
        _(this).parent = parent;
    }

    setValidator(validator) {
        _(this).validator = validator
    }

    runValidator() {
        let validators = _(this).validators;
        if (validators == null) {
            //_(this).status = VALID;
            return;
        }
        if (!Array.isArray(validators)) {
            return validators(this);
        }

        let errors = [];
        validators.forEach(fn => {
            let result = fn(this);
            if (result) {
                errors.push(result);
                //_(this).status = INVALID;
            }
        });

        if (!errors.length) {
            //this.status = VALID;
            return null;
        }
        //_(this).status = INVALID;
        return errors;
    }

    _calculateStatus() {
        if (this._allControlsDisabled()) return DISABLED;
        if (this.errors) return INVALID;
        //if (this._anyControlsHaveStatus(PENDING)) return PENDING;
        if (this._anyControlsHaveStatus(INVALID)) return INVALID;
        return VALID;
    }

    _allControlsDisabled() {
        return false;
    }

    _anyControlsHaveStatus(status) {
        return false;
    }

    updateValidity() {
        $.observable(this).setProperty('errors', this.runValidator());
        _(this).status = this._calculateStatus();
        if (this.parent) {
            this.parent.updateValue();
        }
    }
}

export class FormControl extends AbstractControl {
    constructor(template, settings) {
        super(template, settings);
        this.value = getSafe(settings, 'value', null);
        $.observe(this, 'value', () => {
            this.updateValidity()
        });
    }

    _allControlsDisabled() {
        return this.disabled;
    }

    _anyControlsHaveStatus(status) {
        return false;
    }
}

export class FormGroup extends AbstractControl {
    constructor(controls, settings) {
        super(getSafe(settings, 'template', FormBuilder.templates.group.default), settings);
        _(this).controls = controls;
        Object.keys(controls).forEach(key => {
            controls[key].setParent(this);
            //$.observe(controls[key], 'value', () => this.updateValue())
        });
        this.updateValue();
    }

    get controls() {
        return _(this).controls;
    }

    registerControl(name, control) {
        let priv = _(this);
        if (priv.controls[name]) return priv.controls[name];
        priv.controls[name] = control;
        control.setParent(this);
        //$.observe(control, 'value', () => this.updateValue())
    }

    addControl(name, control) {
        this.registerControl(name, control);
        $.observable(this.value).setProperty(name, control.value);
        this.updateValidity()
    }

    removeControl(name) {
        let priv = _(this);
        if (!priv.controls[name]) return;
        delete (priv.controls[name]);
        $.observable(this.value).removeProperty(name);
        this.updateValidity()
    }

    setControl(name, control) {
        let priv = _(this);
        delete (priv.controls[name]);        
        if (control) this.addControl(name, control);
    }

    setValue(value) {
        let priv = _(this);
        Object.keys(value).forEach(name => {
            if (priv.controls[name]) {
                priv.controls[name].setValue(value[name]);
            }
        });
        this.updateValue();
    }

    updateValue() {
        let priv = _(this);
        let val = {};
        Object.keys(priv.controls).forEach(name => {
            val[name] = Array.isArray(priv.controls[name].value) ? priv.controls[name].value.slice(0) : priv.controls[name].value;
        });
        $.observable(this).setProperty('value', val);
        this.updateValidity();
    }

    _allControlsDisabled() {
        let priv = _(this);
        for(const ctrlName of Object.keys(priv.controls)) {
            if (priv.controls[ctrlName].enabled) return false;
        }
        return Object.keys(priv.controls).length > 0 || this.disabled;
    }

    _anyControlsHaveStatus(status) {
        let priv = _(this);
        for(const ctrlName of Object.keys(priv.controls)) {
            if (priv.controls[ctrlName].is(status)) return true;
        }
        return false;
    }
}

export class FormArray extends AbstractControl {
    constructor(controls, settings) {
        super(getSafe(settings, 'template', FormBuilder.templates.array.default), settings);
        _(this).controls = controls;
        controls.forEach(ctrl => {
            this.registerControl(ctrl);
        });
        this.updateValue();
    }

    get controls() {
        return _(this).controls;
    }

    at(index) {
        return _(this).controls[index];
    }

    registerControl(control) {
        control.setParent(this);
        //$.observe(control, 'value', () => this.updateValue());
    }

    push(control) {
        $.observable(_(this).controls).insert(control);
        this.registerControl(control);
        this.updateValue();
    }

    insert(index, control) {
        $.observable(_(this).controls).insert(index, control);
        this.registerControl(control);
        this.updateValue();
    }

    removeAt(index) {
        $.observable(_(this).controls).remove(index);
        this.updateValue();
    }

    setControl(index, control) {
        $.observable(_(this).controls).remove(index);
        if (control) {
            this.insert(index, control);
        }
    }

    get length() {
        return _(this).controls ? _(this).controls.length : 0;
    }

    setValue(value) {
        let priv = _(this);
        value.forEach((val, index) => {
            if (this.at[index]) {
                this.at[index].setValue(value);
            }
        });
        this.updateValue();
    }

    updateValue() {
        let priv = _(this);
        let val = [];
        priv.controls.forEach((control, index) => {
            val[index] = Array.isArray(control.value) ? control.value.slice(0) : control.value;
        });
        $.observable(this).setProperty('value', val);
        this.updateValidity();
    }

    _allControlsDisabled() {
        let priv = _(this);
        for(const ctrl of priv.controls) {
            if (ctrl.enabled) return false;
        }
        return priv.controls.length > 0 || this.disabled;
    }

    _anyControlsHaveStatus(status) {
        let priv = _(this);
        for(const ctrl of priv.controls) {
            if (ctrl.is(status)) return true;
        }
        return false;
    }
}

export class FormBuilder {
    static get templates() {
        return {
            text: {
                default: '#gui-default-form-text'
            },
            radio: {
                default: '#gui-default-form-radio'
            },
            boolean: {
                default: '#gui-default-form-boolean'
            },
            yesno: {
                default: '#gui-default-form-yesornot'
            },
            optionList: {
                default: '#gui-default-form-optionlist'
            },
            shareList: {
                default: '#gui-default-form-sharelist'
            },
            imagePreview: {
                default: '#gui-default-form-imagepreview'
            },
            group: {
                default: '#gui-default-form-group',
                twoColumns: '#gui-default-form-group-two-columns'
            },
            array: {
                default: '#gui-default-form-array'
            }
        };
    }

    static control(defTemplate, value, settings) {
        const ctrl = new FormControl(getSafe(settings, 'template', defTemplate), settings);
        ctrl.setValue(value);
        return ctrl;
    }

    static text(value, settings) {
        return FormBuilder.control(FormBuilder.templates.text.default, value, settings);
    }

    static radio(value, settings) {
        return FormBuilder.control(FormBuilder.templates.radio.default, value, settings);
    }
    
    static boolean(value, settings) {
        return FormBuilder.control(FormBuilder.templates.boolean.default, value, settings);
    }
    
    static yesno(value, settings) {
        return FormBuilder.control(FormBuilder.templates.yesno.default, value, settings);
    }
    
    static optionList(value, settings) {
        return FormBuilder.control(FormBuilder.templates.optionList.default, value, settings);
    }
    
    static shareList(value, settings) {
        return FormBuilder.control(FormBuilder.templates.shareList.default, value, settings);
    }
    
    static imagePreview(value, settings) {
        return FormBuilder.control(FormBuilder.templates.imagePreview.default, value, settings);
    }
    
    static group(controlsConfig, settings){
        const controls = {};
        Object.keys(controlsConfig).forEach(name => {
            controls[name] = FormBuilder._createControl(controlsConfig[name]);
        });
        return new FormGroup(controls, settings);
    }

    static array(controlsConfig, settings) {
        const controls = controlsConfig.map(c => FormBuilder._createControl(c));
        return new FormArray(controls, settings);
    }

    static _createControl(config) {
        if (config instanceof FormControl || config instanceof FormGroup || config instanceof FormArray) {
            return config;
        }

        if (Array.isArray(config)) {
            const type = config[0];
            const value = config.length > 1 ? config[1] : null;
            const settings = config.length > 2 ? config[2] : null;
            return FormBuilder[type](value, settings);
        }
        else {
            return FormBuilder[config.type](config.value, config.settings);
        }
    }
}