import { newid } from '../../../js/utils';

export const tinymceCtrl = { };
export const htmleditor = {
// ============================= JSTREE =============================
    argDefault: false, // Do not default missing arg to #data
    mainElement: ".tpy-htmleditor",
    widgetName: 'tinymce',
    bindTo: [0],
    bindFrom: [0, 'settings'],
    linkedCtxParam: ['content', 'settings'],
    template: '<div class="tpy-htmleditor" data-link="id{:~tagCtx.id}html{:~content}"></div>',
    init: function(tagCtx) {
        var content, elemType,
            tag = this;
        tinymceCtrl.instances++;
        // Prevent jQuery UI dialog from blocking focusin
        if (!tinymceCtrl.focusin) {
            tinymceCtrl.focusin = true;
            $(document).on('focusin', this.focusin);
        }
        this.id = tagCtx.id = newid();
    },
    onBind: function(tagCtx) {
        const settings = this.ctxPrm('settings');
        const toolbarConfig = 'undo redo |' +
            ' formatselect |' +
            ' bold italic backcolor |' +
            ' alignleft aligncenter alignright alignjustify |' +
            ' table tabledelete |' +
            ' tableprops tablerowprops tablecellprops |' +
            ' tableinsertrowbefore tableinsertrowafter tabledeleterow |' +
            ' tableinsertcolbefore tableinsertcolafter tabledeletecol |' +
            ' bullist numlist outdent indent |' +
            ' removeformat |' +
            ' media |' +
            ' tpyBlockquote tpyAccordion tpyTwoColumns |' +
            ' code |' +
            ' help';
        const stylesheets = [];

        if (settings && settings.baseURI) {
            stylesheets.push([settings.baseURI.replace(/\/+$/, ''), 'css/styles.css'].join('/'));
        }

        var mainElem, prop, i, optionKey, plugin,
            tag = this,
            widgetName = tag.widgetName,
            defaultConfig = {
                height: 500,
                menubar: "insert",
                forced_root_block: false,
                icons: 'tepuy',
                content_css: stylesheets.join(','),
                plugins: [
                  'advlist autolink lists link image charmap print preview anchor',
                  'searchreplace visualblocks fullscreen',
                  'insertdatetime media table paste code help'
                ],
                visualblocks_default_state: true,
                formats: {},
                toolbar: toolbarConfig,
                toolbar_mode: 'wrap',
                setup: function(editor) {
                    // Store widget instance
                    tag.widget = editor;
                    editor.on('Change', function() {
                        const content = editor.getContent();
                        tag.ctxPrm("content", content); //Two way binding;
                    });

                    editor.ui.registry.addButton('tpyBlockquote', {
                        icon: 'tpy-blockquote',
                        tooltip: 'Insertar cita',
                        onAction: function() {
                            editor.insertContent('<blockquote>Texto cita<label>Referencia</label></blockquote>');
                        }
                    });

                    editor.ui.registry.addButton('tpyTwoColumns', {
                        icon: 'tpy-two-columns',
                        tooltip: 'Dos columnas',
                        onAction: function() {
                            editor.insertContent('<div class="row"><div class="col-2">Columna 1</div><div class="col-2">Columna 2</div></div>');
                        }
                    })
                }
            };

        const config = Object.assign({}, defaultConfig);

        mainElem = tag.mainElem;
        if (!mainElem || !mainElem[0]) {
            // This may be due to using {{myWidget}} No element found here {{/myWidget}} 
            throw "No element found for tag '" + tag.tagName +"'";
        }

        //Set tinymce baseURL
        tinymce.baseURL = 'vendor/assets/tinymce';
        mainElem[widgetName](config);
    },
    onDispose: function() {
        tinymceCtrl.instances--;
        if (tinymceCtrl.instances == 0) {
            $(document).off('focusin', this.focusin);
            delete tinymceCtrl.focusin;
        }
        this.widget.destroy();
    },
    focusin: function(e) {
        if ($(e.target).closest(".tox-tinymce-aux, .moxman-window, .tam-assetmanager-root").length) {
            e.stopImmediatePropagation();
        }
    },
    onUpdate: false, // Don't rerender whole tag on update
    dataBoundOnly: true/*,
    attr: "html"*/
};
