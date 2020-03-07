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

        this.addPage({id: 'page1', title: 'Página 1'});
        this.addSection({id: 'section1', title: 'Sección 1'}, 'page1');
        this.addSection({id: 'section2', title: 'Sección 2'}, 'page1');
        this.addPage({id: 'page2', title: 'Página 2'});
        this.addSection({id: 'section1', title: 'Sección 1'}, 'page2');
        this.addSection({id: 'section2', title: 'Sección 2'}, 'page2');
        this.addPage({id: 'page3', title: 'Página 3'});
        this.addSection({id: 'section1', title: 'Sección 1'}, 'page3');
        
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

    addPage(page) {
        this.tree.pages.push(page);
    }

    addSection(section, pageId) {
        var page = this.tree.pages.find(p => p.id == pageId);
        (page.sections || (page.sections = [])).push(section);
    }

    addExtra(section) {
        this.tree.extras.push(section);
    }

    updateConfig(config) {
        this.config= Object.assign(this.config, config);
    }
}