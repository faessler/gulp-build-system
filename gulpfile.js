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
var source = require('vinyl-source-stream');
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
gulp.task('dist-copy', function () {
	return gulp
		.src(appDir+'/public-root/**')
		.pipe(gulp.dest(distDir))
		.pipe(browserSync.stream());
});

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
gulp.task('dist-js', function() {
	browserify({
		entries: appDir+'/js/includes.js',
		debug: true
	})
	.bundle()
	.pipe(source('main.min.js'))
	.pipe(gulp.dest(distDir+'/js/'))
	.pipe(browserSync.stream());
});


// ===== BROWSER SYNC ===== //
gulp.task('browser-sync', function() {
	browserSync.init({
		server: {
			baseDir: distDir+'/'
		}
	});
});



// ======================================== //
// WATCH TASKS FOR CHANGES
// ======================================== //
gulp.task('watch', function () {
	gulp.watch(appDir+'/public-root/**', ['dist-copy']);
	gulp.watch(appDir+'/pug/**', ['dist-pug']);
	gulp.watch(appDir+'/scss/**', ['dist-sass']);
	gulp.watch(appDir+'/js/**', ['dist-js']);
});



// ======================================== //
// DEFAULT TASK
// ======================================== //
gulp.task('default', ['dist', 'browser-sync', 'watch']);
