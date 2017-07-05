// ======================================== //
// INCLUDE PLUGINS
// ======================================== //
var gulp        = require("gulp");
var browserSync = require("browser-sync").create();

// COPY
var imagemin = require("gulp-imagemin");

// PUG
var pug = require("gulp-pug");

// SASS
var sass         = require("gulp-sass");
var postcss      = require("gulp-postcss");
var sourcemaps   = require("gulp-sourcemaps");
var autoprefixer = require("autoprefixer");
var concat       = require("gulp-concat");
var cleanCSS     = require("gulp-clean-css");

// JS
var source = require("vinyl-source-stream");
var browserify = require("browserify");

// T3 IMPORTER
var runSequence = require("run-sequence");
var gulpif = require("gulp-if");
var rename = require("gulp-rename");
var changeCase = require("change-case");
var gulpRemoveHtml = require("gulp-remove-html");
var insert = require("gulp-insert");
var filename = require("file-name");
var htmlbeautify = require("gulp-html-beautify");
var removeEmptyLines = require("gulp-remove-empty-lines");
var replace = require("gulp-replace");
var cssbeautify = require("gulp-cssbeautify");

// VARIABLES
var appDir         = "./app";
var distDir        = "./dist";
var nodeModulesDir = "./node_modules";
var t3Dir          = "./typo3-import";



// ======================================== //
// TASKS
// ======================================== //
// ===== DIST ===== //
gulp.task("dist", ["dist-copy", "dist-pug", "dist-sass", "dist-js"]);

// COPY
gulp.task("dist-copy", ["dist-copy-public-root", "dist-copy-images", "dist-copy-fonts"]);
gulp.task("dist-copy-public-root", function () {
    return gulp
        .src(appDir+"/public-root/**")
        .pipe(gulp.dest(distDir))
        .pipe(browserSync.stream());
});
gulp.task("dist-copy-images", function () {
    return gulp
        .src(appDir+"/images/**")
        .pipe(imagemin({
            interlaced: true,
            progressive: true,
            optimizationLevel: 5,
            svgoPlugins: [{removeViewBox: true}]
        }))
        .pipe(gulp.dest(distDir+"/img"))
        .pipe(browserSync.stream());
});
gulp.task("dist-copy-fonts", function () {
    return gulp
        .src(appDir+"/fonts/**")
        .pipe(gulp.dest(distDir+"/fonts"))
        .pipe(browserSync.stream());
});

// PUG
gulp.task("dist-pug", function () {
    return gulp
        .src(appDir+"/pug/layouts/*.pug")
        .pipe(pug({}))
        .pipe(gulp.dest(distDir))
        .pipe(browserSync.stream());
});

// SASS
gulp.task("dist-sass", function () {
    return gulp
        .src(appDir+"/scss/includes.scss")
        .pipe(sourcemaps.init())
        .pipe(sass().on("error", sass.logError))
        .pipe(postcss([ autoprefixer() ]))
        .pipe(concat("main.min.css"))
        .pipe(replace("../images/", "../img/"))
        .pipe(cleanCSS())
        .pipe(sourcemaps.write("./maps"))
        .pipe(gulp.dest(distDir+"/css"))
        .pipe(browserSync.stream());
});

// JAVASCRIPT
gulp.task("dist-js", function() {
    browserify({
        entries: appDir+"/js/includes.js",
        debug: true
    })
        .bundle()
        .pipe(source("main.min.js"))
        .pipe(gulp.dest(distDir+"/js/"))
        .pipe(browserSync.stream());
});



// ===== TYPO3 IMPORT ===== //
gulp.task("t3", ["t3-copy", "t3-pug", "t3-sass", "t3-js"]);

// COPY
gulp.task("t3-copy", ["t3-copy-images", "t3-copy-fonts"]);
gulp.task("t3-copy-images", function () {
    return gulp
        .src(appDir+"/images/**")
        .pipe(imagemin({
            interlaced: true,
            progressive: true,
            optimizationLevel: 5,
            svgoPlugins: [{removeViewBox: true}]
        }))
        .pipe(gulp.dest(t3Dir+"/Resources/Public/Images"))
});
gulp.task("t3-copy-fonts", function () {
    return gulp
        .src(appDir+"/fonts/**")
        .pipe(gulp.dest(t3Dir+"/Resources/Public/Fonts"))
});

