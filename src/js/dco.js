import { Tepuy } from './tepuy';
import { Page } from './component';
import { b64DecodeUnicode, capitalize } from './utils';

const defaultConfig = {
    shareAsTemplate: false,
    interactionMode: 'web', //'web' || 'scorm'
    skipHome: false,
    displayMode: 'inline', //
    width: 'auto', //or number
    height: 'auto' //or number
}
export class Dco {
    constructor(manifest, storage) {
        this.storage = storage;
        this.tree = {
            pages: [],
            extras: []
        };

        this.manifest = Object.assign({}, defaultConfig, manifest);

        //this.home = new Page({id: 'home', title: 'Inicio' });
        /*this.addExtra({id: 'extra1', title: 'Extra 1'});
        this.addExtra({id: 'extra2', title: 'Extra 2'});
        this.addExtra({id: 'extra3', title: 'Extra 3'});
        this.addExtra({id: 'extra4', title: 'Extra 4'});*/
    }

    static createNew(template, properties, storage) {
        let dco = new Dco(template, storage);
        delete dco.manifest.id;
        return dco.update(properties);
    }

    static delete(manifest, storage) {
        return storage.delete(manifest);
    }

    get id() {
        return this.manifest.id;
    }

    get pages() {
        return this.parser.content.pages;
    }

    update(properties) {
        this.manifest = Object.assign(this.manifest, properties);
        return this.save();
    }

    save() {
        return this.storage.save(this.manifest);
    }

    delete() {
        return this.storage.delete(this.manifest);
    }

    getHtml(container, editMode=true) {
        const suffix = capitalize(container);
        return this.parser['get'+suffix]({editMode, baseUrl: this.manifest.baseUrl});
    }

    getDocument(container) {
        return this.parser[container+'Doc'];
    }

    updateHtml(container) {
        const suffix = capitalize(container);
        return this.storage['update'+suffix](this.manifest, this.parser['get'+suffix]({editMode: false}));
    }

    objectTree() {
        return Promise.all([this.storage.getIndex(this.manifest), this.storage.getContent(this.manifest)]).then(output => {
            const [index, content] = [...output];
            this.parser = new Tepuy({index, content});

            return this.parser.parse().then(result => {
                return { pages: this.parser.content.pages, floating: this.parser.content.floating };
            });
        });
    }

    extras() {
        return this.tree.extras;
    }

    getHome() {
        return this.parser.home;
    }

    getNextPageId() {
        return this.parser.nextPageId();
    }

    getNextSectionId() {
        return this.parser.nextSectionId();
    }

    addPage(page, index) {
        const oPage = new Page('section', { id: page.id, title: page.title });
        if (index == undefined) {
            this.pages.push(oPage);
        }
        else {
            this.pages.splice(index, 0, oPage);
        }
        return oPage;
    }

    getComponent(id, container) {
        return this.parser.getComponent(id, container);
    }

    getPage(id) {
        return this.pages.find(p => p.id == id);
    }

    movePage(id, toIndex) {
        let index = this.pages.findIndex(p => p.id == id);
        if (toIndex > index) {
            toIndex--;
        }
        let oPage = this.pages.splice(index, 1)[0];
        this.pages.splice(toIndex, 0, oPage);
    }

    deletePage(id) {
        let index = this.pages.findIndex(p => p.id == id);
        if (index >= 0) {
            this.pages.splice(index, 1);
        }
        return Promise.resolve(true);
    }

    addExtra(item) {
        this.tree.extras.push(item);
    }

    getResources(path) {
        return this.storage.getResources(this.manifest, path);
    }

    addResource(resource, path) {
        return this.storage.addResource(this.manifest, resource, path);
    }

    renameResource(resource, newName) {
        return this.storage.renameResource(this.manifest, resource, newName);
    }

    deleteResource(path) {
        return this.storage.deleteResource(this.manifest, path);
    }

    deleteFolder(path) {
        return this.storage.deleteFolder(this.manifest, path);
    }
}