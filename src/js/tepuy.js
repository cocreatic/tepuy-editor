import { App } from './app';
import { newid, b64DecodeUnicode } from './utils';

export class Tepuy {

    constructor(manifest) {
        this.manifest = manifest;
    }

    parse() {
        
        return new Promise((resolve, reject) => {
            const html = b64DecodeUnicode(this.manifest.index); 
            console.log(html);
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            console.log(doc);
            console.log(doc.documentElement.childNodes);

            const $q = $(doc);
            console.log($q);
            this.traverseBody($q);
        });
    }


    traverseBody($html) {
        console.log('traverseBody');
        this.home = {};
        const $body = $html.find('body');
        console.log($body);
        console.log('body found');;
        const bodyData = $body.data();
        console.log(bodyData);
        this.home.config = bodyData;
        console.log('will traverse body');
        console.log($body.find('main'));
        this.home.components = this.traverseMain($body.find('main'));
    }

    traverseMain($main) {
        const $children = $main.children();
        const components = [];
        $children.each((i, child) => {
            components.push(this.resolveComponent($(child)));
        });
        console.log(components);
    }

    resolveComponent($el) {
        return this.createHtmlComponent($el);
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