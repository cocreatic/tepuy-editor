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

        this.home = new Page({id: 'home', title: 'Inicio' });
        this.addExtra({id: 'extra1', title: 'Extra 1'});
        this.addExtra({id: 'extra2', title: 'Extra 2'});
        this.addExtra({id: 'extra3', title: 'Extra 3'});
        this.addExtra({id: 'extra4', title: 'Extra 4'});
    }

    static createNew(template, properties, storage) {
        let dco = new Dco(template, storage);
        delete dco.manifest.id;
        return dco.update(properties);
    }

    get id() {
        return this.manifest.id;
    }

    update(properties) {
        this.manifest = Object.assign(this.manifest, properties);
        return this.save();
    }

    save() {
        return this.storage.save(this.manifest);
    }

    objectTree() {
        return this.tree;
    }

    extras() {
        return this.tree.extras;
    }

    getHome() {
        return this.home;
    }

    addPage(page, index) {
        let oPage = new Page(page);
        if (index == undefined) {
            this.tree.pages.push(oPage);
        }
        else {
            this.tree.pages.splice(index, 0, oPage);
        }
        return oPage;
    }

    getPage(id) {
        return this.tree.pages.find(p => p.id == id);
    }

    getPages() {
        return this.tree.pages;
    }

    movePage(id, toIndex) {
        let index = this.tree.pages.findIndex(p => p.id == id);
        if (toIndex > index) {
            toIndex--;
        }
        let oPage = this.tree.pages.splice(index, 1)[0];
        this.tree.pages.splice(toIndex, 0, oPage);
    }

    deletePage(id) {
        console.log(id);
        let index = this.tree.pages.findIndex(p => p.id == id);
        if (index >= 0) {
            this.tree.pages.splice(index, 1);
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

export class Page {
    constructor({id, title}) {
        this.id = id;
        this.title = title;
        this.sections = [];
    }

    getSection(id) {
        return this.sections.find(s => s.id == id);
    }

    addSection(section, index) {
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
}

