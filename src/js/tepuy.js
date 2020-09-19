import { Page, Section } from './component';
import { b64DecodeUnicode, b64EncodeUnicode, privateMap, _ } from './utils';

const dependencies = {
    "jquery-ui.min.css": { type: 'style', src: "vendor/tepuy/components/jquery/css/custom/jquery-ui.min.css" },
    "ionicons.min.css": { type: 'style', src: "vendor/tepuy/components/ionicons/css/ionicons.min.css" },
    "jpit_quiz.css": { type: 'style', src: "vendor/tepuy/components/pit/css/jpit_quiz.css" },
    "jpit_mark.css": { type: 'style', src: "vendor/tepuy/components/pit/css/jpit_mark.css" },
    "jpit_wordpuzzle.css": { type: 'style', src: "vendor/tepuy/components/pit/css/jpit_wordpuzzle.css" },
    "jpit_crossword.css": { type: 'style', src: "vendor/tepuy/components/pit/css/jpit_crossword.css" },
    "jpit_zoom.css": { type: 'style', src: "vendor/tepuy/components/pit/css/jpit_zoom.css" },
    "circle.min.css": { type: 'style', src: "vendor/tepuy/components/csscircle/circle.min.css" },
    "scormplayer.css": { type: 'style', src: undefined }, //"vendor/tepuy/css/scormplayer.css" },
    "twentytwenty.css": { type: 'style', src: "vendor/tepuy/components/twentytwenty/css/twentytwenty.css", media: 'screen' },
    "mediaelementplayer.css": { type: 'style', src: "vendor/tepuy/components/mediaelementjs/mediaelementplayer.css" },
    "jquery.min.js": { type: 'script', src: "vendor/tepuy/components/jquery/jquery.min.js" },
    "jquery-ui.min.js": { type: 'script', src: "vendor/tepuy/components/jquery/jquery-ui.min.js" },
    "jquery.ui.touch-punch.min.js": { type: 'script', src: "vendor/tepuy/components/jquery-mobile/jquery.ui.touch-punch.min.js" },
    "jquery.event.move.js": { type: 'script', src: "vendor/tepuy/components/twentytwenty/js/jquery.event.move.js" },
    "jquery.twentytwenty.js": { type: 'script', src: "vendor/tepuy/components/twentytwenty/js/jquery.twentytwenty.js" },
    "mediaelement-and-player.min.js": { type: 'script', src: "vendor/tepuy/components/mediaelementjs/mediaelement-and-player.min.js" },
    "ivideo.js": { type: 'script', src: "vendor/tepuy/components/interactivevideo/ivideo.js" },
    "jquery.maphilight.min.js": { type: 'script', src: "vendor/tepuy/components/maphilight/jquery.maphilight.min.js" },
    "interact.min.js": { type: 'script', src: "vendor/tepuy/components/interact/interact.min.js" },
    "jpit_api.js": { type: 'script', src: "vendor/tepuy/components/pit/jpit_api.js" },
    "jpit_utilities.js": { type: 'script', src: "vendor/tepuy/components/pit/utilities/jpit_utilities.js" },
    "jpit_activity.js": { type: 'script', src: "vendor/tepuy/components/pit/activity/jpit_activity.js" },
    "jpit_resource.js": { type: 'script', src: "vendor/tepuy/components/pit/resources/jpit_resource.js" },
    "jpit_activity_quiz.js": { type: 'script', src: "vendor/tepuy/components/pit/activity/quiz/jpit_activity_quiz.js" },
    "jpit_activity_mark.js": { type: 'script', src: "vendor/tepuy/components/pit/activity/mark/jpit_activity_mark.js" },
    "jpit_activity_wordpuzzle.js": { type: 'script', src: "vendor/tepuy/components/pit/activity/wordpuzzle/jpit_activity_wordpuzzle.js" },
    "jpit_activity_droppable.js": { type: 'script', src: "vendor/tepuy/components/pit/activity/droppable/jpit_activity_droppable.js" },
    "jpit_activity_crossword.js": { type: 'script', src: "vendor/tepuy/components/pit/activity/crossword/jpit_activity_crossword.js" },
    "jpit_activity_cloze.js": { type: 'script', src: "vendor/tepuy/components/pit/activity/cloze/jpit_activity_cloze.js" },
    "jpit_activity_form.js": { type: 'script', src: "vendor/tepuy/components/pit/activity/form/jpit_activity_form.js" },
    "jpit_activity_sortable.js": { type: 'script', src: "vendor/tepuy/components/pit/activity/sortable/jpit_activity_sortable.js" },
    "jpit_activity_check.js": { type: 'script', src: "vendor/tepuy/components/pit/activity/check/jpit_activity_check.js" },
    "jpit_resource_movi.js": { type: 'script', src: "vendor/tepuy/components/pit/resources/movi/jpit_resource_movi.js" },
    "jpit_resource_zoom.js": { type: 'script', src: "vendor/tepuy/components/pit/resources/zoom/jpit_resource_zoom.js" },
    "app.js": { type: 'script', src: "vendor/tepuy/js/app.js" },
    "init.js": { type: 'script', src: "vendor/tepuy/js/init.js" },
    "lang.es.js": { type: 'script', src: "vendor/tepuy/js/lang.es.js" },
    "jquery.tepuy.js": { type: 'script', src: "vendor/tepuy/js/jquery.tepuy.js" },
    "lib.js": { type: 'script', src: "vendor/tepuy/js/lib.js" },
    "mobilelib.js": { type: 'script', src: "vendor/tepuy/js/mobilelib.js" },
    "stories.js": { type: 'script', src: "vendor/tepuy/js/stories.js" },
    "player.js": { type: 'script', src: "vendor/tepuy/components/scorm/player.js" },
}

