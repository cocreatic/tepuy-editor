import { App } from '../../js/app';
import { privateMap, _ } from '../../js/utils';
import { Component } from '../../js/component';
import { TemplateManager } from './templateManager';
import { XPath } from './xpath.js';

export class MetadataEditor {
    constructor() {
        const meta = App.data.dco.manifest.metadata||{};
        this.metadata = JSON.parse(JSON.stringify(meta));
        this._optionSetsCache = {}; 
        this.title = App.data.dco.manifest.name;
        const titleText = this.title + ' - ' + App.i18n.t('dco.metadataWindowTitle');
        const dlg = new App.ui.components.Dialog({
            title: titleText,
            width: '60vw'
        });
        const publishBtn = { text: App.i18n.t('commands.publish'), click: this.publish.bind(this) };
        const acceptBtn = { text: App.i18n.t('commands.update'), click: this.submit.bind(this), 'data-default': true };
        const cancelBtn = { text: App.i18n.t('commands.close'), click: this.cancel.bind(this) };
        dlg.setButtons([publishBtn, acceptBtn, cancelBtn]);
        const template = TemplateManager.get('metadataEditor')
        privateMap.set(this, {
            dlg,
            acceptBtn,
            cancelBtn,
            template,
        });
        this.onLaguageChange = this.onLaguageChange.bind(this);
    }

    setTitle(title) {
        const priv = _(this);
        if (priv.initialized) {
            priv.dlg.host.dialog('option', 'title', title);
        }
        else {
            priv.dlg.host.attr('title', title);
        }
    }

    setAcceptText(text) {
        const priv = _(this);
        priv.acceptBtn.text = text;
        if (priv.initialized) {
            priv.dlg.host.find('.ui-dialog-buttonset > button:first').html(text);
        }
    }

    show() {
        const priv = _(this);
        const dlg = priv.dlg;
        const me = this;
        this.setMode('loading');

        if (!priv.initialized) {
            dlg.create({
                open: this.onDialogOpen.bind(this)
            });
            dlg.host.addClass('tpy-metadata-editor')
            dlg.host.empty();
            priv.template.link(dlg.host, this)
            $.observe(this, 'mode', () => {
                dlg.host && dlg.host.localize();
                if (this.mode == 'edit') {
                    let cats = dlg.host.find("#categories");
                    cats.tabs({
                        activate: (event, ui) => {
                            //this.activateTab(ui.newTab, ui.oldTab);
                        }
                    });
                }
            });
            priv.initialized = true;
        }

        dlg.showModal();
    }

    onDialogOpen() {
        const dlg = _(this).dlg;
        dlg.toggleFullMode(true);
        this.initializeControls().then(() => {
            //const cats = dlg.host.localize();
            setTimeout(() => {
                this.setMode('edit');
            }, 0);
        });
    }

    setMode(mode) {
        $.observable(this).setProperty('mode', mode);
    }

    initializeControls() {
        return App.storage.getSpec(App.data.dco.manifest.type).then(spec => {
            this.enterEditMode(spec);
        });
    }

    enterEditMode(specStr) {
        const builder = App.ui.components.FormBuilder;

        const parser = new DOMParser();
        const spec = parser.parseFromString(specStr,"text/xml");
        const xpath = new XPath(spec);
        this.xpath = xpath;
        const categories = xpath.selectNodes('//fields/*[@type="category"]');

        const languages = this.getOptions("languages", false);
        if (!this.currentLang) this.currentLang = "none";
        this.language = builder.optionList(this.currentLang, { options: languages});
        $.observe(this.language, 'value', this.onLaguageChange);

        const controls = {};
        categories.forEach(cat => {
            if (/(annotation|clasification)/.test(cat.nodeName)) return; //ToDo: Remove this and enable these categories editing
            const meta = this.metadata[cat.nodeName] || {};
            controls[cat.nodeName] = this.prepareCategoryMetaEntry(builder, cat, this.metadata);
        });

        this.form = new App.ui.components.FormGroup(controls);
    }

