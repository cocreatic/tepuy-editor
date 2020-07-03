import { t as _t } from 'i18next';
import { privateMap, _, checkAbstractImplementation, camelCaseToDash, newid } from './utils';

export const ComponentType = {
    CONTAINER: 'container',
    CONTENT: 'content',
    ACTIVITY: 'activity',
    TEXTBLOCK: 'textblock'
};


export class Component {
    static get id() {
        if (!this.hasOwnProperty('_id')) {
            this._id = camelCaseToDash(this.name);
        }
        return this._id;
    }

    static get selector() {
        if (!this.hasOwnProperty('_selector')) {
            const attrSelector = ['[data-cmpt-type="', this.id, '"]'].join('');
            this._selector = [attrSelector, this.legacySelector].filter(s => !!s).join(',');
        }
        return this._selector;
    }

    static get registry() {
        return Component._registry;
    }

    static registerComponent(component, ns) {
        if (!Component._registry) {
            Component._registry = {};
        }
        //const existing = Component._registry.find(c => c.id == component.id);
        if (Component._registry[component.id]) return; //should this generate an error?
        Component._registry[component.id] = { ctor: component, ns };
    }

    static resolveComponents(element) {
        const children = [];
        if (!(element instanceof HTMLElement)) return children;

        const length = element.children.length;
        for(let i = 0; i < length; i++) {
            children.push(this.resolveComponent(element.children[i]));
        }
        return children;
    }

    static resolveComponent(el) {
        const keys = Object.keys(Component._registry);
        let i = keys.length;
        let result;
        for(;i--;) {
            const component = Component._registry[keys[i]];
            if (component.ctor.matches(el)) {
                return new component.ctor(el);
            }
        }
        return null;
    }

    static matches(element) {
        return element.matches(this.selector);
    }

    constructor(element, options = {}) {
        options = options || {};
        let host;
        if (this.constructor === Component) {
            throw new TypeError('Cannot construct Component class');
        }

        checkAbstractImplementation(this, Component, 'initialize'); //Will throw an exception if not implemented

        if (typeof(element) === 'undefined') {
            element = options.tagName || 'div';
        }

        if (typeof(element) === 'string') {
            host = document.createElement(element);
            host.id = options.id || '';
        }
        else {
            host = element.cloneNode(false); //Clone only node attributes
        }

        if (!host.id) {
            let id = newid();
            while(!/^[a-z]/i.test(id)) id = newid();
            host.id = id;
        }

        host.setAttribute('data-cmpt-type', this.cmptType);

        privateMap.set(this, {
            host: host,
            properties: []
        });

        this.initialize();

        //Assign properties from options if available.
        const optionkeys = Object.keys(options);
        const length = optionkeys.length;
        for(let i = 0; i < length; i++) {
            const prop = this.getProperty(optionkeys[i]);
            if (!prop) continue;
            this.setPropertyValue(optionkeys[i], options[optionkeys[i]]);
        }
    }

    get cmptType() {
        //this.contructor will refer to the Declaring type, so it can be used to call static methods and properties
        return this.constructor.id;
    }

    get host() {
        return _(this).host;
    }

    get id() {
        return _(this).host.id;
    }

    set id(value) {
        const oldid = _(this).host.id;
        _(this).host.id = value;
        if (this.$host) {
            this.$host.get(0).id = value;
            this.$host.find('.tepuy-edit-toolbar.'+oldid).each((i, it) => {
                $(it).removeClass(oldid).addClass(value);
            })
        }
    }

    get tagName() {
        return _(this).host.tagName;
    }

    get type() {
        return ComponentType.CONTENT;
    }

    get properties() {
        return _(this).properties;
    }

    html(editMode) {
        return this.render(editMode);
    }

    initialize() {} //Abstract

    getAttribute(name, defaultValue = '') {
        return this.host.getAttribute(name) || defaultValue;
    }

    setAttribute(name, value) {
        this.host.setAttribute(name, value);
        if (this.$host) { //Set the attribute in the actual host also
            this.$host.attr(name, value); 
        }
    }

    classesInUse(classList) {
        let list = classList;
        if (typeof list === 'string') list = list.split(' ');
        //const classes = this.host.classList.split(' ');
        return list.filter(c => this.host.classList.contains(c));
    }

    getProperty(propName) {
        return this.properties.find(p => p.name == propName);
    }

    getPropertyValue(propName) {
        const property = this.getProperty(propName);
        if (!property) return null;
        return property.value;
    }

