var gulp = require("gulp");
var eslint = require("gulp-eslint");
var rename = require("gulp-rename");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var sass = require('gulp-sass');
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var cssnano = require("cssnano");
var sourcemaps = require("gulp-sourcemaps");
var browserSync = require('browser-sync').create();
var reload      = browserSync.reload;

var destFolder = "./dist";

gulp.task("js", function () {
    return gulp.src([
            "./src/js/module.js",
            "./src/js/**/*.js"
        ])
        // ----------- linting --------------
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError()) // --> fails if errors
        // ----------- concat --------------
        .pipe(concat("tepuy-editor.js"))
        .pipe(gulp.dest(destFolder))
        // --> pipe more stuff here 
});

gulp.task('sass', function() {
    return gulp.src("./src/scss/*.scss")
        .pipe(sourcemaps.init())
        .pipe(sass({includePaths: ['scss']}))
        .on("error", sass.logError)
        .pipe(postcss([autoprefixer(), cssnano()]))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest("./src/css"))
        .pipe(gulp.dest(destFolder))
        .pipe(browserSync.stream());
});

gulp.task('compile', gulp.parallel('sass', 'js'));

// Static Server + watching scss/html files
gulp.task('serve', gulp.series('compile', function () {
    // Serve files from the root of this project
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });

    gulp.watch("./src/scss/*.scss", gulp.series('sass'));
    gulp.watch(["./src/js/*.js"], gulp.series('js'));
    gulp.watch("./src/*.html").on("change", reload);
}));

gulp.task('build-js', gulp.series('js', function () {
    return gulp.src("./dist/tepuy-editor.js")
        .pipe(uglify())
        .pipe(rename('tepuy-editor.min.js'))
        .pipe(gulp.dest(destFolder));
}));

gulp.task('build-css', gulp.series('sass', function () {
    return gulp.src("./src/css/*.css")
        .pipe(concat("tepuy-editor.css"))
        .pipe(gulp.dest(destFolder))
}));

gulp.task("build", gulp.parallel('build-js', 'build-css'));

gulp.task("default", gulp.series("serve"));