class NotSupported extends Directive

  constructor: ($window) ->

    return {

      templateUrl: '/imago/not-supported.html'
      controllerAs: 'supported'
      bindToController: true
      controller: ($scope, $element, $attrs) ->

        return @invalid if (bowser.msie and bowser.version <= 8) or (bowser.firefox and bowser.version <= 32)

        options = $scope.$eval $attrs.notSupported

        return unless _.isArray(options)

        for browser in options
          browser = browser.toLowerCase()
          version = browser.match /\d+/g
          version = parseInt(version)
          if _.includes browser, 'ie'
            continue unless bowser.msie
            if not _.isNaN(version) and bowser.version <= version
              @invalid = true
            else if _.isNaN version
              @invalid = true
          else if _.includes browser, 'chrome'
            continue unless bowser.chrome
            if not _.isNaN(version) and bowser.version <= version
              @invalid = true
            else if _.isNaN version
              @invalid = true
          else if _.includes browser, 'firefox'
            continue unless bowser.firefox
            if not _.isNaN(version) and bowser.version <= version
              @invalid = true
            else if _.isNaN version
              @invalid = true
          else if _.includes browser, 'opera'
            continue unless bowser.opera
            if not _.isNaN(version) and bowser.version <= version
              @invalid = true
            else if _.isNaN version
              @invalid = true
          else if _.includes browser, 'safari'
            continue unless bowser.safari
            if not _.isNaN(version) and bowser.version <= version
              @invalid = true
            else if _.isNaN version
              @invalid = true

          break if @invalid

    }
