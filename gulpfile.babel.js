'use strict';

import gulp from 'gulp';
import UglifyJsPlugin from 'webpack-uglify-js-plugin';
import rename from 'gulp-rename';
import webpack from 'webpack-stream';
import postcss from 'gulp-postcss';
import less from 'postcss-less-engine';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

gulp.task('default', ['build.js', 'build.css'], function() {});
gulp.task('build.js', function() {
  return gulp.src('src/js/main.js')
    .pipe(webpack({
      module: {
        loaders: [{
          test: /.jsx?$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          query: {
            presets: ['es2015', 'react']
          }
        }]
      },
      output: {
        filename: 'main.js'
      },
      plugins: [
        new UglifyJsPlugin({
          cacheFolder: './temp/',
          debug: true,
          minimize: true,
          sourceMap: true,
          output: {
            comments: false
          },
          compressor: {
            warnings: false
          }
        })
      ],
      devtool: 'source-map'
    }))
    .pipe(gulp.dest('app/js'));
});
gulp.task('build.css', function() {
  return gulp.src('./src/less/main.less')
    .pipe(postcss([
      less()
    ], { parser: less.parser }))
    .pipe(postcss([
      autoprefixer({browsers: ['last 1 version']}),
      cssnano(),
    ]))
    .pipe(rename({extname: ".css"}))
    .pipe(gulp.dest('./app/css'));
});