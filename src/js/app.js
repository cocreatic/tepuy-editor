import properties from './properties';
import { sortInsert } from './utils';
import { Api } from './api';

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
            var objectName = plugin.id.split('.').map(p => p[0].toUpperCase() + p.substr(1)).join('');
            if (objectName in tepuyEditor) {
                this.plugins[plugin.id] = new tepuyEditor[objectName];
            }
            else {
                import(`../plugins/${plugin.id}/component.js`).then(function (pClass) {
                    this.plugins[plugin.id] = new pClass();
                })
            }
        }

        this.api = new Api(options.api);
        this.invokeHook('gui_initialize');
        this.ui.load('home');
    }

    parseOptions(options) {
        var options = Object.assign({
            container: "#tepuy-editor"
        }, options);

        if (typeof(options.container) === 'string') {
            this.container = document.querySelector(options.container);
        }
        else {
            this.container = options.container;
        }
    }

    invokeHook(id, params = null) {
        if (!this.hooks[id]) return;

        var hooks = this.hooks[id];
        for(let hook of hooks) {
            hook.callback.apply(null, params);
        }
    }
}

const app = new App();
export { app as App};