import { privateMap, _ } from './utils';
import { Component } from './component',

export class ComponentRegistry {
    constructor() {
        privateMap.set(this, {
            registry: {}
        });
    }

    add(component) {
        if (!(component instanceof Component)) {
            throw new TypeError('component is not a Component');
        }
        const registry = _(this).registry;

        if (registry[component.id]) return;
        registry[component.id] = component;
    }

}