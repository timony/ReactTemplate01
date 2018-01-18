import babel from 'gulp-babel';
import babelify from 'babelify';
import browserify from 'browserify';
import connect from 'gulp-connect';
import config from './build.config';
import del from 'del';
import eslint from 'gulp-eslint';
import gulp from 'gulp';
import inject from 'gulp-inject';
import open from 'gulp-open';
import order from 'gulp-order';
import path from 'path';
import source from 'vinyl-source-stream';

const gulpSync = require('gulp-sync')(gulp);

// obsolete
gulp.task('transform', ['lint'], () => {
    return gulp
        .src(config.src.js)
        .pipe(babel())
        .pipe(gulp.dest('dist/js'));
});

gulp.task('build-react', () => {
    const options = {
        entries: config.src.app,   // Entry point
        extensions: ['.js', '.jsx'],            // consider files with these extensions as modules
        debug: true,  // add resource map at the end of the file or not
        paths: ["./src/"]           // This allows relative imports in require, with './scripts/' as root
    };

    return browserify(options)
        .transform(babelify)
        .bundle()
        .pipe(source("app.js"))
        .pipe(gulp.dest("./dist/js"));
});

gulp.task('html:inject', () => {
    const target = gulp.src(config.src.html);
    const sources = gulp.src([
            config.dest.css + '/*.css',
            config.dest.jsFolder + '/*.js'
        ],
        {read: false}
    );

    const ordering = config.vendor.js.map(filePattern => path.basename(filePattern));
    ordering.unshift('*.css');

    const orderedSources = sources.pipe(order(ordering));

    return target
        .pipe(inject(orderedSources, {
            ignorePath: config.dest.rootFolder,
            addRootSlash: false
        }))
        .pipe(gulp.dest(config.dest.rootFolder));
});

gulp.task('lint', () => {
    return gulp
        .src([
            'gulpfile.babel.js',
            'src/**/*.js'
        ])
        .pipe(eslint())
        .pipe(eslint.format());
});

gulp.task('clean', () => {
    return del(['dist']);
});

gulp.task('transpile', gulpSync.sync([
    'clean',
    ['lint', 'build-react'],
    'html:inject'
]));

gulp.task('start-server', gulpSync.sync([
    'transpile'
]));

gulp.task('serve', ['start-server'], () => {
    const connectOptions = {
        port: 9000,
        root: './dist'
    };
    connect.server({
        port: 9000,
        root: './dist',
        livereload: true
    });

    const openOptions = {
        uri: 'http://localhost:' + connectOptions.port
    };
    gulp.src('./dist/index.html')
        .pipe(open(openOptions));
});

gulp.task('default', ['serve']);