export class Tepuy {

    constructor(manifest) {
        this.manifest = manifest;
        privateMap.set(this, {
            sectionids: [],
            nextsectionid: 0,
            nextpageid: 0,
            allcomponents: { index: {}, content: {}}
        });
    }

    getIndex({editMode, baseUrl}) {
        const doc = this.indexDoc;
        if (!doc) return this.manifest.index;
        const $doc = $(doc);
        const $head = $doc.find('head');
        const $body = $doc.find('body');
        const local = [window.location.protocol, '//', window.location.host, window.location.pathname].join('');
        const prod = editMode == undefined;
        //Register dependency

        $body.data(this.home.config);
        $body.data('autoload', !editMode && this.home.config.autoload); //Make sure autoload is false when in editMode
        const $main = $body.find('main').first();
        this.home.root.html(editMode === true);
        $main.empty().html(this.home.root.host.innerHTML);

        //Dependecies
        if (!prod) {
            const srcs = {};
            $head.children('link[type="text/css"],script').each((i, it) => {
                const src = it.src || it.href;
                const id = src.split('/').pop();
                srcs[id] = {src: src.replace(local, ''), rel: it.rel, type: it.type };
            }).remove();

            $.each(dependencies, function(i, it) {
                if (it.type == 'style') {
                    const media = it.media ? ' media="' + it.media + '"' : '';
                    const source = it.src == undefined ? srcs[i].src : local + it.src;
                    $head.append(['<link href="', source, '" rel="stylesheet" type="text/css"', media, '/>'].join(''));
                }
                else {
                    $head.append(['<script type="text/javascript" src="', local, it.src, '"></script>'].join(''));
                }
            });
        }
        /*$head.children().each((i, it) => {
            const path = it.src || it.href;
            if (!path) return true; //just ignore it
            const key = path.split('/').pop();
            const dep = dependencies[key];
            if (!dep) return true; //just ignore it
            const src = (editMode ? local : '') + dep.src;
            if (it.href) {
                it.href = src;
                if (dep.media) it.media = dep.media;
            }
            else if (it.src) {
                it.src = src;
            }
        });*/

        const $base = $head.find('base');
        if (prod) {
            if ($base.length) $base.remove();
            return b64EncodeUnicode(doc.documentElement.outerHTML);
        }


        if (!$base.length && baseUrl) {
            baseUrl = baseUrl.replace(/^http[s]*:/, window.location.protocol);
            $doc.find('head').prepend('<base href="' + baseUrl + '" />');
        }
        //$doc.find('head').children('script[src*="scorm"]').remove(); //ToDo: Need to indentify adding/removing only required scripts
        return doc.documentElement.outerHTML;
    }

    getContentHead() {
        const doc = this.contentDoc;
        if (!doc) return '';

        //const $base = $doc.find('head').html();
        return $(doc).find('head');
    }

    getContentBody() {
        const doc = this.contentDoc;
        if (!doc) return '';

        return $(doc).find('body');
    }