    setPropertyValue(prop, value) {
        let properties = {};
        if (typeof(prop) === 'string') {
            properties[prop] = value;
        }
        else {
            properties = prop;
        }
        const keys = Object.keys(properties);
        let i = keys.length;
        for(;i--;) {
            const propName = keys[i];
            value = properties[propName];
            const property = this.properties.find(p => p.name == propName);
            if (!property) continue;

            if (property.attr) { //Property is stored as an attribute.
                this.setAttribute(property.attr, value);
            }
            else if (property.prop) {
                this.host[property.prop] = value;
                if (this.$host) { //Update the actual host also
                    if (property.prop == 'innerHTML') {
                        this.$host.children(':not(.tepuy-edit-toolbar)').remove();
                        this.$host.prepend(value);
                    }
                    else
                        this.$host.get(0)[property.prop] = value;
                }
            }
            else { //Property is stored as a class
                this.host.classList.remove(...property.options);
                this.host.classList.add(value);
                if (this.$host) { //Apply the property on the host also
                    this.$host.removeClass(property.options).addClass(value);
                }
            }
            property.value = value;
        }
    }

    remove() {
        return this.parent && this.parent.removeChild(this);
    }

    render(editMode) {
        if (editMode) {
            this.addEditToolbar();
        }
        else {
            this.removeEditToolbar();
        }
        return this.host.outerHTML;
    }

    addEditToolbar() {
        this.host.classList.add('tepuy-edit'); //, 'mouse-over');
        //this.setAttribute('data-ref', '.tepuy-edit-toolbar.'+this.id);
        var toolbar = document.createElement('div');
        toolbar.classList.add('tepuy-edit-toolbar', 'toolbar-top', this.id);
        toolbar.style.display = 'none'; //Make it non visible
        const actions = [
            {action:'add-before', icon:'ion-plus-circled'},
            {action:'edit', icon:'ion-edit'},
            {action:'move-up', icon:'ion-chevron-up', enabled: this.index > 0},
            {action:'move-down', icon:'ion-chevron-down', enabled: this.index < this.parent.children.length },
            {action:'remove', icon:'ion-trash-a'}
        ];
        for(let i = 0; i < actions.length; i++) {
            const item = document.createElement('i');
            item.setAttribute('data-tepuy-action', actions[i].action);
            item.classList.add(actions[i].icon, 'tepuy-action');
            //const enabled = actions[i].enabled;
            //if (typeof enabled === 'boolean' && !enabled) item.classList.add('disabled');
            toolbar.appendChild(item);
        }
        this.host.appendChild(toolbar);
        toolbar = toolbar.cloneNode(true);
        toolbar.querySelector('[data-tepuy-action="add-before"]').setAttribute('data-tepuy-action', 'add-after');
        toolbar.classList.remove('toolbar-top');
        toolbar.classList.add('toolbar-bottom');
        this.host.appendChild(toolbar);
    }

    removeEditToolbar() {
        //this.host.classList.remove('mouse-over');
        //this.setAttribute('data-ref', null);
        $(this.host).children('.tepuy-edit-toolbar').remove();
    }
}

export class ContainerComponent extends Component {

    constructor(element, options) {
        super(element, options);
        this.resolveChildren(element);
    }

    get type() {
        return ComponentType.CONTAINER;
    }

    insert(component, index = 0) {
        index = index < 0 ? 0 : index > this.children.length ? this.children.length : index;
        this.children.splice(index, 0, component);
        component.parent = this;
    }

    appendChild(component, options) {
        options = options || {};
        const { refEl, position } = {...options};
        let index = options.index, method = 'append';
        if(position) {
            if (refEl) {
                const refId = refEl.get(0).id;
                const refIndex = this.children.findIndex(ch => ch.id == refId);
                if (refIndex < 0) {
                    throw 'Unable to find reference component ' + refId;
                }
                index = refIndex;
            }
            else {
                throw 'refEl is required to detemine the element position whithin the parent';
            }
            index = position == 'before' ? index : index + 1;
            method = position;
        }
        else {
            refEl && refEl.find('.tepuy-button.tepuy-action').remove();
        }
        this.children.splice(index||0, 0, component);
        component.parent = this;
        component.index = index||0;
        if (refEl) {
            refEl[method](component.html(true)); //Add the element to the current DOM
            if (component.constructor.tepuyPluginName) refEl.parent().find('#'+component.id)[component.constructor.tepuyPluginName](); //Run the component plugin name on the just added html
        }
    }

    removeChild(component) {
        let index = this.children.indexOf(component);
        if (index >= 0) {
            component.$host && component.$host.remove(); //Remove from the DOM
            return this.children.splice(index, 1);
        }        
    }

    moveUp(child) {
        if (child.parent != this) return;
        const index = this.children.indexOf(child);
        if (index == 0) return; //Do not move
        const prev = this.children[index-1];
        this.children.splice(index, 1); //Remove from the children collection
        this.children.splice(index-1, 0, child); //Append in the new position

        if (child.$host) { //Update the DOM
            const $prev = this.getActualHost(child.$host).find('#'+prev.id);
            $prev.before(child.$host);
        }
    }