    onLaguageChange(ev, data) {
        if (this.currentLang == data.value) return;
        if (!this.updateMetadata()) {
            this.language.setValue(data.oldValue);
            return;
        }

        this.currentLang = data.value;
        const metaCtrlKeys = Object.keys(this.form.controls);
        for(let i = 0; i < metaCtrlKeys.length; i++) {
            const metaCtrlKey = metaCtrlKeys[i];
            const categoryCtrl = this.form.controls[metaCtrlKey]; 
            const categoryCtrlKeys = Object.keys(categoryCtrl.controls);
            const metaSection = this.metadata[metaCtrlKey]||(this.metadata[metaCtrlKey] = {});
            for(let k = 0; k < categoryCtrlKeys.length; k++) {
                const fieldCtrlKey = categoryCtrlKeys[k];
                const fieldCtrl = categoryCtrl.controls[fieldCtrlKey];

                if (fieldCtrl.settings.translatable) {
                    const metaValue = metaSection[fieldCtrlKey]||(metaSection[fieldCtrlKey]={});
                    let value = metaValue[data.value];
                    if (fieldCtrl.settings.metaType == 'keywords') {
                        value = Array.isArray(value) ? value.join(', ') : value
                    }
                    fieldCtrl.setValue(value);
                }
            }
        }
    }

    prepareCategoryMetaEntry(builder, cat, metadata) {
        var fields = {};
        for(let i = 0; i < cat.children.length; i++) {
            const field = cat.children[i];
            const meta = metadata[cat.nodeName]||{};
            const values = {};
            const ctrl = this.prepareMetaFieldEntry(field, cat.nodeName, 'meta.fields.'+cat.nodeName+'.', meta, values);
            if (ctrl) fields[field.nodeName] = ctrl;
        }
        const label = ['gui.editor:meta.fields', cat.nodeName, 'label'].join('.');
        return builder.group(fields, { label });
    }

    prepareMetaFieldEntry(field, nameprefix, dicprefix, metadata, values) {
        const builder = App.ui.components.FormBuilder;
        const validators = App.validation.validators;

        const type = field.getAttribute('type');
        const enabled = field.getAttribute('enabled');
        if (enabled !== 'true') return;
        const isContainer = type == 'container';
        const fname = field.nodeName;
        const value = metadata[fname];
        const name = isContainer?dicprefix.replace(/\.$/, ''):dicprefix+fname;
        const label = ['gui.editor:meta.fields', nameprefix, field.nodeName, 'label'].join('.');
        var options = null;
        if (type=='composed' || isContainer){
            const isCollection = field.getAttribute("collection") === 'true';
            const isRequired = field.getAttribute("required") === 'true';
            const isFixed = field.getAttribute("fixed") === 'true';

            const nameSuffix = isContainer ? '' : fname+'.'; 
            let data = isContainer ? metadata : metadata[fname];
            if (isCollection && !Array.isArray(data)){
                const defvalue = field.getAttribute('defaultValue');
                data = JSON.parse(defvalue)||[];
            }
            const groupBuilder = function(meta, groupsettings) {
                const subfields = {};
                for(let i = 0; i < field.children.length; i++) {
                    const cfield = field.children[i];
                    const ctrl = this.prepareMetaFieldEntry(cfield, nameprefix+'.'+fname, dicprefix+nameSuffix, meta, values);
                    if (ctrl) subfields[cfield.nodeName] = ctrl;
                }
                return builder.group(subfields, groupsettings);
            }.bind(this);

            const settings = {
                label,
                validators: []
            };

            if (isCollection) {
                settings.required = isRequired;
                if (isRequired) settings.validators.push(validators.required);
                settings.readonly = isFixed;
                settings.defValue = field.getAttribute('defaultValue');
                const controls = [];
                for(let i = 0; i < data.length; i++) {
                    controls.push(groupBuilder(data[i], {}));
                }
                settings.template = '#gui-default-formgroup-collection-entry';
                settings.groupBuilder = groupBuilder;
                return builder.array(controls, settings);
            }
            return groupBuilder(metadata, settings);
        }
        else {
            options = {
                text: label,
                description: field.firstChild!=null?field.firstChild.wholeText.trim():"",
                name: fname,
                prefix: nameprefix,
                type: "string"
            };
            return this.createControl({ ...options, type, value, meta: field});
        }
    }

