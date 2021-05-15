"use strict";

let gulp = require("gulp");

let sass = require("gulp-sass");
let postcss = require("gulp-postcss");
let autoprefixer = require("autoprefixer");
let csso = require("gulp-csso");

let posthtml = require("gulp-posthtml");
let htmlinclude = require("posthtml-include");
let htmlmin = require("gulp-htmlmin");

let plumber = require("gulp-plumber");
let sourcemap = require("gulp-sourcemaps");
let include = require("gulp-include");
let uglify = require("gulp-uglify");
let rename = require("gulp-rename");
let del = require("del");

let server = require("browser-sync").create();

gulp.task("clean", function() {
  return del("build");
});

gulp.task("copy", function() {
  return gulp.src([
        "source/fonts/*",
        "source/img/*"
      ], {
        base: "source"
      })
      .pipe(gulp.dest("build"));
});

gulp.task("html", function() {
  return gulp.src("source/*.html")
      .pipe(posthtml([
          htmlinclude()
      ]))
      .pipe(htmlmin({collapseWhitespace: true}))
      .pipe(gulp.dest("build"));
});

gulp.task("css", function() {
  return gulp.src("source/css/style.scss")
      .pipe(plumber())
      .pipe(sourcemap.init())
      .pipe(sass())
      .pipe(postcss([
        autoprefixer()
      ]))
      .pipe(csso())
      .pipe(rename("style.min.css"))
      .pipe(sourcemap.write("."))
      .pipe(gulp.dest("build/css"))
      .pipe(server.stream());
});

gulp.task("js", function() {
  return gulp.src("source/js/script.js")
      .pipe(plumber())
      .pipe(sourcemap.init())
      .pipe(include())
      .pipe(rename("script.min.js"))
      .pipe(sourcemap.write("."))
      .pipe(gulp.dest("build/js"));
});

gulp.task("refresh", function(done) {
  server.reload();
  done();
});

gulp.task("server", function() {
  server.init({
    server: "build/",
    browser: "google chrome",
    index: "simulator.html",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/modules/*/*.html", gulp.series("html", "refresh"));
  gulp.watch("source/*.html", gulp.series("html", "refresh"));
  gulp.watch("source/img/hands.svg", gulp.series("html", "refresh"));
  gulp.watch("source/modules/*/*.scss", gulp.series("css"));
  gulp.watch("source/css/*.scss", gulp.series("css"));
  gulp.watch("source/modules/*/*.js", gulp.series("js", "refresh"));
  gulp.watch("source/js/script.js", gulp.series("js", "refresh"));
});

gulp.task("build", gulp.series("clean", "copy", "html", "css", "js"));

gulp.task("start", gulp.series("build", "server"));
