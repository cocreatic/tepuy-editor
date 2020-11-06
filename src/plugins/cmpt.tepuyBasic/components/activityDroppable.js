import { Component, ComponentType, ContainerComponent } from '../../../js/component';
import { _ } from '../../../js/utils';
import { App } from '../../../js/app';


const isSource = (node) => node && node.matches('[data-group]');
const isTarget = (node) => node && node.matches('[data-target-group]');

const tpyTargetGroup = (ctrl, editor) => {
    ctrl.$contentEl.find('[data-target-group]').each((i, it) => {
        it.innerHTML = it.getAttribute('data-target-group');
        it.classList.add('mceNonEditable');
    });

    editor.ui.registry.addButton('tpyTargetGroup', {
        text: App.i18n.t('cmpt.tepuyBasic:activity-droppable.targetText'),
        //icon: 'tpy-icon4-16',
        tooltip: App.i18n.t('cmpt.tepuyBasic:activity-droppable.targetTooltip'),
        onAction: function() {
            const node = editor.selection.getNode();

            let maxTarget = 0;
            tinymce.dom.DomQuery(editor.getElement()).find('[data-target-group]').each((i, it) => {
                let target = parseInt(it.getAttribute('data-target-group'));
                if (target > maxTarget) maxTarget = target;
            });
            ctrl.targetCount = ++maxTarget;

            const content = '<div data-target-group="'+ctrl.targetCount+'" class="mceNonEditable">'+ctrl.targetCount+'</div>';
            if (isTarget(node)) {
                tinymce.dom.DomQuery(node).after(content);
            }
            else {
                editor.insertContent(content);
            }
        }
    });
};

const tpySourceGroup = (ctrl, editor) => {
    editor.ui.registry.addButton('tpySourceGroup', {
        text: App.i18n.t('cmpt.tepuyBasic:activity-droppable.sourceText'),
        //icon: 'tpy-icon4-16',
        tooltip: App.i18n.t('cmpt.tepuyBasic:activity-droppable.sourceTooltip'),
        onAction: function() {
            const node = editor.selection.getNode();
            const content = '<div data-group="x">&nbsp;</div>';
            if (isSource(node)) {
                tinymce.dom.DomQuery(node).after(content);
            }
            else {
                editor.insertContent(content);
            }
        }
    });
};

const tpyResultBox = (ctrl, editor) => {
    const text = App.i18n.t('cmpt.tepuyBasic:activity-droppable.resultBoxText');
    ctrl.$contentEl.find('.box_end').addClass('mceNonEditable').html(text);

    editor.ui.registry.addButton('tpyResultBox', {
        text: text,
        //icon: 'tpy-icon4-16',
        tooltip: App.i18n.t('cmpt.tepuyBasic:activity-droppable.resultBoxTooltip'),
        onAction: function() {
            let boxend = $(editor.getElement()).find('.box_end');
            if (boxend && boxend.length) {
                return; //There is already a result box.
            }
            let node = editor.selection.getNode();
            const content = '<div class="box_end mceNonEditable">'+text+'</div>';
            if (node.matches('body')) {
                editor.insertContent(content);
            }
            else {
                while(!node.parentElement.matches('body')) node = node.parentElement;
                tinymce.dom.DomQuery(node).after(content);
            }
        }
    });
};

const tpySourceTargetGroup = (ctrl, editor) => {
    const getSourceElement = () => {
        const node = editor.selection.getNode();
        return isSource(node) ? node : null;
    }

    editor.ui.registry.addContextForm('target-group', {
        launch: {
            type: 'contextformbutton',
            icon: 'checkmark'
        },
        label: 'Link',
        predicate: isSource,
        scope: 'node',
        initValue: function () {
            var elm = getSourceElement();
            return !!elm ? elm.getAttribute('data-group') : '';
        },
        commands: [
        {
            type: 'contextformbutton',
            icon: 'checkmark',
            tooltip: App.i18n.t('commands.accept'),
            primary: true,
            onAction: function (formApi) {
                var value = formApi.getValue();
                var elm = getSourceElement();
                elm.setAttribute('data-group', value);
                formApi.hide();
            }
        },
        {
            type: 'contextformbutton',
            icon: 'close',
            tooltip: App.i18n.t('commands.cancel'),
            active: true,
            onAction: function (formApi) {
                formApi.hide();
            }
        }
        ]
    });

}