    /**
     * Create a Form control with specific options
     * @param options object|null, key value pair properties to create the form control
     */
    createControl(options){
        const builder = App.ui.components.FormBuilder;
        const validators = App.validation.validators;
        const settings = {};
        const mandatory = options.hasOwnProperty('mandatory') ? options.mandatory : options.meta.getAttribute('required');
        const lang = this.currentLang;
        let type;
        let value = options.value;
        settings.validators = [];
        if (mandatory) {
            settings.validators.push(validators.required);
        }
        settings.readonly = options.hasOwnProperty('readonly') ? options.readonly : options.meta.getAttribute('editable') === "false";
        settings.defaultValue = "";
        settings.label = options.text;
        settings.translatable = options.hasOwnProperty('translatable') ? options.translatable : options.meta.getAttribute('translatable') === 'true';
        settings.required = mandatory;
        settings.metaType = options.type;
        const defaultValue = options.meta.getAttribute('defaultValue');
        //settings.isMassive = this.massive;
        if (value == undefined) value = defaultValue;
        
        if (value == undefined && options.name == 'title' && options.prefix == 'general') {
            value = settings.translatable ? {[lang]: this.title } : this.title;
        }

        if (settings.translatable && value) {
            value = value[lang];
        }

        if (settings.translatable){
            settings.languages = this.getOptionSet('languages');
        }

        switch(options.type){
            case 'checkbox':
                type = 'boolean'; // 'checkbox';
                break;
            case 'keywords':
                type = 'text'; // 'keywords';
                if (Array.isArray(value)) {
                    value = value.join(", ");
                }
                break;
            case 'email':
                type = 'text';
                settings.validators.push(validators.email);
                break;
            case 'text':
            case 'string':
            case null:
                type = 'text';
                break;
            case 'longtext':
                type =  'text'; //'textarea';
                break;
            case 'label':
                type = 'string';
                break;
            case 'date':
            case 'datetime':
                type = 'duration'; //options.type;
                break;
            case 'duration':
                type = 'longduration';
                break;
            case 'int':
                type = 'number';
                //settings.validators.push(validators.integer);
                break;
            case 'optionset':
                type = 'optionList';
                settings.multiple = options.meta.getAttribute('multiple') === "true";
                const choices = [];
                const optionsetname = options.meta.getAttribute('optionset-name');
                settings.optionsetname = optionsetname;
                //Set the option set name based on the value of another field in the collection
                if (/\{(.*?)\}/.test(optionsetname)) {
                    const dependencies = {};
                    const matches = optionsetname.match(/\{(.*?)\}/g);
                    for(let i = 0; i < matches.length; i++){
                        const ph = matches[i]; //options.name.split('.').slice(0,-1).join('.')+'.'+matches[i].slice(1, -1);
                        dependencies[ph] = { ph: matches[i], value: null };
                        if (options.meta && options.meta[ph]){                            
                            dependencies[ph].value = options.meta[ph];
                        }
                    }
                    settings.dependencies = dependencies;
                    settings.options = dependencies => {
                        var optionsetname = settings.optionsetname;
                        Object.keys(dependencies).forEach(dep => {
                            optionsetname = optionsetname.replace(dep.value.ph, dep.value.value);
                        });
                        return this.getOptions(optionsetname, mandatory);
                    };
                    settings.options.depends = Object.keys(dependencies); //[];
                }
                else {
                    settings.options = this.getOptions(optionsetname, mandatory);
                }
                if (value == null) value = '';
                break;
            default:
                const typeNode = this.xpath.select('//types/type[@name="'+options.type+'"]')
                type = options.type;
                if (typeNode != null){
                    const childs = {};
                    for(let k = 0; k < typeNode.children.length; k++) {
                        const it = typeNode.children[k];                        
                        const childOptions = {
                            text: ['gui.editor:meta.types', options.type, it.nodeName, 'label'].join('.'),
                            name: it.nodeName,
                            type: it.getAttribute("type"),
                            meta: it,
                            value: value != undefined ? value[it.nodeName] : undefined
                        };

                        const ctrl = this.createControl(childOptions);
                        if (ctrl) childs[it.nodeName] = ctrl;
                    }
                    settings.type = 'composed';
                    settings.typeName = options.type;
                    //settings.childs = childSettings;
                    return builder.group(childs, settings);
                }
                else 
                    return null;
        }
        return [type, value, settings];
        //return settings;
    }

