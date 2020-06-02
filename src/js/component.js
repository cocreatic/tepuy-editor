import { privateMap, _, checkAbstractImplementation, camelCaseToDash } from './utils';

export const ComponentType = {
    CONTAINER: 'container',
    CONTENT: 'content',
    ACTIVITY: 'activity'
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

    static registerComponent(component) {
        if (!Component._registry) {
            Component._registry = [];
        }
        const existing = Component._registry.find(c => c.id == component.id);
        if (existing) return; //should this generate an error?
        Component._registry.push(component);
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
        let i = Component._registry.length;
        let result;
        for(;i--;) {
            const component = Component._registry[i];
            if (component.matches(el)) {
                return new component(el);
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

        if (typeof(element) === undefined) {
            element = options.tagName || 'div';
        }

        if (typeof(element) === 'string') {
            host = document.createElement(element);
        }
        else {
            host = element.cloneNode(false); //Clone only node attributes
        }

        host.setAttribute('data-cmpt-type', this.cmptType);

        privateMap.set(this, {
            host: host,
            properties: []
        });

        this.initialize();
    }

    get cmptType() {
        //this.contructor will refer to the Declaring type, so it can be used to call static methods and properties
        return this.constructor.id;
    }

    get container() {
        return false;
    }

    get host() {
        return _(this).host;
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

    initialize() {} //Abstract

    getAttribute(name, defaultValue = '') {
        return this.host.getAttribute(name) || defaultValue;
    }

    classesInUse(classList) {
        let list = classList;
        if (typeof list === 'string') list = list.split(' ');
        //const classes = this.host.classList.split(' ');
        return list.filter(c => this.host.classList.contains(c));
    }

    getPropertyValue(propName) {
        const property = this.properties.find(p => p.name == propName);
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
            if (!property) return false;

            if (property.attr) { //Property is stored as an attribute.
                this.setAttribute(property.attr, value);
            }
            else { //Property is stored as a class
                this.removeClass(property.value) //if the property is a class, it needs to define a list of options
                this.host.classList.remove(...property.options);
                this.host.classList.add(value);
            }
            property.value = value;
        }

    }
}

export class ContainerComponent extends Component {

    constructor(element, options) {
        super(element, options);
        //checkAbstractImplementation(this, ContainerComponent, 'insert'); //Will throw an exception if not implemented
        //checkAbstractImplementation(this, ContainerComponent, 'append'); //Will throw an exception if not implemented
        //checkAbstractImplementation(this, ContainerComponent, 'resolveChildren'); //Will throw an exception if not implemented
        this.resolveChildren(element);
    }

    get container() {
        return true;
    }

    get type() {
        return ComponentType.CONTAINER;
    }

    insert(component, index = 0) {
        index = index < 0 ? 0 : index > this.children.length ? this.children.length : index;
        this.children.splice(index, 0, component);
    }

    append(component) {
        this.children.push(component);
    }

    resolveChildren(element) {
        this.children = Component.resolveComponents(element);
    }
}

export class Page extends ContainerComponent {
    constructor(element, options) {
        super(element, options);
    }

    initialize() {
        const properties = [];
        _(this).properties = properties;
    }

    insert(component, index = 0) {
        if (!(component instanceof Section)) {
            throw new TypeError('Page only accepts Section children');
        }
        super.insert(component, index);
    }

    append(component) {
        if (!(component instanceof Section)) {
            throw new TypeError('Page only accepts Section children');
        }
        super.append(component);
    }

    resolveChildren(element) {
        const sections = Array.prototype.filter.call(element.children, child => child.matches('.subpage,[data-cmpt-type="section"]'));
        this.sections = sections.map(section => new Section(section));
    }
}

export class Section extends ContainerComponent {
    constructor(element, options) {
        super(element, options);
    }

    initialize() {
        const properties = [];
        _(this).properties = properties;
    }

    insert(component, index = 0) {
        index = index < 0 ? 0 : index > this.children.length ? this.children.length : index;
        this.children.splice(index, 0, component);
    }

    append(component) {
        this.children.push(component);
    }
}