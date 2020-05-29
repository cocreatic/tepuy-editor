const gulp = require("gulp");
const eslint = require("gulp-eslint");
const rename = require("gulp-rename");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const sass = require('gulp-sass');
const concatcss = require('gulp-concat-css');
const postcss = require("gulp-postcss");
const file = require('gulp-file');
const path = require('path');
const inject = require('gulp-inject');
const sourcemaps = require("gulp-sourcemaps");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const browserSync = require('browser-sync').create();
const reload      = browserSync.reload;
const { rollup }  = require('rollup');
const { minify } = require('html-minifier');
const babel = require('rollup-plugin-babel');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const multiEntry = require("rollup-plugin-multi-entry");
const i18nScanner = require('i18next-scanner');
const fs = require('fs');

const destFolder = "./dist";

const vendorjs = [
    'node_modules/moment/min/moment-with-locales.min.js',
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/jquery-ui-dist/jquery-ui.min.js',
    'node_modules/jsviews/jsviews.min.js',
    'vendor/js/jsviews-jqueryui-widgets.min.js',
    'node_modules/i18next/i18next.min.js',
    'vendor/js/jstree.js'
];

const vendorcss = [
    //'node_modules/jquery-ui-dist/jquery-ui.min.css',
    //'node_modules/jquery-ui-dist/jquery-ui.theme.min.css',
    //'node_modules/@fortawesome/fontawesome-free/css/solid.min.css',
    './vendor/css/**/*.css'
];

function getFolders(dir) {
    return fs.readdirSync(dir)
      .filter(function(file) {
        return fs.statSync(path.join(dir, file)).isDirectory();
      });
}

function getFiles(dir) {
    return fs.readdirSync(dir)
      .filter(function(file) {
        return fs.statSync(path.join(dir, file)).isFile() && path.extname(file).toLowerCase() === '.js';
      }).map(file => {
          return path.resolve(__dirname, path.join(dir, file));
      });
}

function joinVendorCss() {
    return gulp.src(vendorcss)
        .pipe(concatcss("vendor.min.css", { rebaseUrls: false }))
        .pipe(gulp.dest(destFolder))
}

function copyVendorAssets(done) {
    const jqueryui = () => gulp.src(['node_modules/jquery-ui-dist/images/*'])
        .pipe(gulp.dest(destFolder + '/vendor/assets/jquery-ui/images'));

    const jstree = () => gulp.src(['./vendor/assets/**/*'])
        .pipe(gulp.dest(destFolder + '/vendor/assets/'));

    return gulp.parallel(jqueryui, jstree, (subdone) => {
        subdone();
        done();
    })();
}

function copyThemesAssets() {
    return gulp.src(['./src/assets/themes/**/*'])
        .pipe(gulp.dest(destFolder + '/themes'));
}

function copyIcons() {
    return gulp.src('node_modules/@fortawesome/fontawesome-free/webfonts/*')
        .pipe(gulp.dest(destFolder+'/webfonts/'));
}

//Required to be able to scan i18next keys on text/x-template files
function customTransform(file, enc, done) {
    if (/\.(?:html|htm)/.test(path.extname(file.path))) {
        var content = file.contents.toString('utf-8');
        var re = /^<script.*type="text\/(?:x-template|x-jsrender)".*>$/im;
        var match;
        while(match = re.exec(content)) {
            content = content.replace(re, '').replace(/^<\/script>$/im, '');
        }

        this.parser.parseAttrFromString(content, {
            transformOptions: { filepath: file.path }
        });

        this.parser.parseFuncFromString(content, {
            transformOptions: { filepath: file.path }
        });
    }
    done();
}

function translations() {
    return gulp.src(["./src/**/*.{js,html}"]) //'./src/**.{js,html}'
        .pipe(i18nScanner({
            lngs: ['es', 'en'], // supported languages
            trans: false,
            defaultLng: 'es',
            defaultNs: 'core',
            ns: ['core'],
            func: {
                list: ['i18next.t', 'i18n.t', 'translate'],
                extensions: ['.js', '.jsx']
            },
            //removeUnusedKeys: false,
            resource: {
                loadPath: './src/i18n/{{lng}}/{{ns}}.json',
                savePath: 'i18n/{{lng}}/{{ns}}.json'
            }
        }, customTransform))
        .pipe(gulp.dest('./src'))
        .pipe(gulp.dest(destFolder));
}

gulp.task("vendorjs", function() {
    return gulp.src(vendorjs)
        .pipe(concat("vendor.min.js"))
        .pipe(gulp.dest(destFolder))
});

gulp.task("vendorassets", copyVendorAssets);

gulp.task("vendorcss", gulp.parallel(joinVendorCss, 'vendorassets', copyIcons));

