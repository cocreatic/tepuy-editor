import { App } from '../../../js/app';
import { newid, isFunction } from '../../../js/utils';
import { ResourceLookup } from '../components/resourceLookup';

const presets = {
    basic: {
        toolbar: 'undo redo | bold italic backcolor | alignleft aligncenter alignright alignjustify | image |',
        plugins: 'searchreplace paste image',
        //height: undefined,
        min_height: 200,
        width: '100%',
        customs: ['tpyMobileOnly']
    },
    default: {
        height: 500,
        toolbar: 'undo redo |' +
            ' formatselect |' +
            ' bold italic backcolor |' +
            ' alignleft aligncenter alignright alignjustify |' +
            ' table tabledelete |' +
            ' tableprops tablerowprops tablecellprops |' +
            ' tableinsertrowbefore tableinsertrowafter tabledeleterow |' +
            ' tableinsertcolbefore tableinsertcolafter tabledeletecol |' +
            ' bullist numlist outdent indent |' +
            ' removeformat |' +
            ' image media |' +
            ' tpyBlockquote tpyAccordion tpyTwoColumns |' +
            ' code |' +
            ' help',
        plugins: [
            'advlist autolink lists link image charmap print preview anchor',
            'searchreplace visualblocks fullscreen',
            'insertdatetime media table paste code help'
        ],
        customs: ['tpyBlockquote', 'tpyTwoColumns' ]
    }
}

const basic_with_placeholder = Object.assign({
    content_style: 'span.placeholder { display: inline-block; width: 60px; border-bottom: solid 1px #000; background-color: #fcfcfc; padding: 2px; margin: 2px }'
}, presets.basic);
basic_with_placeholder.toolbar += ' tpyQuestionPlaceholder |'
basic_with_placeholder.customs = ['tpyQuestionPlaceholder'];
basic_with_placeholder.plugins += ' noneditable';
presets.basic_with_placeholder = basic_with_placeholder;

const customizations = {
    tpyBlockquote: (editor) => {
        editor.ui.registry.addButton('tpyBlockquote', {
            icon: 'tpy-blockquote',
            tooltip: 'Insertar cita',
            onAction: function() {
                editor.insertContent('<blockquote>Texto cita<label>Referencia</label></blockquote>');
            }
        });
    },
    tpyTwoColumns: (editor) => {
        editor.ui.registry.addButton('tpyTwoColumns', {
            icon: 'tpy-two-columns',
            tooltip: 'Dos columnas',
            onAction: function() {
                editor.insertContent('<div class="row"><div class="col-2">Columna 1</div><div class="col-2">Columna 2</div></div>');
            }
        })
    },
    tpyQuestionPlaceholder: (editor) => {
        editor.ui.registry.addButton('tpyQuestionPlaceholder', {
            icon: 'tpy-icon4-16',
            tooltip: 'Agregar espacio para completar',
            onAction: function() {
                editor.insertContent('<span class="placeholder mceNonEditable">&nbsp;</span>');
            }
        })
    },
    tpyMobileOnly: (editor) => {
        editor.ui.registry.addButton('tpyMobileOnly', {
            icon: 'fas-mobile-alt',
            tooltip: 'Mostrar solo en móviles',
            onAction: function() {
                const node = editor.selection.getNode();
                node.classList.add('onlymobile');
            }
        })
    }
}

const filePicker = (callback, value, meta) => {
    let lookup = tinymceCtrl.resourceLookup;
    const filter = parseFilter(meta.filetype);
    if (!lookup) {
        lookup = new ResourceLookup(filter, 'body');
        tinymceCtrl.lookup = lookup;
    }
    else {
        lookup.setFilter(filter);
    }

    lookup.showModal().then(selected => {
        callback(selected.path, meta);
    }, error => {});
    lookup.dlg.$dlg.closest(".ui-widget.ui-dialog").css({ "z-index": 1400 });
}

const parseFilter = (filetype) => {
    if (filetype == 'image') return 'image';
    if (filetype == 'media') return 'video';
    return undefined;
}

const tpyAltEnter = (editor) => {
    editor.on('keydown', (e) => {
        if (e.keyCode == 13 && e.altKey) {
            const node = editor.selection.getNode();
            const $node = tinymce.dom.DomQuery(node);
            if (node.parentElement) {
                editor.selection.select(node.parentElement);
                editor.selection.collapse(false);
            }
            return false;
        }
    });
}
const registerCustoms = (editor, customs) => {
    //tpyAltEnter(editor);
    for(let i = 0; i < customs.length; i++) {
        customizations[customs[i]] && customizations[customs[i]].apply(null, [editor]);
    }
};

export const tinymceCtrl = {};
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
//        // Prevent jQuery UI dialog from blocking focusin
//        if (!tinymceCtrl.focusin) {
//            tinymceCtrl.focusin = true;
//            $(document).on('focusin', this.focusin);
//        }
        this.id = tagCtx.id = newid();
    },
    onBind: function(tagCtx) {
        const settings = this.ctxPrm('settings')||{};
        const preset = (typeof settings.preset === 'object')
            ? settings.preset
            : presets[settings.preset || 'default'];

        const stylesheets = [];

        if (settings && settings.baseURI) {
            stylesheets.push([settings.baseURI.replace(/\/+$/, ''), 'css/styles.css'].join('/'));
        }

        var mainElem, prop, i, optionKey, plugin,
            tag = this,
            widgetName = tag.widgetName,
            defaultConfig = {
                menubar: "insert",
                forced_root_block: false,
                icons: 'tepuy',
                content_css: stylesheets.join(','),
                visualblocks_default_state: true,
                formats: {},
                toolbar_mode: 'wrap',
            };

        const config = Object.assign(defaultConfig, preset);
        config.file_picker_callback = filePicker;
        const baseURI = App.ui && App.ui.editorPlugin && App.ui.editorPlugin.dco && App.ui.editorPlugin.dco.manifest && App.ui.editorPlugin.dco.manifest.baseUrl;
        config.document_base_url = settings.baseURI || baseURI;
        config.base_url = 'vendor/assets/tinymce';
        config.setup = function(editor) {
            // Store widget instance
            tag.widget = editor;
            editor.on('Change', function() {
                const content = editor.getContent();
                tag.ctxPrm("content", content); //Two way binding;
            });
            if (preset.customs) {
                registerCustoms(editor, preset.customs);
            }

            if (preset.customize && isFunction(preset.customize)) {
                preset.customize.apply(null, [editor, tag]);
            }
        }

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
