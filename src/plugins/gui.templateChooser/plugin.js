export class GuiTemplateChooser {

    constructor(app) {
        this.app = app;
        app.registerHook('gui_view_home', this.initialize.bind(this));
    }

    initialize() {
        const sidebarTpl = $.templates("script#gui-tplchooser-sidebar");
        const contentTpl = $.templates("script#gui-tplchooser-content");

        this.onTabActivate = (event, ui) => {
            this.activateTab(ui.newTab, ui.oldTab);
        }
        console.log(this);
        this.loadNewTab();
        console.log(this);
        contentTpl.link(this.app.ui.$content, this);
        sidebarTpl.link(this.app.ui.$sidebar, this);
        this.app.$container.localize();
    }

    activateTab(tab, oldTab) {
        let id = tab.data().tabId;
        switch(id) {
            case 'tab_new':
                this.loadNewTab();
                break;
            case 'tab_edit':
                this.loadEditTab();
                break;
        }
    }

    loadNewTab() {
        var categories = this.app.storage.getTemplateCategories();
        var templates = this.app.storage.getTemplates({});
        this.model = {
            templates: templates,
            activeTemplate: {},
            categories: categories
        };
        setTimeout(() => this.app.ui.$content.localize(), 100);
        $.observable(this).setProperty('template', '#gui-tplchooser-new-content');
    }

    loadEditTab() {
        var categories = this.app.storage.getTemplateCategories();
        var objects = this.app.storage.getObjects({});

        this.model = {
            objects: objects,
            activeObject: {}
        };
        setTimeout(() => this.app.ui.$content.localize(), 100);
        $.observable(this).setProperty('template', '#gui-tplchooser-edit-content');
    }

    applyFilter(e) {
        e.preventDefault();
        var $keyword = this.app.ui.$sidebar.find('#keyword');
        var $categories = this.app.ui.$sidebar.find("#categories input[type=checkbox]:checked");
        var cats = $categories.map((i, cat) => cat.value);
        var templates = this.app.storage.getTemplates({keyword: $keyword.val(), categories: cats.get()});
        $.observable(this.model.templates).refresh(templates);
    }

    showDetail(e) {
        let $target = $(e.currentTarget);
        let id = $target.data().id;
        let template = this.model.templates.find(it => it.id == id);
        $.observable(this.model).setProperty('activeTemplate', template);
        this.app.ui.$content.localize();

        this.modal = new this.app.ui.components.Dialog({
            host: "#templateDetail",
            width: '60%',
            centerOnContent: true
        });
        this.modal.setButtons([]);
        this.modal.showModal();
    }

    closeDetail(destroy) {
        if (!this.modal) return;
        this.modal.close(destroy);
    }

    createObject(e, args) {
        this.closeDetail(true);
        this.showNewObjectForm();
    }

    showNewObjectForm() {
        const builder = this.app.ui.components.FormBuilder;
        const validators = this.app.validation.validators;

        const types = [
            { value: 'rea', label: 'Recurso educativo abierto' },
            { value: 'obi', label: 'Objeto informativo' },
            { value: 'red', label: 'Recurso digital' }
        ];
        let formConfig = builder.group({
            name: ['text', '', { label: 'dco.name', validators: [ validators.required ]}],
            type: ['radio', 'rea', { label: 'dco.type', validators: [ validators.required ], options: types }],
            shareWith: ['shareList', [], { label: 'dco.shareList', validators: [] }]
        });
        const titleText = 'dco.newTitle';
        let manager = new this.app.ui.components.FormManager({formConfig, titleText});
        manager.openDialog().then(this.createNewObject.bind(this)).catch((err) => {
            console.log(err);
        });
    }

    createNewObject(properties) {
        this.app.DcoManager.createNew(this.model.activeTemplate, properties, this.app.storage).then(dco => {
            this.app.data.dco = new this.app.DcoManager(dco, this.app.storage);
            this.app.ui.load('editor', null);
        }).catch(err => {
            console.log(err); //ToDo: Error handling
        });
    }

    openForEdition(dco) {
        console.log(this);
        this.app.data.dco = new this.app.DcoManager(dco, this.app.storage);
        this.app.ui.load('editor', null);
    }

    delete(dco) {
        console.log(dco);
    }
}
