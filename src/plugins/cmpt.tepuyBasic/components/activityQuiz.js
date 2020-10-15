import { Component, ComponentType, ContainerComponent } from '../../../js/component';
import { _ } from '../../../js/utils';
import { App } from '../../../js/app';

const prefixes = [
    { value: '0', label: 'cmpt.tepuyBasic:activity-quiz.prefix.none' },
    { value: '1', label: 'cmpt.tepuyBasic:activity-quiz.prefix.numeric' },
    { value: '2', label: 'cmpt.tepuyBasic:activity-quiz.prefix.letter' },
    { value: '3', label: 'cmpt.tepuyBasic:activity-quiz.prefix.capital' },
    { value: '4', label: 'cmpt.tepuyBasic:activity-quiz.prefix.roman' },
];

export class ActivityQuiz extends Component {

    static get legacySelector() {
        return '.jpit-activities-quiz';
    }

    static get type() {
        return ComponentType.ACTIVITY;
    }

    static get tepuyPluginName() {
        return 'jpitActivityQuiz';
    }

    static get iconName() {
        return 'icon4-1';
    }

    constructor(element) { //All controls must receive the host element as a parameter, if no element or string provided, the element will be created but not added to the DOM
        super(element);
        this.setPropertyValue('questions', element ? element.innerHTML : '&nbsp;'); //'<question type="simplechoice"><description><p>Los tipos de preguntas que hay son: simplechoice y complete</p></description><ul><li data-response="true">Falso</li><li>Verdadero</li></ul><feedback><correct>Así es, hay más tipos de preguntas.</correct></feedback></question><question type="multisetchoice"><description><p>Seleccione solamente los pares o los impares</p></description><ul><li data-response="1">1</li><li data-response="2">2</li><li data-response="2">6</li><li data-response="1">3</li><li data-response="1">9</li></ul></question><question type="complete"><description><p>Sobre las diferencias entre los tipos de cuestionario.</p></description><p class="item">Las preguntas por defecto son mostradas de manera<select class="answers"><option data-response="true">aleatoria</option><option>ordenada</option></select>, para cambiar su comportamiento por defecto se debe agregar el atributo<select class="answers"><option>ni idea</option><option data-response="true">data-shuffle="false"</option></select>.</p></question>'); //Required because during super, innerHTML is not cloned
        this.addChildText = 'cmpt.tepuyBasic:activity-quiz.addChildText';
        this.host.classList.add('jpit-activities-quiz');
        const properties = _(this).properties;
        for(let i = 0; i < properties.length; i++) {
            this.getPropertyValue(properties[i].name);
        }
    }

    initialize() {
        const validators = App.validation.validators;

        const title = {name: 'title', type: 'text', attr: 'data-act-title', editSettings: { label: 'cmpt.tepuyBasic:activity-quiz.title_prop', validators: [ validators.required ] }};
        const activityId = {name: 'activityId', type: 'text', attr: 'data-act-id', editSettings: { label: 'cmpt.tepuyBasic:activity-quiz.activityId', defaultValue: this.id, validators: [ validators.required ] }};
        const shuffle = {name: 'shuffle', type: 'boolean', attr: 'data-shuffle', editSettings: { label: 'cmpt.tepuyBasic:activity-quiz.shuffle', defaultValue: true }};
        const prefix = {name: 'prefix', type: 'optionList', attr: 'data-prefixtype', editSettings: { label: 'cmpt.tepuyBasic:activity-quiz.prefixtype', options: prefixes, defaultValue: '0' }};
        const requireAll = {name: 'requireAll', type: 'boolean', attr: 'data-requiredall', editSettings: { label: 'cmpt.tepuyBasic:activity-quiz.requiredall', defaultValue: true }};
        const paginationNumber = {name: 'paginationNumber', type: 'number', attr: 'data-paginationnumber', editSettings: { label: 'cmpt.tepuyBasic:activity-quiz.paginationnumber', defaultValue: 1 }};
        const allowretry = {name: 'allowretry', type: 'boolean', attr: 'data-allow-retry', editSettings: { label: 'cmpt.tepuyBasic:activity-quiz.allowretry', defaultValue: true }};
        const modalFeedback = {name: 'modalFeedback', type: 'boolean', attr: 'data-modal-feedback', editSettings: { label: 'cmpt.tepuyBasic:activity-quiz.modalFeedback', defaultValue: false }};
        const questions = {name: 'questions', type: 'customtag', prop: 'innerHTML', editSettings: {
            label: 'cmpt.tepuyBasic:activity-quiz.questions',
            tagTemplate: '{^{tpyBasicQuestionaire value settings /}}',
            validators: [ validators.required ]
        }};

        _(this).properties = [title, activityId, prefix, paginationNumber, shuffle, requireAll, allowretry, modalFeedback, questions];

    }

