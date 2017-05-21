// ======================================== //
// INCLUDE PLUGINS
// ======================================== //
var gulp        = require('gulp');
var browserSync = require('browser-sync').create();

// PUG
var pug = require('gulp-pug');

// SASS
var sass         = require('gulp-sass');
var postcss      = require('gulp-postcss');
var sourcemaps   = require('gulp-sourcemaps');
var autoprefixer = require('autoprefixer');
var concat       = require('gulp-concat');
var cleanCSS     = require('gulp-clean-css');


// JS
var browserify = require('browserify');

// VARIABLES
var appDir         = './app';
var distDir        = './dist';
var nodeModulesDir = './node_modules';
var t3Dir          = './typo3-import';



// ======================================== //
// TASKS
// ======================================== //
// ===== DIST ===== //
gulp.task('dist', ['dist-copy', 'dist-pug', 'dist-sass', 'dist-js']);

// COPY DIST
// gulp.task('dist-copy', function () {
// 	return gulp
// 		.src(buildDir+'/dist/**')
// 		.pipe(gulp.dest(outputDir))
// 		.pipe(browserSync.stream());
// });

// PUG
gulp.task('dist-pug', function () {
	return gulp
		.src(appDir+'/pug/layouts/*.pug')
		.pipe(pug({}))
		.pipe(gulp.dest(distDir))
		.pipe(browserSync.stream());
});

// SASS
gulp.task('dist-sass', function () {
	return gulp
		.src(appDir+'/scss/includes.scss')
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(postcss([ autoprefixer() ]))
		.pipe(concat('main.min.css'))
		.pipe(cleanCSS())
		.pipe(sourcemaps.write('./maps'))
		.pipe(gulp.dest(distDir+'/css'))
		.pipe(browserSync.stream());
});

// JAVASCRIPT
// gulp.task('dist-js', function () {
// 	return gulp
// 		.src(buildDir+'/js/*.js')
// 		.pipe(concat('main.min.js'))
// 		.pipe(uglify())
// 		.pipe(gulp.dest(outputDir+'/js'))
// 		.pipe(browserSync.stream());
// });
