import { App } from './app';
import { Page, Section } from './component';
import { newid, b64DecodeUnicode } from './utils';

export class Tepuy {

    constructor(manifest) {
        this.manifest = manifest;
    }

    parse() {
        return new Promise((resolve, reject) => {
            this.traverseIndex();
            resolve(true);
        });
    }

    traverseIndex() {
        const html = b64DecodeUnicode(this.manifest.index);
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const $body = $(doc).find('body');
        const bodyData = $body.data();
        const root = new Section($body.find('main')[0]);
        this.home = {
            config: {...bodyData},
            root: root
        };
    }

    traverseContent() {

    }

    traverseBody($html) {
        console.log('traverseBody');
        //console.log($body);
        console.log('body found');;
        //console.log(bodyData);
        console.log('will traverse body');
        //console.log($body.find('main'));
    }

    traverseMain($main) {
        const $children = $main.children();
        const components = [];
        $children.each((i, child) => {
            components.push(this.resolveComponent(child));
        });
        console.log(components);
        return components;
    }

    prepareComponents() {
        const plugins = App.getPlugins('cmpt'); //Get components plugins.
        let components = [];
        for(let plug of plugins) {
            components = [...components, ...plug.getComponentsList()];
        }
        this.components = components;
    }

    resolveComponent(el) {
        let i = this.components.length;
        let result;
        for(;--i;) {
            const component = this.components[i];
            if (component.matches(el)) {
                result = new component[i](el);
                if (component.container) {
                    component.resolveChildren(this.components);
                }
            } return new component[i](el);
        }
    }

    resolveComponentChildren(component) {
        const children = [];
        for(let child of component.getChildElements()) {
            children.push(this.resolveComponent(child))
        }
    }

    createHtmlComponent($el) {
        let id = $el.attr('id');
        if (!id) {
            id = 'html_' + newid();
            $el.attr({id: id});
        }

        return { id: id, type: 'html', tag: $el.tagName };

    }



}