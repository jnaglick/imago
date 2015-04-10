class NotSupported extends Directive

  constructor: ($window) ->

    return {

      templateUrl: '/imago/not-supported.html'
      controllerAs: 'supported'
      bindToController: true
      controller: ($scope, $element, $attrs) ->

        return @invalid if bowser.msie and bowser.version <= 8

        options = $scope.$eval $attrs.notSupported

        return unless _.isArray(options)

        for browser in options
          browser = browser.toLowerCase()
          if _.includes browser, 'ie'
            version = browser.match /\d+/g
            @invalid = true if bowser.msie and version and _.includes bowser.version, version
          else if _.includes browser, 'chrome'
            @invalid = true if bowser.chrome
          else if _.includes browser, 'firefox'
            @invalid = true if bowser.firefox
          else if _.includes browser, 'opera'
            @invalid = true if bowser.opera
          else if _.includes browser, 'safari'
            @invalid = true if bowser.safari

          break if @invalid

    }