function rollupBuildTask(config) {
    const isPluginPath = (path) => {

    }
    return () => {
        const externals = ['jquery', 'moment', 'i18next', ...config.globals?Object.keys(config.globals):[]];
        const globals = {
            'moment': 'moment',
            'i18next': 'i18next',
            ...config.globals
        };

        return rollup({
            input: config.src,
            external: (id, from) => {
                if (externals.indexOf(id) >= 0) return true;
                if (/[\/\\]plugins[\/\\]/.test(from) && /^\./.test(id)) {
                    const fullpath = path.resolve(path.dirname(from), id);
                    return externals.indexOf(fullpath) >= 0;
                }
                return false;
            },
            plugins: [
                multiEntry(),
                resolve({
                    mainFields: ['main', 'jsnext'],
                    browser: true,
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
                //(process.env.NODE_ENV === 'production' && uglify())
            ]
        })
        .then(bundle => {
            return bundle.generate({
                format: config.format || 'iife',
                name: config.className,
                globals: globals
            })
        })
        .then(gen => {
            return file(config.filename, gen.output[0].code, {src: true})
                .pipe(gulp.dest(config.dest));
        });
    };
}

function browserReload(done) {
    browserSync.reload();
    done();
}

function pluginClassName(folder) {
    return folder.split('.').map(segment => segment[0].toUpperCase()+segment.substr(1)).join('');
}

function rollupMain() {
    return rollupBuildTask({
        src: ['./src/js/app.js'], 
        dest: destFolder,
        filename: 'tepuy-editor.js',
        className: 'tepuyEditor'
    });
}

function rollupPlugin(folder, globals) {
    console.log('Building plugin ' + folder);
    return rollupBuildTask({
        src: path.join('./src/plugins', folder, '/plugin.js'),
        dest: path.join(destFolder, 'plugins', folder),
        filename: 'plugin.js',
        className: pluginClassName(folder),
        globals: globals,
        format: 'iife'
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
    getFiles('./src/js').forEach(file => Object.assign(pluginsGlobals, rollupGlobal(file)));
    return pluginsGlobals;
}

gulp.task("js", function (done) {
    const pluginsGlobals = getPluginGlobals();
    const main = rollupMain();
    const plugins = getFolders('./src/plugins').map((folder) => {
        return rollupPlugin(folder, pluginsGlobals);
    });

    return gulp.series(main, gulp.parallel(...plugins), (seriesDone) => {
        seriesDone();
        done();
    })();// gulp.series(main);
});

gulp.task('sass', function() {
    return gulp.src(["./src/scss/**/*.scss", "./src/plugins/**/*.scss"])
        .pipe(sourcemaps.init())
        .pipe(sass({includePaths: ['scss']}))
        .on("error", sass.logError)
        .pipe(concatcss('tepuy-editor.css'))
        .pipe(postcss([autoprefixer()]))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest("./src/css"))
        .pipe(gulp.dest(destFolder))
        .pipe(browserSync.stream());
});

gulp.task('html', function () {
    return gulp.src('./index.html')
        .pipe(inject(gulp.src(['./src/plugins/**/*.html']), {
            starttag: '<!-- inject:template:{{ext}} -->',
            transform: (filePath, file) => {
                return minify(file.contents.toString('utf8'), { 
                    collapseWhitespace: true,
                    processScripts: ['text/html', 'text/x-template', 'text/x-jsrender']
                });
            }
        }))
        .pipe(gulp.dest(destFolder))
        .pipe(browserSync.stream());
});

gulp.task('compile', gulp.parallel('html', 'sass', 'vendorcss', 'vendorjs', 'js', copyThemesAssets, translations));

// Static Server + watching scss/html files
gulp.task('serve', gulp.series('compile', function () {
    // Serve files from the root of this project
    browserSync.init({
        server: {
            baseDir: "./dist"
        }
    });

    gulp.watch(["./src/scss/**/*.scss", "./src/plugins/**/*.scss"], gulp.series('sass'));
    gulp.watch(["./src/js/*.js"], gulp.series(rollupMain(), translations, browserReload));
    gulp.watch(["./src/plugins/**/*.js"]).on("change", (file) => {
        const fullpath = path.resolve(file);
        const plugins = path.resolve('./src/plugins');
        const folder = fullpath.substring(plugins.length+1).split(path.sep)[0];
        const pluginsGlobals = getPluginGlobals();
        return gulp.series(rollupPlugin(folder, pluginsGlobals), translations, browserReload)();
    });
    gulp.watch(["./index.html", "./src/plugins/**/*.html"], gulp.parallel('html', translations));
}));

gulp.task('build-js', function () {
    return gulp.src("./dist/tepuy-editor.js")
        .pipe(uglify())
        .pipe(rename('tepuy-editor.min.js'))
        .pipe(gulp.dest(destFolder));
});

gulp.task('build-css', function () {
    return gulp.src("./src/css/*.css")
        .pipe(concat("tepuy-editor.min.css"))
        .pipe(postcss([cssnano()]))
        .pipe(gulp.dest(destFolder))
});

gulp.task("build", gulp.series('compile', 'build-js', 'build-css'));

gulp.task("default", gulp.series("serve"));