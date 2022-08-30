import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import sourcemap from 'gulp-sourcemaps';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import browser from 'browser-sync';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgmin';
import svgsprite from 'gulp-svgstore';
import cleaner from 'del';

// Styles

export const styles = () => {
  return gulp.src('source/less/style.less', { sourcemaps: true })
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(sourcemap.write("."))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

// HTML

const html = () => {
  return gulp.src('source/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('build'));
}


// Script
const script = () => {
  return gulp.src('source/js/*.js')
    .pipe(terser())
    .pipe(gulp.dest('build/js'));
}

// Images

const optimizeImages = () => {
  return gulp.src('source/img/**/*.{png,jpg}')
    .pipe(squoosh())
    .pipe(gulp.dest('build/img'));
}


const copyImages = () => {
  return gulp.src('source/img/**/*.{png,jpg}')
    .pipe(gulp.dest('build/img'));
}

// WebP

const createWebp = () => {
  return gulp.src('source/img/**/*.{png,jpg}')
    .pipe(squoosh({
      webp: {}
    }))
    .pipe(gulp.dest('build/img'));
}

//SVG

const svg = () => {
  return gulp.src(['source/img/**/*.svg', '!source/img/favicon/*.svg'])
    .pipe(svgo())
    .pipe(gulp.dest('build/img'));
}

const svgstore = () => {
  return gulp.src('source/img/**/*.svg')
    .pipe(svgo())
    .pipe(svgsprite({
      inLineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'));
}

// Copy

const copyDocs = () => {
  return gulp.src(['source/fonts/*.{woff2,woff}',
    'source/*.ico',
    'source/manifest.webmanifest',],
    { base: 'source' })
    .pipe(gulp.dest('build'))
}

// Delete

const clean = () => {
  return cleaner('build');
};

// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

//Reload

export const reloadBrowser = (done) => {
  browser.reload();
  done();
}


// Watcher

export const watcher = () => {
  gulp.watch('source/less/**/*.less', gulp.series(styles));
  gulp.watch('source/js/*.js', gulp.series(script));
  gulp.watch('source/*.html', gulp.series(html, reloadBrowser));
}

//Build

export const build = gulp.series(
  clean,
  copyDocs,
  optimizeImages,
  gulp.parallel(
    styles,
    html,
    script,
    svg,
    svgstore,
    createWebp,
  ),
);


export default gulp.series(
  clean,
  copyDocs,
  optimizeImages,
  gulp.parallel(
    styles,
    html,
    script,
    svg,
    svgstore,
    createWebp,
  ),
  gulp.series(
    server,
    watcher
  ),
)
