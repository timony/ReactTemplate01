import babel from 'gulp-babel';
import babelify from 'babelify';
import browserify from 'browserify';
import connect from 'gulp-connect';
import config from './build.config';
import del from 'del';
import eslint from 'gulp-eslint';
import gulp from 'gulp';
import inject from 'gulp-inject';
import jest from 'jest';
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

gulp.task('js', () => {
  const options = {
    entries: config.src.app,   // Entry point
    extensions: ['.js', '.jsx'],            // consider files with these extensions as modules
    debug: true,  // add resource map at the end of the file or not
    paths: ['./src/']           // This allows relative imports in require, with './scripts/' as root
  };

  return browserify(options)
    .transform(babelify)
    .bundle()
    .pipe(source('app.js'))
    .pipe(gulp.dest('./dist/js'));
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
      'src/**/*.js',
      'src/**/*.jsx'
    ])
    .pipe(eslint())
    .pipe(eslint.format('node_modules/eslint-friendly-formatter'));
});

gulp.task('clean', () => {
  return del(['dist']);
});

gulp.task('test', done => {
  jest.runCLI(
    {coverage: true},
    [ __dirname ]
  )
    .then(({ results }) => {
      if (results.success) {
        done();
      } else {
        throw new Error('Tests failed!');
      }
    })
    .catch(done);
});

gulp.task('transpile', gulpSync.sync([
  'clean',
  ['lint', 'js'],
  'html:inject'
]));

gulp.task('start-server', gulpSync.sync([
  'transpile'
]), () => {
  const connectOptions = {
    port: 9000,
    root: './dist'
  };
  connect.server({
    port: connectOptions.port,
    root: connectOptions.root,
    livereload: true,
    debug: false
  });

  const openOptions = {
    uri: 'http://localhost:' + connectOptions.port
  };
  gulp.src('./dist/index.html')
    .pipe(open(openOptions));
});

gulp.task('js:watch', gulpSync.sync(['js']), () => {
  gulp.src('./dist')
    .pipe(connect.reload());
});
gulp.task('html:watch', gulpSync.sync(['html:inject']), () => {
  gulp.src('./dist')
    .pipe(connect.reload());
});
gulp.task('css:watch', gulpSync.sync(['html:inject']), () => {
  gulp.src('./dist')
    .pipe(connect.reload());
});

gulp.task('serve', ['start-server'], () => {
  gulp.watch('./src/**/*.js', ['js:watch']);
  gulp.watch('./src/**/*.jsx', ['js:watch']);
  gulp.watch('./src/index.html', ['html:watch']);
});

gulp.task('default', ['serve']);