// PUG
gulp.task("t3-pug", ["t3-pug-templates-layout", "t3-pug-partials"]);
gulp.task("t3-pug-templates-layout", function(callback) { // REMOVE PLUGIN IN GULP V.4, IT WILL BE INCLUDED CORE FUNCTION
    runSequence("t3-pug-templates","t3-pug-layout",callback);
});
gulp.task("t3-pug-templates", function () {
    return gulp
        .src(appDir+"/pug/templates/*.pug")
        .pipe(gulpif("index.pug", rename("startseite.pug")))
        .pipe(rename(function(path) {
            path.basename = changeCase.upperCaseFirst(path.basename);
        }))
        .pipe(pug({pretty: true}))
        .pipe(gulpRemoveHtml({keyword: "RemoveForTypo3Import"}))
        .pipe(insert.prepend('<f:section name="Main">'))
        .pipe(insert.append('</f:section>'))
        .pipe(insert.prepend(function(file) {
            return '<f:layout name="'+filename(file.path)+'" />';
        }))
        .pipe(htmlbeautify({indent_size: 4, indent_with_tabs: true}))
        .pipe(removeEmptyLines({removeComments: true}))
        .pipe(gulp.dest(t3Dir+"/Resources/Private/Templates"));
});
gulp.task("t3-pug-layout", function(){
    gulp.src(t3Dir+"/Resources/Private/Templates/*.html")
        .pipe(replace(/[^\n]+/g, ''))
        .pipe(insert.append('<f:render partial="Header" arguments="{_all}"/>'))
        .pipe(insert.append('<f:render section="Main" />'))
        .pipe(insert.append('<f:render partial="Footer" arguments="{_all}"/>'))
        .pipe(htmlbeautify({indent_size: 4, indent_with_tabs: true}))
        .pipe(removeEmptyLines({removeComments: true}))
        .pipe(gulp.dest(t3Dir+"/Resources/Private/Layouts"));
});
gulp.task("t3-pug-partials", function () {
    return gulp
        .src(appDir+"/pug/partials/*.pug")
        .pipe(rename(function(path) {
            path.basename = changeCase.upperCaseFirst(path.basename);
        }))
        .pipe(pug({pretty: true}))
        .pipe(htmlbeautify({indent_size: 4, indent_with_tabs: true}))
        .pipe(removeEmptyLines({removeComments: true}))
        .pipe(gulp.dest(t3Dir+"/Resources/Private/Partials"));
});

// SASS
gulp.task("t3-sass", function () {
    return gulp
        .src(appDir+"/scss/includes.scss")
        .pipe(sass().on("error", sass.logError))
        .pipe(postcss([ autoprefixer() ]))
        .pipe(cssbeautify({indent: "    ", autosemicolon: true}))
        .pipe(concat("main.css"))
        .pipe(replace("../fonts/", "../Fonts/"))
        .pipe(replace("../images/", "../Images/"))
        .pipe(replace("../img/", "../Images/"))
        .pipe(gulp.dest(t3Dir+"/Resources/Public/Css"));
});

// JAVASCRIPT
gulp.task("t3-js", function() {
    browserify({
        entries: appDir+"/js/includes.js",
        debug: true
    })
        .bundle()
        .pipe(source("main.min.js"))
        .pipe(gulp.dest(t3Dir+"/Resources/Public/JavaScript"))
});



// ===== BROWSER SYNC ===== //
gulp.task("browser-sync", function() {
    browserSync.init({
        server: {
            baseDir: distDir+"/"
        }
    });
});



// ======================================== //
// WATCH TASKS FOR CHANGES
// ======================================== //
gulp.task("watch", function () {
    gulp.watch(appDir+"/public-root/**", ["dist-copy-public-root"]);
    gulp.watch(appDir+"/images/**", ["dist-copy-images"]);
    gulp.watch(appDir+"/fonts/**", ["dist-copy-fonts"]);
    gulp.watch(appDir+"/pug/**", ["dist-pug"]);
    gulp.watch(appDir+"/scss/**", ["dist-sass"]);
    gulp.watch(appDir+"/js/**", ["dist-js"]);
});



// ======================================== //
// DEFAULT TASK
// ======================================== //
gulp.task("default", ["dist", "browser-sync", "watch"]);