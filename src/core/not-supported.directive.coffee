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
          if browser.search 'ie' isnt -1
            @invalid = true if window.is.ie(browser)
          else if browser.search 'chrome'
            @invalid = true if window.is.chrome()
          else if browser.search 'firefox'
            @invalid = true if window.is.firefox()
          else if browser.search 'opera'
            @invalid = true if window.is.opera()
          else if browser.search 'safari'
            @invalid = true if window.is.safari()

          break if @invalid

    }