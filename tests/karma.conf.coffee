module.exports = (config) ->
  config.set
    basePath: '../src'
    frameworks: ['jasmine']
    browsers: ['Chrome', 'Safari', 'Firefox', 'Internet Explorer']
    preprocessors:
      '**/*.coffee': ['coffee']
    coffeePreprocessor:
      options:
        bare: true