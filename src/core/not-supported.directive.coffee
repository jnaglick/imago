class NotSupported extends Directive

  constructor: ($window) ->

    return {

      templateUrl: '/imago/not-supported.html'
      controllerAs: 'supported'
      bindToController: true
      controller: ($scope, $element, $attrs) ->

        options = $scope.$eval $attrs.notSupported
        unless _.isArray(options)
          options = ['ie6', 'ie7', 'ie8']

        for browser in options
          browser = browser.toLowerCase()
          if _.includes browser, 'ie'
            @invalid = true if window.is.ie(browser)
          else if _.includes browser, 'chrome'
            @invalid = true if window.is.chrome()
          else if _.includes browser, 'firefox'
            @invalid = true if window.is.firefox()
          else if _.includes browser, 'opera'
            @invalid = true if window.is.opera()
          else if _.includes browser, 'safari'
            @invalid = true if window.is.safari()

          break if @invalid

    }