    moveDown(child) {
        if (child.parent != this) return;
        const index = this.children.indexOf(child);
        const length = this.children.length;
        if (index == length-1) return; //Do not move
        const next = this.children[index+1];
        this.children.splice(index, 1); //Remove from the children collection
        this.children.splice(index+1, 0, child); //Append in the new position

        if (child.$host) { //Update the DOM
            const $next = this.getActualHost(child.$host).find('#'+next.id);
            $next.after(child.$host);
        }
    }

    getActualHost($chilHost) {
        return $chilHost.parent();
    }

    append(component) {
        this.children.push(component);
        component.parent = this;
    }

    resolveChildren(element) {
        this.children = Component.resolveComponents(element);
        this.children.map(ch => {
            ch.parent = this;
        }); //Set the parent property        
    }

    render(editMode) {
        const innerHTML = [];
        for(let child of this.children) {
            innerHTML.push(child.html(editMode));
        }
        this.host.innerHTML = innerHTML.join('');
        if (editMode) {
            this.host.classList.add('tepuy-edit');
            if (!this.children.length) {
                const text = _t('commands.addComponent');
                const $button = $('<button class="ui-widget tepuy-button tepuy-action" data-tepuy-action="add"></button>');
                $button.html(text+'<i class="ion-plus-circled"></i>');
                $(this.host).append($button);
            }
            this.addEditToolbar();
        }
        else {
            this.host.classList.remove('tepuy-edit');
            $(this.host).find('.tepuy-button.tepuy-action').remove();
            this.removeEditToolbar();
        }
        return this.host.outerHTML;
    }
}

export class Page extends ContainerComponent {
    constructor(element, options) {
        super(element, options);
    }

    initialize() {
        const title = {name: 'title', type: 'text', attr: 'ptitle'};
        title.value = this.getAttribute(title.attr);
        _(this).properties = [ title ];
    }

    insert(component, index = 0) {
        throw 'Use addSection method instead';
    }

    append(component) {
        throw 'Use addSection method instead';
    }

    resolveChildren(element) {
        this.sections = [];
        if (!element.children || !element.children.length) return;
        const sections = Array.prototype.filter.call(element.children, child => child.matches('.subpage,[data-cmpt-type="section"]'));
        this.sections = sections.map(section => new Section(section));
    }

    get title() {
        return this.getPropertyValue('title');
    }

    set title(value) {
        this.setPropertyValue('title', value);
    }

    getSectionAt(index) {
        return this.sections[index];
    }

    getSection(id) {
        return this.sections.find(s => s.id == id);
    }

    addSection(section, index = undefined) {
        if (!(section instanceof Section)) {
            section = new Section('div', { id: section.id, title: section.title });
        }
        section.parent = this;
        if (index == undefined || index < 0 || index >= this.sections.length) {
            this.sections.push(section);
        }
        else {
            this.sections.splice(index, 0, section);
        }
        return section;
    }

    removeSection(id) {
        let idx = this.sections.findIndex(s => s.id == id);
        return this.sections.splice(idx, 1)[0];
    }

    moveSection(id, toIndex) {
        let index = this.sections.findIndex(s => s.id == id);
        if (toIndex > index) {
            toIndex--;
        }
        let section = this.sections.splice(index, 1)[0];
        this.sections.splice(toIndex, 0, section);
    }

    render(editMode) {
        const innerHTML = [];
        for(let section of this.sections) {
            innerHTML.push(section.html(editMode));
        }

        this.host.innerHTML = innerHTML.join('');
        return this.host.outerHTML;
    }

    addEditToolbar() {} //Do Nothing. Sections just don't have an edit toolbar
}

export class Section extends ContainerComponent {
    constructor(element, options) {
        super(element, options);
    }

    initialize() {
        const title = {name: 'title', type: 'text', attr: 'data-title'};
        title.value = this.getAttribute(title.attr);
        this.host.classList.add('subpage');
        _(this).properties = [ title ];
    }

    insert(component, index = 0) {
        index = index < 0 ? 0 : index > this.children.length ? this.children.length : index;
        this.children.splice(index, 0, component);
    }

    append(component, target, $currentEl) {
        this.children.push(component);
        if ($currentEl) {
            const $addButton = $currentEl.find('.tepuy-button.tepuy-action').remove();
            //if (!this.children.length) $el.empty();
            const html = component.html(true);
            $currentEl.append(html);
        }
    }

    get title() {
        return this.getPropertyValue('title');
    }

    set title(value) {
        this.setPropertyValue('title', value);
    }

    render(editMode) {
        super.render(editMode);
        this.removeEditToolbar();
        return this.host.outerHTML;
    }

    addEditToolbar() {} //Do Nothing. Sections just don't have an edit toolbar
}