    getContent({editMode, baseUrl}) {
        const doc = this.contentDoc;
        if (!doc) return this.manifest.content;
        const $doc = $(doc);
        const $head = $doc.find('head');
        const $body = $doc.find('body');
        const local = [window.location.protocol, '//', window.location.host, window.location.pathname].join('');
        const prod = editMode == undefined;
        $body.data(this.content.config);
        const $main = $body.find('main').first();
        $main.empty();

        for(let i = 0; i < this.content.pages.length; i++) {
            $main.append(this.content.pages[i].html(editMode === true));
        }

        //Dependecies
        if (!prod) {
            $head.children('link[type="text/css"],script').remove();
            $.each(dependencies, function(i, it) {
                if (it.type == 'style') {
                    const media = it.media ? ' media="' + it.media + '"' : '';
                    $head.append(['<link href="', local, it.src, '" rel="stylesheet" type="text/css"', media, '/>'].join(''));
                }
                else {
                    $head.append(['<script type="text/javascript" src="', local, it.src, '"></script>'].join(''));
                }
            });
        }
        const $base = $head.find('base');
        if (prod) {
            if ($base.length) $base.remove();
            return b64EncodeUnicode(doc.documentElement.outerHTML);
        }
        $body.attr('data-model', 'page');
        //$body.data('model', 'page'); //To prevent the dialog when loading content;
        if (!$base.length && baseUrl) {
            baseUrl = baseUrl.replace(/^http[s]*:/, window.location.protocol);
            $head.prepend('<base href="' + baseUrl + '" />');
        }
        $head.children('script[src*="scorm"]').remove(); //ToDo: Need to indentify adding/removing only required scripts
        return doc.documentElement.outerHTML;
    }

    getComponent(id, container) {
        const allcomponents = _(this).allcomponents;
        return allcomponents[container][id];
    }

    nextSectionId() {
        const pthis = _(this);
        while(true) {
            pthis.nextsectionid++;
            let id = 'section_'+pthis.nextsectionid;
            if (pthis.sectionids.indexOf(id) < 0) return id;
        }
    }

    nextPageId() {
        const pthis = _(this);
        while(true) {
            pthis.nextpageid++;
            let id = 'page_'+pthis.nextpageid;
            if (this.content.pages.findIndex(p => p.id === id) < 0) return id;
        }
    }

    parse() {
        return new Promise((resolve, reject) => {
            this.traverseIndex();
            this.traverseContent();
            resolve(true);
        });
    }

    traverseIndex() {
        const html = b64DecodeUnicode(this.manifest.index);
        const parser = new DOMParser();
        this.indexDoc = parser.parseFromString(html, 'text/html');
        const $body = $(this.indexDoc).find('body');
        const bodyData = $body.data();
        const root = new Section($body.find('main')[0]);
        this.registerAllComponents(root, 'index');
        this.home = {
            config: {...bodyData},
            root: root
        };
    }

    traverseContent() {
        const html = b64DecodeUnicode(this.manifest.content);
        //console.log(html);
        const parser = new DOMParser();
        this.contentDoc = parser.parseFromString(html, 'text/html');
        const $body = $(this.contentDoc).find('body');
        const bodyData = $body.data();
        const pages = [];
        const $main = $body.find('main');

        const pthis = _(this);
        //Traverse main element looking for pages and sections
        $main.children('section').each((i, page) => {
            const oPage = new Page(page);
            oPage.parser = this;
            pages.push(oPage);
            for(let i = 0; i < oPage.sections.length; i++) {
                const section = oPage.sections[i];
                pthis.nextsectionid++;
                pthis.sectionids.push(section.id);
                this.registerAllComponents(section, 'content');
            }
            pthis.nextpageid++;
        });

        //Traverse tepuy:independent-sections comment section looking for independent sections
        const bodyEl = $body.get(0);
        const length = $body.get(0).childNodes.length;
        const floating = [];
        for(let i = 0; i < length; i++) {
            const node = bodyEl.childNodes[i];
            if (node.nodeType == Node.COMMENT_NODE) {
                if (!this.independentSectionsStart && /^\s*tepuy:independent-sections\s*$/i.test(node.textContent)) {
                    this.independentSectionsStart = node;
                }
                else if (this.independentSectionsStart && /^\s*endtepuy\s*$/i.test(node.textContent)) {
                    this.independentSectionsEnd = node;
                }
            }
            if (this.independentSectionsStart && !this.independentSectionsEnd && node.nodeType == Node.ELEMENT_NODE) {
                const oSection = new Section(node, { title: node.id });
                floating.push(oSection);
            }
        }

        this.content = {
            config: {...bodyData},
            pages,
            floating
        };
    }

    registerComponent(component, container) {
        component.parser = this;
        component.container = container;
        _(this).allcomponents[container][component.id] = component;
    }

    updateComponentRegistration(container, id, newid) {
        if (id === newid) return;
        _(this).allcomponents[container][newid] = _(this).allcomponents[container][id];
        delete _(this).allcomponents[container][id];
    }

    unregisterComponent(component) {
        delete _(this).allcomponents[component.container][component.id];
    }

    registerAllComponents(component, container) {
        this.registerComponent(component, container);
        if (!component.children) return;
        for(let i = 0; i < component.children.length; i++) {
            const child = component.children[i];
            this.registerAllComponents(child, container);
        }
    }
}
