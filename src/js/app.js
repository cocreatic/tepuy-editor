import i18next from 'i18next';
import Backend from 'i18next-xhr-backend';
import jqueryI18next from 'jquery-i18next';
import properties from './properties';
import { sortInsert } from './utils';
import { Dco } from './dco';
import { Auth } from './auth';
import { Storage } from './storage';

const defaultOptions = {
    container: "#tepuy-editor",
    defaultView: 'home' //home|editor
}

class App {

    constructor() {
        this.hooks = {};
        this.plugins = {};
    }

    registerHook(id, callback, priority = 999) {
        if (!this.hooks[id]) this.hooks[id] = [];
        sortInsert(this.hooks[id], { callback, priority }, (a, b) => a.priority - b.priority);
    }

    init(options) {
        //Parse options
        this.parseOptions(options);

        //Load active plugins
        for(let plugin of properties.plugins) {
            if (!plugin.active) continue;
            let [type, name] = plugin.id.split('.');
            let objectName = [type, name].map(p => p[0].toUpperCase() + p.substr(1)).join('');
            if (objectName in tepuyEditor) {
                this.plugins[plugin.id] = new tepuyEditor[objectName];
            }
            else {
                import(`../plugins/${plugin.id}/plugin.js`).then((pClass) => {
                    this.plugins[plugin.id] = new pClass(this); //pass a reference to the App
                });
            }
        }

        this.initLanguage().then(() => {
            this.resolveAuth();
            this.resolveStorage();
            this.resolveDcoManager();
            this.data = {
                theme: {}
            };
            this.invokeHook('gui_initialize');
            this.auth.authenticate().then(userInfo => {
                this.data.user = userInfo;
                this.ui.load(this.options.defaultView);
            });
        });
    }

    parseOptions(options) {
        this.options = Object.assign(defaultOptions, options);

        if (typeof(this.options.container) === 'string') {
            this.$container = $(this.options.container);
        }
        else {
            this.$container = this.options.container;
        }

        this.$container.data('app', this);
    }

    invokeHook(id, ...params) {
        if (!this.hooks[id]) return;

        var hooks = this.hooks[id];
        for(let hook of hooks) {
            hook.callback.apply(null, params);
        }
    }

    resolveAuth() {
        let auth = this.options.authentication || 'local';
        this.auth = new Auth(this.getPlugin('auth.'+auth));
    }

    resolveStorage() {
        let storage = this.options.storage || 'local';
        this.storage = new Storage(this.getPlugin('storage.'+storage));
    }

    resolveDcoManager() {
        this.dcoManager = Dco;
    }

    getPlugin(plugName, raiseError = true){
        if (raiseError && !this.plugins[plugName]) {
            throw new 'Unable to found plugin ' + plugName;
        }
        return this.plugins[plugName];
    }

    initLanguage() {
        return i18next
        .use(Backend)
        .init({
            lng: 'es',
            fallbackLng: 'es',
            ns: ['core'],
            defaultNS: 'core',
            backend: {
                loadPath: 'i18n/{{lng}}/{{ns}}.json'
            }
        }, (err, t) => {
            jqueryI18next.init(i18next, $);
            i18next.on('languageChanged', () => {
                $('body').localize();
            });
            this.i18n = i18next; //Give the App object access to the while translation system
        });
    }

    exit(){
        if (confirm('¿Esta seguro que desea salir?')) {
            window.location.href = 'https://cocreatic.org/';
        }
     }
}

const app = new App();
export { app as App};