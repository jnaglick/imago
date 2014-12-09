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
fs              = require 'fs'
merge           = require 'merge-stream'
rename          = require 'gulp-rename'
rimraf          = require 'gulp-rimraf'
order           = require 'gulp-order'
gulpif          = require 'gulp-if'
path            = require 'path'
tap             = require 'gulp-tap'
notification    = require 'node-notifier'
exec            = require('child_process').exec


# Defaults

dest        = 'dist'
src         = 'src'
test        = 'tmp/'
moduleName  = 'imago'

# END Defaults

getFolders = (dir) ->
  fs.readdirSync(dir).filter (file) ->
    fs.statSync(path.join(dir, file)).isDirectory()

gulp.task "join", ->
  folders = getFolders(src)

  tasks = folders.map (folder) ->
    gulp.src(path.join(src, folder, "/*"))
      .pipe plumber(
        errorHandler: reportError
      )
      .pipe order([
          "index.coffee"
        ])
      .pipe gulpif /[.]jade$/, jade({locals: {}}).on('error', reportError)
      .pipe gulpif /[.]html$/, templateCache(
        module: moduleName
      )
      .pipe gulpif /[.]coffee$/, ngClassify(
        appName: moduleName
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
      .pipe gulpif /[.]coffee$/, coffee(
          bare: true
        ).on('error', reportError)
      .pipe gulpif /[.]coffee$/, coffeelint()
      .pipe(concat(folder + ".js"))
      .pipe(gulp.dest(dest))
      .pipe(uglify())
      .pipe(rename(folder + ".min.js"))
      .pipe gulp.dest(dest)

  return merge(tasks)

gulp.task "karma", ->
  gulp.src paths.coffee
    .pipe plumber(
      errorHandler: reportError
    )
    .pipe ngClassify(
      appName: moduleName
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
    .pipe gulp.dest test
  gulp.src paths.jade
    .pipe plumber(
      errorHandler: reportError
    )
    .pipe jade({locals: {}}).on('error', reportError)
    .pipe templateCache(
      standalone: true
      root: "/imagoWidgets/"
      module: "ImagoWidgetsTemplates"
    )
    .pipe concat targets.jade
    .pipe gulp.dest test
  karma.start(
    configFile: 'tests/karma.conf.coffee'
    singleRun: true
    )

gulp.task "clean", ->
  gulp.src("#{dest}/**/*.*", { read: false })
    .pipe(rimraf())

gulp.task "build", ["clean"], ->
  gulp.start 'join'


## Essentials Task

gulp.task "watch", ->

  watch
    glob: "#{src}/**/*.*"
  , ->
    gulp.start('join')

reportError = (err) ->
  gutil.beep()
  notification.notify
    title: "Error running Gulp"
    message: err.message
  gutil.log err.message
  @emit 'end'

## End essentials tasks

gulp.task "default", ["watch"]

module.exports = gulp
