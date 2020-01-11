import babel from 'rollup-plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { eslint } from 'rollup-plugin-eslint';
import { uglify } from 'rollup-plugin-uglify';
import postcss from 'rollup-plugin-postcss';
import browsersync from 'rollup-plugin-browsersync';
import multiEntry from "rollup-plugin-multi-entry";

 // PostCSS plugins
import simplevars from 'postcss-simple-vars';
import nested from 'postcss-nested';
import cssnext from 'postcss-cssnext';
import cssnano from 'cssnano';

export default {
    input: ['./src/js/index.js', './src/js/plugins/**/component.js'], // entry point //./src/js/index.js //./src/js/plugins/**/component.js
    output: {
        file: './dist/tepuy-editor.js', // output bundle file
        format: 'umd',
        name: 'tepuyEditor'
    },
    plugins: [
        multiEntry(),
        resolve({
            mainFields: ['main', 'jsnext'],
            browser: true,
        }),
        postcss({
            plugins: [
                simplevars(),
                nested(),
                cssnext({ warnForDuplicates: false, }),
                cssnano()
            ],
            extensions: ['.css']
        }),
        commonjs(),
        eslint({
            exclude: [
                'src/styles/**',
                'src/scss/**'
            ]
        }),
        babel({
            exclude: 'node_modules/**'
        }),
        browsersync({
            server: '.',
            logLevel: "silent"
        }),
        (process.env.NODE_ENV === 'production' && uglify()),
    ]
}