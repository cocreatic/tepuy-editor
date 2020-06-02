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
            this.traverseContent();
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
        const html = b64DecodeUnicode(this.manifest.content);
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const $body = $(doc).find('body');
        const bodyData = $body.data();
        const pages = [];
        const $main = $body.find('main');
        $main.children('section').each((i, page) => {
            pages.push(new Page(page));
        });
        this.content = {
            config: {...bodyData},
            pages
        };
    }
}