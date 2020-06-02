const { babel } = require('@rollup/plugin-babel');
const resolve = require('@rollup/plugin-node-resolve').default;
const commonjs = require('@rollup/plugin-commonjs');
const eslint = require("gulp-eslint");
const multiEntry = require("rollup-plugin-multi-entry");
const path = require('path');
const fs = require('fs');

function getFiles(dir) {
    return fs.readdirSync(dir)
      .filter(function(file) {
        return fs.statSync(path.join(dir, file)).isFile() && path.extname(file).toLowerCase() === '.js';
      }).map(file => {
          return path.resolve(__dirname, path.join(dir, file));
      });
}

function rollupGlobal(file) {
    let name = path.basename(file); //Get base name
    name = name.substr(0, name.length - path.extname(file).length); //Get name without extension
    name = name === 'app' ? '' : '.' + name[0].toUpperCase() + name.substr(1); //Make it Capital case
    return { [file.substr(0, file.length-path.extname(file).length)]: 'tepuyEditor'+name };
}

function getPluginGlobals() {
    let pluginsGlobals = {};
    getFiles('./src/js').forEach(file => {
        if (/properties/.test(file)) return;
        Object.assign(pluginsGlobals, rollupGlobal(file))
    });
    return pluginsGlobals;
}

function rollupConfig(config) {
    const externals = ['jquery', 'moment', 'i18next', ...config.globals?Object.keys(config.globals):[]];
    const globals = {
        'moment': 'moment',
        'i18next': 'i18next',
        ...config.globals
    };

    return {
        //input: config.src,
        external: (id, from) => {
            if (externals.indexOf(id) >= 0) return true;
            if (/[\/\\]plugins[\/\\]/.test(from) && /^\./.test(id)) {
                const fullpath = path.resolve(path.dirname(from), id);
                return externals.indexOf(fullpath) >= 0;
            }
            if (/[\/\\]test[\/\\]/.test(from) && /^\./.test(id)) {
                const fullpath = path.resolve(path.dirname(from), id);
                return !/properties/.test(id) && externals.indexOf(fullpath) >= 0;
            }
            return false;
        },
        plugins: [
            //multiEntry(),
            resolve({
                mainFields: ['main', 'jsnext'],
                browser: true,
            }),
            commonjs({
                //namedExports: { 'chai': ['expect', 'assert', 'should']}
            }),
            eslint({
                exclude: [
                    'src/styles/**',
                    'src/scss/**'
                ]
            }),
            babel({
                exclude: 'node_modules/**',
                babelHelpers: 'bundled'
            }),
            //(process.env.NODE_ENV === 'production' && uglify())
        ],
        output: {
            format: 'iife',
            //name: config.className,
            globals: globals,
            sourcemap: 'inline'
        },
        onwarn: function ( message ) {
            if (/Circular dependency: node_modules\/chai\/lib\/chai\.js/.test(message)) return; //Ignore annoying chai circular dependency warnings
            console.error(message);
        }
    };
}

module.exports = function(config) {
    config.set({
        frameworks: ['mocha'],
        files: [
            { pattern: 'dist/vendor.min.js', watched: false },
            { pattern: 'dist/vendor.min.css', watched: false },
            { pattern: 'dist/tepuy-editor.js', watched: true, included: true, served: true },
            { pattern: 'dist/i18n/**/core.json', watched: true, included: false, served: true },
            { pattern: 'dist/plugins/**/plugin.js', watched: true, included: false, served: true },
            { pattern: 'dist/test.html', watched: true, included: true, served: true },
            /**
             * Make sure to disable Karma’s file watcher
             * because the preprocessor will use its own.
             */
            { pattern: 'test/**/*.spec.js', watched: false },
        ],
        proxies: {
            '/plugins/': 'http://localhost:3000/plugins/',
            'index.html': 'http://localhost:3000/index.html'
        },
        preprocessors: {
            'test/**/*.spec.js': ['rollup'],
        },

        rollupPreprocessor: rollupConfig({
            src: ['test/**/*.spec.js'], //./src/js/app.js
            //filename: 'tepuy-editor.js',
            //className: 'tepuyEditor',
            globals: getPluginGlobals()
        }),
        browsers: ['Chrome'],
        singleRun: false
    })
}