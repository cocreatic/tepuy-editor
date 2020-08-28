import i18next from 'i18next';
import Backend from 'i18next-http-backend';
import jqueryI18next from 'jquery-i18next';
import properties from './properties';
import { sortInsert } from './utils';
import { Dco } from './dco';
import { Auth } from './auth';
import { Storage } from './storage';
import { loadFile } from './utils';
import { Component } from './component';

const defaultOptions = {
    container: "#tepuy-editor",
    defaultView: 'home', //home|editor
    theme: 'light'
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
        return loadFile((options.basePath||'') + 'properties.json', 'json').then(props => {
            this.properties = props || properties;
            return this.doInit(options);
        });
    }

    doInit(options) {
        //Parse options
        this.parseOptions(options);

        const pluginPromises = [];
        //Load active plugins
        for(let plugin of this.properties.plugins) {
            if (!plugin.active) continue;
            const [type, name] = plugin.id.split('.');
            const objectName = [type, name].map(p => p[0].toUpperCase() + p.substr(1)).join('');
            if (window.tepuyEditor && objectName in window.tepuyEditor) {
                this.registerPlugin(tepuyEditor, objectName, type, name);
            }
            else {
                pluginPromises.push(loadFile(`${(options.basePath||'')}plugins/${plugin.id}/plugin.js`, 'js').then(loaded => {
                    if (loaded) {
                        const ns = window[objectName];
                        this.registerPlugin(ns, objectName, type, name);
                    }
                    return loaded;
                }));
            }
        }

        return Promise.all(pluginPromises).then(() => {
            return this.initLanguage().then(() => {
                this.resolveAuth();
                this.resolveStorage();
                this.resolveDcoManager();
                this.data = {
                    theme: {}
                };
                this.invokeHook('gui_initialize');
                return this.auth.authenticate().then(userInfo => {
                    this.data.user = userInfo;
                    this.ui.load(this.options.defaultView);
                    return true;
                }, err => {
                    console.log('Authenticate failed');
                });
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
        this.DcoManager = Dco;
    }

    registerPlugin(ns, typeName, type, name) {
        const instance = new ns[typeName];
        instance.type = type;
        instance.name = name;
        if (type == 'cmpt') {
            instance.registerComponents(Component.registerComponent);
        }
        this.plugins[[type, name].join('.')] = instance;
    }

    getPlugin(plugName, raiseError = true){
        if (raiseError && !this.plugins[plugName]) {
            throw 'Unable to find plugin ' + plugName;
        }
        return this.plugins[plugName];
    }

    getPlugins(type) {
        return this.plugins.filter(p => p.type == type);
    }

    initLanguage() {
        return i18next
        .use(Backend)
        .init({
            lng: 'es',
            fallbackLng: 'es',
            ns: ['core', ...Object.keys(this.plugins)],
            defaultNS: 'core',
            backend: {
                loadPath: (lngs, namespaces) => {
                    return (this.basePath || '') + namespaces.indexOf('core') >= 0 ? 'i18n/{{lng}}/{{ns}}.json' : 'plugins/{{ns}}/i18n/{{lng}}.json';
                }
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
export * as Utils from './utils';
export * as Component from './component';
export * as Tepuy from './tepuy';
