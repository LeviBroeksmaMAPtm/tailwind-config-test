/**
 * Gulp Packages
 */

// General
const gulp = require("gulp");
const {
  series,
  parallel,
  watch
} = require('gulp');
const del = require('del');
const rename = require('gulp-rename');
const fileinclude = require('gulp-file-include');
const browserSync = require('browser-sync').create();
const inlinesource = require('gulp-inline-source');

// Scripts
// const concat = require('gulp-concat');
const terser = require('gulp-terser');

// Styles
const postcss = require("gulp-postcss");
const prefix = require('autoprefixer');
const purge = require('@fullhuman/postcss-purgecss');
const minify = require('cssnano');
const tailwindcss = require('tailwindcss');


/**
 * Gulp Tasks
 */

// Build Tailwind CSS
function build_tailwind() {
  return gulp.src('./css/tailwind.css')
    .pipe(postcss([
      tailwindcss,
      prefix
    ]))
    .pipe(gulp.dest('./src/assets/'))
};

exports.build_tailwind = build_tailwind;


//
function minify_tailwind() {
  return gulp
    .src('./src/assets/tailwind.css')
    .pipe(
      rename({
        suffix: '.min'
      })
    )
    .pipe(
      gulp.dest('./dist/assets/')
    );
};


//
function purge_minify_tailwind() {
  return gulp
    .src('./css/tailwind.css')
    .pipe(
      postcss([
        tailwindcss,
        prefix,
        purge({
          content: [
            './dist/**/*.html',
            './dist/**/*.js'
          ],
          // defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
          defaultExtractor: content => content.match(/[\w-/.:]+(?<!:)/g) || [],
          // ... other settings
          whitelistPatterns: [],
          whitelistPatternsChildren: [/grid-cols/],
          whitelist: []
        }),
        minify({
          preset: 'default'
        })
      ])
    )
    .pipe(
      rename({
        suffix: '.min'
      })
    )
    .pipe(
      gulp.dest('./dist/assets/')
    );
};


// Remove pre-existing content from output folders
function clean_dist() {
  return del('./dist/**', {
    force: true
  });
  // del.sync('./dist/');
  // done();
};


// Minify CSS files
function minify_css() {
  return gulp
    .src([
      './src/**/*.css',
      '!./src/assets/*.css',
      '!./src/components/**/temp_*/'
    ], {
      sourcemaps: true
    })
    .pipe(postcss([
      prefix,
      minify({
        preset: 'default'
      })
    ]))
    .pipe(
      rename({
        suffix: '.min'
      })
    )
    .pipe(
      gulp.dest('./dist/', {
        sourcemaps: true
      })
    );
};


//
function uglify_js() {
  return gulp
    .src([
      './src/**/*.js',
      '!./src/assets/**/*.js',
      '!./src/components/**/temp_*/'
    ], {
      sourcemaps: true
    })
    // .pipe(concat('bundle.js'))
    .pipe(terser({
      keep_fnames: true,
      mangle: false
    }))
    .pipe(
      rename({
        suffix: '.min'
      })
    )
    .pipe(
      gulp.dest('./dist/', {
        sourcemaps: true
      })
    );
}


// Include _imports
function include_imports() {
  return gulp
    .src([
      './src/**/index.html',
      '!./src/components/**/temp_*/'
    ])
    .pipe(fileinclude({
      prefix: '@@',
      // basepath: '@file'
    }))
    .pipe(gulp.dest('./dist/'));
};


// Inline CSS and JS
function inline_css_js() {
  const options = {
    compress: false,
    // swallowErrors: true
  };

  return gulp
    .src([
      './dist/index.html'
    ])
    .pipe(inlinesource(options))
    .pipe(gulp.dest('./dist/'));
};


// Copy static files into output folder
function copy_static() {
  return gulp
    .src('./src/static/**/*')
    .pipe(
      gulp.dest('./dist/')
    );
};


// Copy content of components folder to the root
function copy_components() {
  return gulp
    .src([
      './dist/components/**/*',
      '!./dist/components/**/_*/',
    ])
    .pipe(
      gulp.dest('./dist/')
    );
}


// Copy CSS content of assets folder to the root
function copy_assets_css() {
  return gulp
    .src([
      './src/assets/**/*.css',
      '!./src/assets/**/tailwind.css',
    ])
    .pipe(
      gulp.dest('./dist/assets/')
    );
}


// Copy JS content of assets folder to the root
function copy_assets_js() {
  return gulp
    .src('./src/assets/**/*.js')
    .pipe(
      gulp.dest('./dist/assets/')
    );
}


// Remove components folder
function delete_components() {
  return del('./dist/components/', {
    force: true
  });
};


// Static server
function browser_sync() {
  browserSync.init({
    server: {
      baseDir: "./dist/"
    }
  });
};


// Static Server + watching html files
function serve() {
  const index = process.argv.indexOf("--browser");
  let browser_path;

  if (index) {
    const browser_name = process.argv[index + 1];

    switch (browser_name) {
      case "fde":
        browser_path = "C:\\Program Files\\Firefox Developer Edition\\firefox.exe";
        break;
      default:
        browser_path = "";
        break;
    }
  }

  browserSync.init({
    server: {
      baseDir: "./dist/"
    },
    browser: browser_path
  });

  gulp
    .watch([
      './src/**/*',
      '!./src/assets/**/*'
    ])
    .on('change', series('build', browserSync.reload));
};

exports.serve = serve;


/**
 * Task Runners
 */

// Build
if (process.env.NODE_ENV.trim() === 'production') {
  console.log('Building prodution...');

  exports.build = series(
    build_tailwind,
    clean_dist,
    parallel(
      include_imports,
      copy_static,
      // purge_minify_tailwind,
      minify_css,
      uglify_js
    ),
    parallel(
      copy_assets_css,
      copy_assets_js,
    ),
    copy_components,
    delete_components,
    purge_minify_tailwind
  );
} else {
  console.log('Building development...');

  exports.build = series(
    clean_dist,
    parallel(
      include_imports,
      copy_static,
      minify_tailwind,
      minify_css,
      uglify_js
    ),
    parallel(
      copy_assets_css,
      copy_assets_js,
    ),
    copy_components,
    delete_components
  );
}