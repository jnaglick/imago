coffee          = require 'gulp-coffee'
coffeelint      = require 'gulp-coffeelint'

concat          = require 'gulp-concat'

gulp            = require 'gulp'

jade            = require 'gulp-jade'

ngClassify      = require 'gulp-ng-classify'

karma           = require('karma').server

plumber         = require 'gulp-plumber'
templateCache   = require 'gulp-angular-templatecache'
uglify          = require 'gulp-uglify'
watch           = require 'gulp-watch'
gutil           = require 'gulp-util'
notification    = require 'node-notifier'
exec            = require('child_process').exec


# Defaults

dest = 'dist'
src = 'src'

targets =
  js      : 'imago.widgets.angular.js'
  jade    : 'templates.js'
  coffee  : 'coffee.js'

paths =
  coffee: [
    "index.coffee"
    "#{src}/**/*.coffee"
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
    .pipe ngClassify(
      appName: 'imago.widgets.angular'
      animation:
        format: 'camelCase'
        prefix: ''
      constant:
        format: 'camelCase'
        prefix: ''
      controller:
        format: 'camelCase'
        suffix: ''
      factory:
        format: 'camelCase'
      filter:
        format: 'camelCase'
      provider:
        format: 'camelCase'
        suffix: ''
      service:
        format: 'camelCase'
        suffix: ''
      value:
        format: 'camelCase'
      )
    .pipe coffee(
      bare: true
    ).on('error', reportError)
    .pipe coffeelint()
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

gulp.task "karma test", ->
  karma.start
    configFile: 'tests/karma.conf.coffee'
    singleRun: true
  , done

gulp.task "combine", combineJs

gulp.task "js", ["coffee", "jade"], (next) ->
  next()

gulp.task "prepare", ["js"], ->
  combineJs()

gulp.task "build", ["js"], ->
  combineJs()

gulp.task "b", ["build"]

minify = ->
  gulp.src "#{dest}/#{targets.js}"
    .pipe uglify()
    .pipe concat targets.js
    .pipe gulp.dest dest

gulp.task "minify", ['build'], minify


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

  files = [targets.coffee, targets.jade]
  sources = ("#{dest}/#{file}" for file in files)

  watch
    glob: sources
  , ->
    gulp.start('combine')

reportError = (err) ->
  gutil.beep()
  notification.notify
    title: "Error running Gulp"
    message: err.message
  gutil.log err.message
  @emit 'end'

## End essentials tasks

gulp.task "default", ["watch"]