const tpyToggleTarget = (ctrl, editor) => {
    editor.ui.registry.addToggleButton('tpyToggleTarget', {
        text: App.i18n.t('cmpt.tepuyBasic:activity-droppable.targetText'),
        //icon: 'tpy-icon4-16',
        tooltip: App.i18n.t('cmpt.tepuyBasic:activity-droppable.targetConvertTooltip'),
        onAction: function() {
            //editor.insertContent('<div data-target-group="'+ctrl.targetCount+'" class="mceNonEditable">'+ctrl.targetCount+'</div>');
            api.setActive(!api.isActive());
        },
        onSetup: function (api) {
            window.top.EDITOR = editor;
            api.setActive(true);
        }
    });
};

const tpyTargetGroupTd = (ctrl, editor) => {
    editor.ui.registry.addContextToolbar('tdtargetgroup', {
        predicate: function (node) {
            return /(td|th)/i.test(node.nodeName)
        },
        items: 'tpyTargetGroup',
        position: 'node',
        scope: 'node'
    });
}

const tpyNodeChangeHandler = (ctrl, editor) => {
    editor.on('nodeChange', (p) => {
        //console.log(p);
    });
}

export class ActivityDroppable extends Component {

    static get legacySelector() {
        return '.jpit-activities-droppable';
    }

    static get type() {
        return ComponentType.ACTIVITY;
    }

    static get tepuyPluginName() {
        return 'jpitActivityDroppable';
    }

    static get iconName() {
        return 'icon4-4';
    }

    constructor(element) { //All controls must receive the host element as a parameter, if no element or string provided, the element will be created but not added to the DOM
        super(element);

        //Read feedback
        const feedback = element && element.querySelector('feedback');
        let feedbackOk = '';
        let feedbackWrong = '';

        if (feedback) {
            let node = feedback.querySelector('correct');
            if (node) feedbackOk = node.innerHTML;
            node = feedback.querySelector('wrong');
            if (node) feedbackWrong = node.innerHTML;
            //feedback.remove();
        }

        //const clearBr = element && element.querySelector('br.clear');
        //clearBr && clearBr.remove();

        //Update content
        this.setPropertyValue('content', element ? element.innerHTML : '&nbsp;'); //'<question type="simplechoice"><description><p>Los tipos de preguntas que hay son: simplechoice y complete</p></description><ul><li data-response="true">Falso</li><li>Verdadero</li></ul><feedback><correct>Así es, hay más tipos de preguntas.</correct></feedback></question><question type="multisetchoice"><description><p>Seleccione solamente los pares o los impares</p></description><ul><li data-response="1">1</li><li data-response="2">2</li><li data-response="2">6</li><li data-response="1">3</li><li data-response="1">9</li></ul></question><question type="complete"><description><p>Sobre las diferencias entre los tipos de cuestionario.</p></description><p class="item">Las preguntas por defecto son mostradas de manera<select class="answers"><option data-response="true">aleatoria</option><option>ordenada</option></select>, para cambiar su comportamiento por defecto se debe agregar el atributo<select class="answers"><option>ni idea</option><option data-response="true">data-shuffle="false"</option></select>.</p></question>'); //Required because during super, innerHTML is not cloned
        this.setPropertyValue('feedbackOk', feedbackOk);
        this.setPropertyValue('feedbackWrong', feedbackWrong);
        this.host.classList.add('jpit-activities-droppable');
        const properties = _(this).properties;
        for(let i = 0; i < properties.length; i++) {
            this.getPropertyValue(properties[i].name);
        }
    }

