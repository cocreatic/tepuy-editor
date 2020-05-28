import { privateMap, _, checkAbstractImplementation } from './utils';

export const ComponentType = {
    CONTAINER: 'container',
    CONTENT: 'content',
    ACTIVITY: 'activity'
};


export class Component {

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
            host = document.cloneNode(false); //Clone only node attributes
        }

        privateMap.set(this, {
            host: element,
            properties: []
        });

        this.initialize();
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
        const classes = this.host.classList.split(' ');
        return list.filter(c => classes.indexOf(c) >= 0);
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
        for(;--i;) {
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
    }

    get container() {
        return true;
    }

    get type() {
        return ComponentType.CONTAINER;
    }

    get children() {

    }

    insert(component, index = 0) {
    }

    append(component) {
    }
}