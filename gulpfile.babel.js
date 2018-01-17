import babel from 'gulp-babel';
import config from './build.config';
import del from 'del';
import eslint from 'gulp-eslint';
import gulp from 'gulp';


gulp.task('transform', ['lint'], () => {
    return gulp
        .src(config.src.js)
        .pipe(babel())
        .pipe(gulp.dest('dist/js'));
});

gulp.task('transpile', ['clean', 'transform'], () => {

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

gulp.task('default', ['transpile']);