    getOptions(optionsetname, appendEmpty=true) {
        return this.getOptionSet(optionsetname, appendEmpty);
        //const choices = [];
        //Object.keys(optionset).forEach(choice => {
            //choices.push(choice+"|"+optionset[choice]);
        //});
        //return choices;
    }

    getOptionSet(optionsetname, appendEmpty) {
        if (this._optionSetsCache[optionsetname]){
            return this._optionSetsCache[optionsetname];
        }
        //var optionsetname=options.meta.getAttribute('optionset-name');
        const optionset = this.xpath.select('//optionsets/optionset[@name="'+optionsetname+'"]');
        const choices = appendEmpty ? [{ value: '', label: '' }] : [];
        let labelkey;

        if (optionset){
            optionset.getAttribute('values').split('||').forEach(set => {
                if (/::/.test(set)){
                    const parts = set.split('::');
                    labelkey = ['gui.editor:optionset', optionsetname, parts[0].replace('.', '_')].join('.');
                    choices.push({value: "_grp_"+parts[0], label: App.i18n.t(labelkey)})
                    set = parts[1];
                }
                set.split('|').forEach(choice => {
                    labelkey = ['gui.editor:optionset', optionsetname, choice.replace('.', '_')].join('.');
                    choices.push({value: choice, label: App.i18n.t(labelkey)});
                });
            });
        }
        return (this._optionSetsCache[optionsetname] = choices);
    }

    updateMetadata() {
        $.observable(this.form).setProperty('submitted', true);
        if (!this.form.valid) {
            App.ui.components.Dialog.message(App.i18n.t('dco.errors.missingInformation'), App.i18n.t('tepuy'));
            return false; //Form is not valid. //ToDo: Show errors
        }
        const metaCtrlKeys = Object.keys(this.form.controls);
        for(let i = 0; i < metaCtrlKeys.length; i++) {
            const metaCtrlKey = metaCtrlKeys[i];
            const categoryCtrl = this.form.controls[metaCtrlKey]; 
            const categoryCtrlKeys = Object.keys(categoryCtrl.controls);
            const metaSection = this.metadata[metaCtrlKey]||(this.metadata[metaCtrlKey] = {});
            for(let k = 0; k < categoryCtrlKeys.length; k++) {
                const fieldCtrlKey = categoryCtrlKeys[k];
                const fieldCtrl = categoryCtrl.controls[fieldCtrlKey];
                let value = fieldCtrl.value;
                if (fieldCtrl.settings.metaType == 'keywords') {
                    value = value.split(/,\s*/);
                }
                if (value == undefined) {
                    delete metaSection[fieldCtrlKey];
                    continue;
                }

                if (fieldCtrl.settings.translatable) {
                    const metaValue = metaSection[fieldCtrlKey]||(metaSection[fieldCtrlKey]={});
                    metaValue[this.currentLang] = value;
                }
                else {
                    metaSection[fieldCtrlKey] = value;
                }
            }
        }
        return true;
    }

    submit() {
        if (!this.updateMetadata()) return;
        App.data.dco.update({metadata: this.metadata}).catch((reason) => {
            //ToDo: Handle this error properly
            console.log('Update failed');
            console.log(reason);
        });
        return;
    }

    publish() {
        this.cancel();
        if (!this.updateMetadata()) return;
        let text = 'dco.publishConfirmation';
        const question = App.i18n.t(text, {  }, {interpolation: {escapeValue: false}});
        const title = App.i18n.t('dco.publishTitle');

        App.ui.components.Dialog.confirm(question, title).then(result => {
            if (!result) return;

            App.data.dco.publish({metadata: this.metadata}).then(response => {
                text = App.i18n.t('dco.publishNotification', {  }, {interpolation: {escapeValue: false}}) 
                App.ui.components.Dialog.message(text, title);
            });
        });
    }

    cancel() {
        _(this).dlg.close();
    }
}