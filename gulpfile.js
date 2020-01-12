const gulp = require("gulp");
const eslint = require("gulp-eslint");
const rename = require("gulp-rename");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const sass = require('gulp-sass');
const concatcss = require('gulp-concat-css');
const postcss = require("gulp-postcss");
const file = require('gulp-file');
const inject = require('gulp-inject');
const htmlmin = require('gulp-htmlmin');
const sourcemaps = require("gulp-sourcemaps");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const browserSync = require('browser-sync').create();
const reload      = browserSync.reload;
const { rollup }  = require('rollup');
const babel = require('rollup-plugin-babel');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const multiEntry = require("rollup-plugin-multi-entry");

const destFolder = "./dist";

gulp.task("js", function () {
    return rollup({
        input: ['./src/js/index.js', './src/plugins/**/component.js'], // entry point //./src/js/index.js //./src/js/plugins/**/component.js
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
            format: 'umd',
            name: 'tepuyEditor'
        })
    })
    .then(gen => {
        return file('tepuy-editor.js', gen.output[0].code, {src: true})
            .pipe(gulp.dest(destFolder))
            .pipe(browserSync.stream());
    });
});

gulp.task('sass', function() {
    return gulp.src(["./src/scss/*.scss", "./src/plugins/**/*.scss"])
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
        .pipe(inject(gulp.src(['./src/plugins/**/template.html'])
            .pipe(htmlmin({ collapseWhitespace: true })), {
            starttag: '<!-- inject:template:{{ext}} -->',
            transform: (filePath, file) => {
                let id = filePath.split(/[\/\\]/).splice(-2, 1)[0].replace('.', '-');
                return ['<script id="', id, '" type="text/template">', file.contents.toString('utf8'), '</script>'].join('');
            }
        }))
        .pipe(gulp.dest(destFolder))
        .pipe(browserSync.stream());
});

gulp.task('compile', gulp.parallel('html', 'sass', 'js'));

// Static Server + watching scss/html files
gulp.task('serve', gulp.series('compile', function () {
    // Serve files from the root of this project
    browserSync.init({
        server: {
            baseDir: "./dist"
        }
    });

    gulp.watch(["./src/scss/*.scss", "./src/plugins/**/*.scss"], gulp.series('sass'));
    gulp.watch(["./src/js/*.js", "./src/plugins/**/*.js"], gulp.series('js'));
    gulp.watch(["./index.html", "./src/plugins/**/*.html"], gulp.series('html'));
}));

gulp.task('build-js', gulp.series('js', function () {
    return gulp.src("./dist/tepuy-editor.js")
        .pipe(uglify())
        .pipe(rename('tepuy-editor.min.js'))
        .pipe(gulp.dest(destFolder));
}));

gulp.task('build-css', gulp.series('sass', function () {
    return gulp.src("./src/css/*.css")
        .pipe(concat("tepuy-editor.min.css"))
        .pipe(postcss([cssnano()]))
        .pipe(gulp.dest(destFolder))
}));

gulp.task("build", gulp.parallel('html', 'build-js', 'build-css'));

gulp.task("default", gulp.series("serve"));