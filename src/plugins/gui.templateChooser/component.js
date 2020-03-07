import { App } from '../../js/app';

export class GuiTemplateChooser {

    constructor() {
        App.registerHook('gui_view_home', this.initialize.bind(this));
    }

    initialize() {
        const sidebarTpl = $.templates("script#gui-tplchooser-sidebar");
        const contentTpl = $.templates("script#gui-tplchooser-content");

        var categories = App.api.call('getTemplateCategories');
        var templates = App.api.call('getTemplates', {});
        this.model = {
            templates: templates,
            activeTemplate: {},
            categories: categories
        };

        contentTpl.link(App.ui.$content, this);
        sidebarTpl.link(App.ui.$sidebar, this);
        App.ui.$sidebar.localize();
        App.ui.$content.localize();
    }

    applyFilter(e) {
        e.preventDefault();
        var $keyword = App.ui.$sidebar.find('#keyword');
        var $categories = App.ui.$sidebar.find("#categories input[type=checkbox]:checked");
        var cats = $categories.map((i, cat) => cat.value);
        var templates = App.api.call('getTemplates',{keyword: $keyword.val(), categories: cats.get()});
        $.observable(this.model.templates).refresh(templates);
    }

    showDetail(e) {
        let $target = $(e.currentTarget);
        let id = $target.data().id;
        let template = this.model.templates.find(it => it.id == id);
        $.observable(this.model).setProperty('activeTemplate', template);
        $( "#templateDetail" ).dialog({
            modal: true,
            width:'60%',
       });
    }

    closeDetail(destroy) {
        $( "#templateDetail").dialog(destroy?'destroy':'close');
    }

    createObject(e, args) {
        this.closeDetail(true);
        App.ui.load('editor', this.activeTemplate);
    }
}
