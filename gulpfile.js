var gulp = require('gulp');
var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var minifyify = require('minifyify');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');

var paths = {
	entry	: './js/Main.js',
	js		: ['js/**/*.js', 'js/**/*.jsx', "gulpfile.js"],
	hint	: ['assets/build/bundle.js', 'gulpfile.js'],
	build	: './assets/build/',
	bundleName : 'bundle.js',
	minName : 'bundle.min.js',
	mapName : 'bundle.min.map',
	sass	: 'assets/sass/*.scss',
	css		: './css'
};

function bundle( enableWatching ) {
	
	var bundler, performBundle;
	
	bundler = browserify(paths.entry, {
		//Source maps
		debug: true, 
		
		//watchify args
		cache: {},
		packageCache: {},
		fullPaths: true
	});
	
	if( enableWatching ) {
		bundler = watchify( bundler );
	}
	
	performBundle = function() {
		
		//gulp.start('jshint');
		
		var stream = bundler
			.bundle()
			.pipe( source( paths.bundleName ))
			.pipe( gulp.dest( paths.build ));
			
		gutil.beep();
		gutil.log('Bundle rebuilt');
	
		return stream;
	};

	bundler.on('update', performBundle);
	
	return performBundle();
	
}

gulp.task('default', ['watch']);

gulp.task('watch', function() {
	bundle( true );
});

gulp.task('watch-sass', function() {
	gulp.watch( paths.sass, ['sass'] );
});

gulp.task('sass', function() {
	
	gulp.src( paths.sass )
	    .pipe(sass())
	    .pipe(gulp.dest( paths.css ));
		
});

gulp.task('build', function() {
	gulp.start('bundle');
	gulp.start('minify');
});

gulp.task('bundle', function() {

	bundle();
	
});

gulp.task('minify', function() {

	gulp.src( paths.build + paths.bundleName )
	.pipe(sourcemaps.init({loadMaps: true}))
		.pipe( uglify() )
		.pipe( rename( paths.minName ) )
		.pipe( gulp.dest( paths.build ))
	.pipe( sourcemaps.write('.'))
	.pipe( gulp.dest( paths.build ));
		
});

gulp.task('jshint', function() {
	
	return gulp.src(paths.js)
	    .pipe( jshint('./.jshintrc') )
	    .pipe( jshint.reporter('jshint-stylish') );
		
});