    get canHideAppendButton() {
        return false;
    }

    acceptChild(type) {
        return type.ctor && type.ctor.id === 'activity-quiz-question';
    }

    updateProperties(value) {
        super.updateProperties(value);
        if (this.$host) {
            this.$host.jpitActivityQuiz();
        }
    }

}


(function($) {

    function parseQuestions(html) {
        let options;
        const parser = new DOMParser();
        const fragment = parser.parseFromString(html, 'text/html');
        const $fragment = $(fragment);
        const $questions = $fragment.find('question');

        const questions = $questions.map(function(i, q) {
            const $q = $(q);
            const type = $q.attr('type');
            const description = $q.find('>description').html();
            const feedbackOk = $q.find('>feedback correct').html();
            const feedbackWrong = $q.find('>feedback wrong').html();
            const feedbackAll = $q.find('>feedback all').html();
            const data = $q.data();

            const question = {
                type,
                description,
                feedbackOk,
                feedbackWrong,
                feedbackAll,
                shuffle: data.shuffle && data.shuffle !== true,
                prefixtype: data.prefixtype || 3 //capital
            };

            switch(type) {
                case 'multichoice':
                case 'simplechoice':
                    options = $q.find('>ul').first().find('li').map(function (i, opt) {
                        const $opt = $(opt);
                        return {
                            text: $opt.html(),
                            isCorrect: $opt.attr('data-response') === 'true'
                        }
                    }).get();
                    question.options = options;
                    break;
                case 'complete':
                    const $paragraph = $q.find('>p.item').clone(true);
                    const answersets = [];
                    let maxTarget = 0;
                    let options = [];
                    $paragraph.find('.answers').each(function(i, it) {
                        const thisOptions = $(it).find('li,option').map(function(k, opt) {
                            const $opt = $(opt)
                            return {
                                text: $opt.html(),
                                isCorrect: $opt.attr('data-response') === 'true',
                                target: k
                            }
                        }).get();
                        maxTarget++;
                        options = [...options, thisOptions];
                    });
                    $paragraph.find('.answers').after('<span class=".placeholder"></span>').remove();
                    question.paragraph = $paragraph.html();
                    question.option = options;
                    question.maxTarget = maxTarget;
                    break;
                case 'label':
                    question.text = $q.find('>text').html();
                    break;
                case 'defineterm':
                    options = $q.find('ul').first().find('li').map(function (i, opt) {
                        const $opt = $(opt);
                        return {
                            text: $opt.html(),
                            response: $opt.attr('data-response')
                        }
                    }).get();
                    question.options = options;
                    question.casesensitive = data.casesensitive;
                    question.keysensitive = data.keysensitive;
                    break;
                case 'multisetchoice':
                    options = $q.find('>ul').first().find('li').map(function (i, opt) {
                        const $opt = $(opt);
                        return {
                            text: $opt.html(),
                            response: $opt.attr('data-response')
                        }
                    }).get();
                    question.options = options;
                    break;
            }
            return question;
        }).get();
        const $feedback = $fragment.children('feedback').first();
        const feedbackOk = $feedback.find('correct').html();
        const feedbackWrong = $feedback.find('wrong').html();
        const feedbackAll = $feedback.find('all').html();

        return {
            questions,
            feedbackOk,
            feedbackWrong,
            feedbackAll,
            $fragment
        };
    }

    function openQuestionEditor(question, callback) {
        const builder = App.ui.components.FormBuilder;
        const validators = App.validation.validators;

        const questionTypes = [
            { value: 'simplechoice', label: 'cmpt.tepuyBasic:activity-quiz.types.simplechoice' },
            { value: 'multichoice', label: 'cmpt.tepuyBasic:activity-quiz.types.multichoice' },
            { value: 'complete', label: 'cmpt.tepuyBasic:activity-quiz.types.complete' },
            { value: 'label', label: 'cmpt.tepuyBasic:activity-quiz.types.label' },
            { value: 'defineterm', label: 'cmpt.tepuyBasic:activity-quiz.types.defineterm' },
            { value: 'multisetchoice', label: 'cmpt.tepuyBasic:activity-quiz.types.multisetchoice' }
        ];
        const controls = {
            index: ['number', question.index, { visible: false }],
            description: ['html', question.description, { label: 'cmpt.tepuyBasic:activity-quiz.question.description', preset: 'basic', validators: [validators.required] }]
        };

        if (question.type == 'label') {
            controls.text = ['html', question.text, { label: 'cmpt.tepuyBasic:activity-quiz.question.text', preset: 'basic', validators: [validators.required] }];
        }
        else {
            if (question.type == 'complete') {
                controls.paragraph = ['html', question.paragraph, { label: 'cmpt.tepuyBasic:activity-quiz.question.paragraph', preset: 'basic_with_placeholder', validators: [validators.required] }];
            }
            controls.options = ['customtag', question.options, {
                label: 'cmpt.tepuyBasic:activity-quiz.question.options',
                tagTemplate: '{^{tpyBasicAnswerList value settings=settings /}}',
                qtype: question.type,
                maxTarget: question.maxTarget,
                validators: [ validators.required ]
            }];
            controls.shuffle = ['boolean', question.shuffleAnswers, { label: 'cmpt.tepuyBasic:activity-quiz.shuffle' }];
            controls.feedbackOk = ['html', question.feedbackOk, { label: 'cmpt.tepuyBasic:activity-quiz.feedbackOk', preset: 'basic' }];
            controls.feedbackWrong = ['html', question.feedbackWrong, { label: 'cmpt.tepuyBasic:activity-quiz.feedbackWrong', preset: 'basic' }];
            controls.prefixtype = ['optionList', question.prefixtype, { label: 'cmpt.tepuyBasic:activity-quiz.prefixtype', options: prefixes, defaultValue: '0' }];
        }
        const formConfig = builder.group(controls);
        if (controls.paragraph) {
            $(formConfig.controls.paragraph).on('tpy:valueChanged', (ev, data) => {
                const maxTarget = (data.value.match(/<span class="placeholder[\w\s]*">&nbsp;<\/span>/g) || []).length;
                $.observable(controls.options[2]).setProperty({ maxTarget });
                $.observable(question).setProperty({ maxTarget });
            });
        }
        const titleText = App.i18n.t('cmpt.tepuyBasic:activity-quiz.question.editTitle');
        let manager = new App.ui.components.FormManager({formConfig, titleText});
        setTimeout(() => {
            manager.openDialog({ width: '60vw', position: { my: 'top' }}).then(callback).catch((err) => {
                console.log(err);
            });
        }, 200);
    }

    function openOptionEditor(option, callback) {
        const builder = App.ui.components.FormBuilder;
        const validators = App.validation.validators;

        const controls = {
            index: ['number', option.index, { visible: false }],
            text: ['html', option.text, { label: 'cmpt.tepuyBasic:activity-quiz.option.text', preset: 'basic', validators: [validators.required] }]
        };

        if (option.hasOwnProperty('isCorrect')) {
            controls.isCorrect = ['boolean', option.isCorrect, { label: 'cmpt.tepuyBasic:activity-quiz.option.correctAnswer' }]
        }

        if (option.hasOwnProperty('target')) {
            const targets = [];
            for(let i = 0; i < option.maxTarget; i++) targets[i] = { value: i, label: ''+(i+1) };
            controls.target = ['optionList', option.target, { label: 'cmpt.tepuyBasic:activity-quiz.option.target', options: targets }]
        }

        if (option.hasOwnProperty('response')) {
            controls.response = ['html', option.response, { label: 'cmpt.tepuyBasic:activity-quiz.option.text', preset: 'basic' }]
        }

        const formConfig = builder.group(controls);
        const titleText = App.i18n.t('cmpt.tepuyBasic:activity-quiz.option.editTitle');
        let manager = new App.ui.components.FormManager({formConfig, titleText});
        setTimeout(() => {
            manager.openDialog({ width: '60vw', position:{ my: 'top'}}).then(callback).catch((err) => {
                console.log(err);
            });
        }, 200);
    }

    function questionToHtml(question) {
        const el = document.createElement('question');
        const description = document.createElement('description');
        description.innerHTML = question.description;
        el.setAttribute('type', question.type);
        el.appendChild(description);

        if (question.type == 'label') {
            const text = document.createElement('text');
            text.innerHTML = question.text;
            el.appendChild(text);
            return el.outerHTML;
        }

        const optionTargets = [];
        if (question.type == 'complete') {
            const paragraph = document.createElement('p');
            paragraph.className = 'item';
            paragraph.innerHTML = question.paragraph;
            el.appendChild(paragraph);
            $(paragraph).find('.placeholder').each(function(i, it) {
                const select = document.createElement('select');
                select.className = 'answers';
                optionTargets.push(select);
                it.parentNode.insertBefore(select, it.nextSibling);
            }).remove();
        }
        else {
            const optionsul = document.createElement('ul');
            el.appendChild(optionsul);
            optionTargets.push(optionsul);
        }

        for(let i = 0; i < question.options.length; i++) {
            const option = question.options[i];
            const target = parseInt(option.target || 0);
            const optionEl = document.createElement(question.type == 'complete' ? 'option' : 'li');
            if (option.hasOwnProperty('isCorrect')) {
                if (option.isCorrect) optionEl.setAttribute('data-response', true);
            }
            else {
                optionEl.setAttribute('data-response', option.response);
            }
            optionEl.innerHTML = option.text;
            optionTargets[target].appendChild(optionEl);
        }

        if (question.feedbackOk || question.feedbackWrong) {
            const feedback = document.createElement('feedback');
            if (question.feedbackOk) {
                const ok = document.createElement('correct');
                ok.innerHTML = question.feedbackOk;
                feedback.appendChild(ok);
            }
            if (question.feedbackWrong) {
                const wrong = document.createElement('wrong');
                wrong.innerHTML = question.feedbackWrong;
                feedback.appendChild(wrong);
            }
            el.appendChild(feedback);
        }

        return el;
    }

    if (!($.views)) {
        console.log('JSViews not found')
        return;
    }

    const questionaire = {
        template: '#cmpt-tepuy-basic-questionaire',
        bindFrom: [0, 'settings'],
        linkedCtxParam: ["content", "settings"], //"canEdit"],
        init: function(tagCtx){
            this.questionTypes = [
                { value: 'simplechoice', label: 'cmpt.tepuyBasic:activity-quiz.types.simplechoice' },
                { value: 'multichoice', label: 'cmpt.tepuyBasic:activity-quiz.types.multichoice' },
                { value: 'complete', label: 'cmpt.tepuyBasic:activity-quiz.types.complete' },
                { value: 'label', label: 'cmpt.tepuyBasic:activity-quiz.types.label' },
                { value: 'defineterm', label: 'cmpt.tepuyBasic:activity-quiz.types.defineterm' },
                { value: 'multisetchoice', label: 'cmpt.tepuyBasic:activity-quiz.types.multisetchoice' }
            ];
            this.update = this.update.bind(this);
            this.newtype = 'simplechoice';
        },
        displayElem: 'div',
        onBind: function(tagCtx) {
            const content = this.ctxPrm('content');
            const setup = parseQuestions(content);
            this.ctxPrm('setup', setup);
            //this.setup = setup;
        },
        onUpdate: false,
        dataBoundOnly: true,
        //methods
        add: function(ev) {
            let question = {
                type: this.newtype,
                options: [],
                index: -1
            };
            openQuestionEditor(question, this.update);
        },
        moveUp: function(index) {
            if (index == 0) return;
            const setup = this.ctxPrm('setup');
            $.observable(setup.questions).move(index, index-1);
            const $root = setup.$fragment.find('body');
            const $el = $root.find('question:nth-child('+(index)+')');
            $el.next().after($el);
            //update content
            this.ctxPrm('content', $root.html());
        },
        moveDown: function(index) {
            const setup = this.ctxPrm('setup');
            if (index == (setup.questions.length-1)) return;
            $.observable(setup.questions).move(index, index+1);
            const $root = setup.$fragment.find('body');
            const $el = $root.find('question:nth-child('+(index+1)+')');
            $el.next().after($el);
            //update content
            this.ctxPrm('content', $root.html());
        },
        edit: function(index) {
            const setup = this.ctxPrm('setup');
            let question = setup.questions[index];
            question = JSON.parse(JSON.stringify(question)); //Deep clone;
            question.index = index;
            openQuestionEditor(question, this.update);
        },
        remove: function(index) {
            //ToDo: ask for confirmation before deleting
            const setup = this.ctxPrm('setup');
            $.observable(setup.questions).remove(index);
            const $root = setup.$fragment.find('body');
            $root.find('question:nth-child('+(index+1)+')').remove();
            this.ctxPrm('content', $root.html());
        },

        update: function(question) {
            const setup = this.ctxPrm('setup');
            const questions = setup.questions;
            const isnew = question.index == -1;
            question.type = this.newtype;
            if (isnew) {
                question.index = questions.length;
                $.observable(questions).insert(question);
            }
            else {
                const existing = questions[question.index];
                $.observable(existing).setProperty(question);
                question.type = existing.type;
            }
            const $root = setup.$fragment.find('body');
            const el = questionToHtml(question);
            if (isnew) {
                $root.append(el);
            }
            else {
                $root.find('question:nth-child('+(question.index+1)+')')
                    .after(el)
                    .remove();
            }
            this.ctxPrm('content', $root.html());
        }
    };

    const answerlist = {
        template: '#cmpt-tepuy-basic-answerlist',
        bindFrom: [0, 'settings'],
        linkedCtxParam: ["answers", "settings"], //"canEdit"],
        init: function(tagCtx){
            const settings = tagCtx.props.settings||{};
            this.qtype = settings.qtype;
            this.askForCorrect = !/(multisetchoice|defineterm)/.test(this.qtype);
            this.askForTarget = this.qtype == 'complete';
            this.update = this.update.bind(this);
            this.targets = [];
        },
        displayElem: 'div',
        onBind: function(tagCtx) {
            const settings = this.ctxPrm('settings');
            const maxTarget = settings.maxTarget || 1;
            const me = this;
            if (this.askForTarget) {
                $.observe(settings, 'maxTarget', function(ev, data) {
                    if (data.value != data.oldValue) {
                        me.initTargets(data.value);
                    }
                });
            }
        },
        onUpdate: false,
        dataBoundOnly: true,
        //methods
        initTargets: function(maxTarget) {
            const targets = [];
            for(let i = 0; i < maxTarget; i++) {
                targets[i] = { value: i, label: ''+(i+1)};
            }
            $.observable(this.targets).refresh(targets);
        },
        add: function(ev) {
            const settings = this.ctxPrm('settings');
            const options = this.ctxPrm('answers');
            const option = {
                index: -1,
                text: ''
            };
            if (this.askForTarget) {
                option.target = 0;
                option.maxTarget = settings.maxTarget || 1;
            }

            if (this.askForCorrect) {
                option.isCorrect = false;
            }
            else {
                option.response = '';
            }

            openOptionEditor(option, this.update);
        },
        edit: function(index) {
            const options = this.ctxPrm('answers');
            let option = options[index];
            option = JSON.parse(JSON.stringify(option)); //Deep clone;
            option.index = index;
            openOptionEditor(option, this.update);
        },
        moveUp: function(index) {
            if (index == 0) return;
            const options = this.ctxPrm('answers');
            $.observable(options).move(index, index-1);
        },
        moveDown: function(index) {
            const options = this.ctxPrm('answers');
            if (index == (options.length-1)) return;
            $.observable(options).move(index, index+1);
        },
        remove: function(index) {
            //ToDo: Ask for confirmation
            const options = this.ctxPrm('answers');
            $.observable(options).remove(index);
        },
        correctChanged: function(index) {
            const settings = this.ctxPrm('settings');
            if (settings.qtype == 'multichoice') return; //
            const answers = this.ctxPrm('answers');
            const me = answers[index];
            const prevIndex = answers.findIndex((a) => a.target === me.target && a.isCorrect);
            if (prevIndex >= 0 && prevIndex != index) {
                const prev = answers[prevIndex];
                $.observable(prev).setProperty('isCorrect', false);
            }
        },
        update: function(option) {
            const options = this.ctxPrm('answers');
            if (option.index == -1) {
                option.index = options.length;
                $.observable(options).insert(option);
            }
            else {
                const existing = options[option.index];
                $.observable(existing).setProperty(option);
            }

            if (option.isCorrect) {
                this.correctChanged(option.index);
            }
        }
    };

    $.views.tags({
        tpyBasicQuestionaire: questionaire,
        tpyBasicAnswerList: answerlist
    });
})($)