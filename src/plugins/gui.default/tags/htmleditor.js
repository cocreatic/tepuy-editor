import { newid } from '../../../js/utils';

export const tinymceCtrl = { };
export const htmleditor = {
// ============================= JSTREE =============================
    argDefault: false, // Do not default missing arg to #data
    mainElement: ".tpy-htmleditor",
    widgetName: 'tinymce',
    bindFrom: [0],
    linkedCtxParam: ["html"],
    template: '<div class="tpy-htmleditor" data-link="id{:~tagCtx.id}html{:~tagCtx.args[0]}"></div>',
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
        tinymceCtrl.instances++;
    },
    onBind: function(tagCtx) {
        var mainElem, prop, i, optionKey, plugin,
            tag = this,
            widgetName = tag.widgetName,
            defaultConfig = {
                height: 500,
                menubar: "insert",
                forced_root_block: false,
                plugins: [
                  'advlist autolink lists link image charmap print preview anchor',
                  'searchreplace visualblocks code fullscreen',
                  'insertdatetime media table paste code help'
                ],
                toolbar: 'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | table tabledelete | tableprops tablerowprops tablecellprops | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol | bullist numlist outdent indent | removeformat | media | code | help',
                setup: function(editor) {
                    // Store widget instance
                    tag.widget = editor;
                    editor.on('Change', function() {
                        const content = editor.getContent();
                        tag.ctxPrm("html", content); //Two way binding;
                        tag.updateValues();
                    });
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
    dataBoundOnly: true,
    attr: "html"
};