    initialize() {
        const validators = App.validation.validators;
        const htmlpreset = this.defineHtmlSettings();
        const title = {name: 'title', type: 'text', attr: 'data-act-title', editSettings: {
            label: 'cmpt.tepuyBasic:activity.title',
            required: true,
            validators: [ validators.required ] }
        };
        const activityId = {name: 'activityId', type: 'text', attr: 'data-act-id', editSettings: {
            label: 'cmpt.tepuyBasic:activity.activityId',
            small: true,
            maxLength: 30,
            required: true,
            defaultValue: this.id,
            validators: [ validators.required ]
        }};
        const verifyTarget = {name: 'verifyTarget', type: 'text', attr: 'data-verify-target', editSettings: { visible: false }};
        const content = { name: 'content', type: 'html', prop: 'innerHTML', editSettings: {
            label: 'cmpt.tepuyBasic:activity-droppable.content',
            required: true,
            validators: [ validators.required ],
            preset: htmlpreset
        }};
        const feedbackOk = { name: 'feedbackOk', type: 'html', memory: true, editSettings: { label: 'cmpt.tepuyBasic:activity.feedbackOk', preset: 'basic' }};
        const feedbackWrong = { name: 'feedbackWrong', type: 'html', memory: true, editSettings: { label: 'cmpt.tepuyBasic:activity.feedbackWrong', preset: 'basic' }};
        const autoalign = {name: 'autoalign', type: 'boolean', attr: 'data-autoalign', editSettings: { label: 'cmpt.tepuyBasic:activity-droppable.autoalign', defaultValue: false }};
        //const multiTarget = {name: 'multiTarget', type: 'boolean', attr: 'data-target-multi', editSettings: { label: 'cmpt.tepuyBasic:activity-droppable.multiTarget', defaultValue: false }};
        const modalFeedback = {name: 'modalFeedback', type: 'boolean', attr: 'data-modal-feedback', editSettings: { label: 'cmpt.tepuyBasic:activity.modalFeedback', defaultValue: false }};
        _(this).properties = [title, activityId, content, feedbackOk, feedbackWrong, autoalign, modalFeedback];
    }

    updateProperties(value) {
        //remove styles added by tinymce
        value.content = value.content.replace(/(<[^>]+) style=".*?"/ig, '$1');
        super.updateProperties(value);
        //Clean HTML
        const $host = $(this.host);
        $host.find('[data-target-group],.box_end').removeClass('mceNonEditable').empty();
        const targetCount = $host.find('[data-target-group]').length;
        const groupCount = $host.find('[data-group]').length;
        if (targetCount > groupCount) this.setPropertyValue('verifyTarget', true);

        //Append clear 
        $host.find('br.clear').remove();
        $host.find('.box_end').before('<br class="clear" />');
        //Append feedback
        const feedbackOk = this.getPropertyValue('feedbackOk');
        const feedbackWrong = this.getPropertyValue('feedbackWrong');
        if (feedbackOk || feedbackWrong) {
            const feedback = document.createElement('feedback');
            if (feedbackOk) {
                const ok = document.createElement('correct');
                ok.innerHTML = feedbackOk;
                feedback.appendChild(ok);
            }
            if (feedbackWrong) {
                const wrong = document.createElement('wrong');
                wrong.innerHTML = feedbackWrong;
                feedback.appendChild(wrong);
            }
            $host.find('feedback').remove();
            $host.append(feedback);
        }
        this.setPropertyValue('content', this.host.innerHTML); //Update html
        //element.querySelectorAll('[data-target-group]')
        if (this.$host) {
            this.$host.jpitActivityDroppable();
        }
    }

    defineHtmlSettings() {
        const styles = '.mceNonEditable { min-width: 60px; border: dashed 1px #dedede; background-color: #fcfcfc; padding: 2px; margin: 2px; text-align: center; }' +
            'div[data-group] { display: inline-block; border: dashed 1px #dedede; background-color: #fcfcfc; padding: 2px; margin: 2px; text-align: center; }' +
            'div[data-target-group] { display: inline-block; }';
        return {
            toolbar: 'formatselect | undo redo | bold italic backcolor | alignleft aligncenter alignright alignjustify |' +
                ' table tabledelete |' +
                ' tableprops tablerowprops tablecellprops |' +
                ' tableinsertrowbefore tableinsertrowafter tabledeleterow |' +
                ' tableinsertcolbefore tableinsertcolafter tabledeletecol |' +
                ' tpySourceGroup tpyTargetGroup tpyResultBox |' +
                ' code',
            plugins: 'searchreplace paste table autoresize noneditable code',
            content_style: styles,
            min_height: 200,
            max_height: 600,
            width: '100%',
            table_grid: false,
            invalid_elements: 'feedback',
            customs: ['tpyMobileOnly'],
            customize: (editor, tag) => {
                //Setup target group elements
                //const toclear = this.host.querySelector('feedback,br.clear');
                //toclear && toclear.remove();
                this.$contentEl = tinymce.dom.DomQuery(editor.getElement());
                this.$contentEl.find('feedback').remove(); //Remove feedback element
                this.$contentEl.find('br.clear').remove(); //Remove clear br
                tpySourceGroup(this, editor);
                tpyTargetGroup(this, editor);
                tpyResultBox(this, editor);
                tpyToggleTarget(this, editor);
                tpySourceTargetGroup(this, editor);
                tpyNodeChangeHandler(this, editor);
            }
        }
    }
}
