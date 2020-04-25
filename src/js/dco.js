const defaultConfig = {
    shareAsTemplate: false,
    interactionMode: 'web', //'web' || 'scorm'
    skipHome: false,
    displayMode: '', //
    width: 'auto', //or number
    height: 'auto' //or number
}
export class Dco {
    constructor(dco) {
        this.dco = dco;
        this.tree = {
            pages: [],
            extras: []
        };


        this.config = Object.assign(defaultConfig);

        this.home = new Page({id: 'home', title: 'Inicio' });
        //let page = this.addPage({id: 'page1', title: 'Página 1'});
        //page.addSection({id: 'section11', title: 'Sección 1'});
        //page.addSection({id: 'section12', title: 'Sección 2'});
        //page = this.addPage({id: 'page2', title: 'Página 2'});
        //page.addSection({id: 'section21', title: 'Sección 1'});
        //page.addSection({id: 'section22', title: 'Sección 2'});
        //page = this.addPage({id: 'page3', title: 'Página 3'});
        //page.addSection({id: 'section31', title: 'Sección 1'});
        
        this.addExtra({id: 'extra1', title: 'Extra 1'});
        this.addExtra({id: 'extra2', title: 'Extra 2'});
        this.addExtra({id: 'extra3', title: 'Extra 3'});
        this.addExtra({id: 'extra4', title: 'Extra 4'});
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
            this.tree.pages.splice(index, 0, page);
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

    addExtra(item) {
        this.tree.extras.push(item);
    }

    updateConfig(config) {
        this.config= Object.assign(this.config, config);
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