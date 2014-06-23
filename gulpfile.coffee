coffee          = require 'gulp-coffee'
coffeelint      = require 'gulp-coffeelint'

concat          = require 'gulp-concat'

gulp            = require 'gulp'

jade            = require 'gulp-jade'
ngmin           = require 'gulp-ngmin'
plumber         = require 'gulp-plumber'
templateCache   = require 'gulp-angular-templatecache'
uglify          = require 'gulp-uglify'
watch           = require 'gulp-watch'
gutil           = require 'gulp-util'
Notification    = require 'node-notifier'
notifier        = new Notification()
exec            = require('child_process').exec


# Defaults

dest = 'dist'
src = 'app'

targets =
  js      : 'nexangular.js'
  jade    : 'templates.js'
  coffee  : 'coffee.js'

paths =
  coffee: [
    "!node_modules/**/*.coffee"
    "!gulpfile.coffee"
    "**/*.coffee"
  ]
  jade: [
    "!node_modules/**/*.jade"
    "views/*.jade"
  ]

# END Defaults

gulp.task "coffee", ->
  gulp.src paths.coffee
    .pipe plumber(
      errorHandler: reportError
    )
    .pipe coffee(
      bare: true
    ).on('error', reportError)
    .pipe coffeelint()
    # .pipe rename extname: ""
    .pipe concat targets.coffee
    .pipe gulp.dest dest

gulp.task "jade", ->
  YOUR_LOCALS = {}
  gulp.src paths.jade
    .pipe plumber(
      errorHandler: reportError
    )
    .pipe jade({locals: YOUR_LOCALS}).on('error', reportError)
    .pipe templateCache(
      standalone: true
      root: "/imagoWidgets/"
      module: "ImagoWidgetsTemplates"
    )
    .pipe concat targets.jade
    .pipe gulp.dest dest

combineJs = (production = false) ->
  # We need to rethrow jade errors to see them
  rethrow = (err, filename, lineno) -> throw err

  files = [
    targets.jade
    targets.coffee
  ]
  sources = files.map (file) -> "#{dest}/#{file}"

  gulp.src sources
    .pipe concat targets.js
    .pipe gulp.dest dest

gulp.task "combine", combineJs

gulp.task "js", ["coffee", "jade"], (next) ->
  next()

gulp.task "prepare", ["js"], ->
  combineJs()

gulp.task "build", ["js"], ->
  combineJs()

gulp.task "b", ["build"]


## Essentials Task

gulp.task "watch", ->

  watch
    glob: paths.jade
  , ->
    gulp.start('jade')

  watch
    glob: paths.coffee
  , ->
    gulp.start('coffee')

  files = [targets.coffee]
  sources = ("#{dest}/#{file}" for file in files)

  watch
    glob: sources
  , ->
    gulp.start('combine')

reportError = (err) ->
  gutil.beep()
  notifier.notify
    title: "Error running Gulp"
    message: err.message
  gutil.log err.message
  @emit 'end'

## End essentials tasks

gulp.task "default", ["watch"]
