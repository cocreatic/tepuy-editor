import { App } from '../../js/app';

export class GuiTemplateChooser {

    constructor() {
        App.registerHook('gui_view_home', this.initialize.bind(this));

        //Guarantee this context on handlers
        this.createObject = this.createObject.bind(this);
        this.closeDetail = this.closeDetail.bind(this);
        this.openForEdition = this.openForEdition.bind(this);
        this.delete = this.delete.bind(this);
    }

    initialize() {
        const sidebarTpl = $.templates("script#gui-tplchooser-sidebar");
        const contentTpl = $.templates("script#gui-tplchooser-content");

        this.onTabActivate = (event, ui) => {
            this.activateTab(ui.newTab, ui.oldTab);
        }
        this.loadNewTab();
        contentTpl.link(App.ui.$content, this);
        sidebarTpl.link(App.ui.$sidebar, this);
        App.$container.localize();

        const obj = App.storage.getObjects({})[0];
        if (!obj.baseUrl) obj.baseUrl = 'http://localhost/tepuy-repository/plantilla/';
        this.openForEdition(obj);
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
        var categories = App.storage.getTemplateCategories();
        var templates = App.storage.getTemplates({});
        this.model = {
            templates: templates,
            activeTemplate: {},
            categories: categories
        };
        setTimeout(() => App.ui.$content.localize(), 100);
        $.observable(this).setProperty('template', '#gui-tplchooser-new-content');
    }

    loadEditTab() {
        var categories = App.storage.getTemplateCategories();
        var objects = App.storage.getObjects({});

        this.model = {
            objects: objects,
            activeObject: {}
        };
        setTimeout(() => App.ui.$content.localize(), 100);
        $.observable(this).setProperty('template', '#gui-tplchooser-edit-content');
    }

    applyFilter(e) {
        e.preventDefault();
        var $keyword = App.ui.$sidebar.find('#keyword');
        var $categories = App.ui.$sidebar.find("#categories input[type=checkbox]:checked");
        var cats = $categories.map((i, cat) => cat.value);
        var templates = App.storage.getTemplates({keyword: $keyword.val(), categories: cats.get()});
        $.observable(this.model.templates).refresh(templates);
    }

    showDetail(e) {
        let $target = $(e.currentTarget);
        let id = $target.data().id;
        let template = this.model.templates.find(it => it.id == id);
        $.observable(this.model).setProperty('activeTemplate', template);
        App.ui.$content.localize();

        this.modal = new App.ui.components.Dialog({
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
        const builder = App.ui.components.FormBuilder;
        const validators = App.validation.validators;

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
        let manager = new App.ui.components.FormManager({formConfig, titleText});
        manager.openDialog({ width: '60vw' }).then(this.createNewObject.bind(this)).catch((err) => {
            console.log(err);
        });
    }

    createNewObject(properties) {
        App.DcoManager.createNew(this.model.activeTemplate, properties, App.storage).then(dco => {
            App.data.dco = new App.DcoManager(dco, App.storage);
            App.ui.load('editor', null);
        }).catch(err => {
            console.log(err); //ToDo: Error handling
        });
    }

    openForEdition(dco) {
        App.data.dco = new App.DcoManager(dco, App.storage);
        App.ui.load('editor', null);
    }

    delete(dco) {
        console.log(dco);
    }
}
