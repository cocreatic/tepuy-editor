const { babel } = require('@rollup/plugin-babel');
const resolve = require('@rollup/plugin-node-resolve').default;
const commonjs = require('@rollup/plugin-commonjs');
const eslint = require("gulp-eslint");
const multiEntry = require("rollup-plugin-multi-entry");
const path = require('path');

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
            name: config.className,
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
            { pattern: 'dist/plugins/**/plugin.js', watched: true, included: true, served: true },
            /**
             * Make sure to disable Karma’s file watcher
             * because the preprocessor will use its own.
             */
            { pattern: 'test/**/*.spec.js', watched: false },
        ],

        preprocessors: {
            'test/**/*.spec.js': ['rollup'],
        },

        rollupPreprocessor: rollupConfig({
            src: ['./src/js/app.js'], 
            filename: 'tepuy-editor.js',
            className: 'tepuyEditor'
        }),
        browsers: ['Chrome'],
        singleRun: false
    })
}