class NotSupported extends Directive

  constructor: ->

    return {

      templateUrl: '/imago/not-supported.html'
      bindToController: true
      controller: 'notSupportedController as supported'

    }

class NotSupportedController extends Controller

  constructor: ($scope, $element, $attrs) ->

    options =
      ie: 9
      firefox: 32
      chrome: 30
      safari: 6
      opera: 23

    settings = $scope.$eval $attrs.notSupported

    if _.isArray(settings)
      for option in settings
        version = option.match(/\d+/g)
        version = parseInt(version)
        continue unless _.isNaN(version)
        for key of options
          options[key] = version if _.includes(option.toLowerCase(), key)

    browserVersion = parseInt(bowser.version)

    for browser, version of options
      if bowser.msie and browser is 'ie'
        if browserVersion <= version
          @invalid = true
        else if _.isNaN version
          @invalid = true
      else if bowser.chrome and browser is 'chrome'
        if browserVersion <= version
          @invalid = true
        else if _.isNaN version
          @invalid = true
      else if bowser.firefox and browser is 'firefox'
        if browserVersion <= version
          @invalid = true
        else if _.isNaN version
          @invalid = true
      else if bowser.opera and browser is 'opera'
        if browserVersion <= version
          @invalid = true
        else if _.isNaN version
          @invalid = true
      else if bowser.safari and browser is 'safari'
        if browserVersion <= version
          @invalid = true
        else if _.isNaN version
          @invalid = true

      break if @invalid
