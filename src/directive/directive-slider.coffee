class imagoSlider extends Directive

  constructor: ($q, $window, imagoPanel) ->
    return {
      replace: true
      scope: true
      transclude: true
      templateUrl: '/imagoWidgets/slider-widget.html'
      controller: ($scope) ->
        $scope.confSlider = {}

        @defaults =
          animation:    'fade'
          sizemode:     'fit'
          current:      0
          enablekeys:   true
          enablearrows: true
          enablehtml:   true
          subslides:    false
          loop:         true
          noResize:     false
          current:      0
          lazy:         false
          align:         'center center'

        angular.forEach @defaults, (value, key) ->
          $scope.confSlider[key] = value

      link: (scope, element, attrs) ->
        self = {}

        angular.forEach attrs, (value, key) ->
          scope.confSlider[key] = value

        sourcePromise = do () =>
          deffered = $q.defer()
          self.watch = scope.$watch attrs['source'], (data) =>
            return unless data
            deffered.resolve(data)

          return deffered.promise

        sourcePromise.then (data) =>
          return unless data
          self.watch() unless attrs['watch']

          unless angular.isArray(data)
            imagoPanel.getData(data.path).then (response) ->
              data = response[0].items
              prepareSlides(data)
          else
            prepareSlides(data)

        prepareSlides = (data) ->
          scope.loadedData = true
          scope.slideSource = []

          scope.dimensions = {width: element[0].clientWidth, height: element[0].clientHeight}

          for item in data
            if item.serving_url
              scope.slideSource.push item

          if scope.slideSource?.length <= 1 or !scope.slideSource
              scope.confSlider.enablearrows = false
              scope.confSlider.enablekeys   = false

          scope.currentIndex = 0
          scope.sliderLength = scope.slideSource.length - 1

        scope.setCurrentSlideIndex = (index) ->
          scope.currentIndex = index

        scope.showFunction = (index) ->
          scope.nextIndex = if scope.currentIndex is scope.sliderLength then 0 else scope.currentIndex + 1
          scope.prevIndex = if scope.currentIndex is 0 then scope.sliderLength else scope.currentIndex - 1

          return true if index is scope.currentIndex or scope.nextIndex or scope.prevIndex

        scope.isCurrentSlideIndex = (index) ->
          return scope.currentIndex is index

        scope.goPrev = () ->
          scope.currentIndex = if (scope.currentIndex < scope.slideSource.length - 1) then ++scope.currentIndex else 0

        scope.goNext = () ->
          scope.currentIndex = if (scope.currentIndex > 0) then --scope.currentIndex else scope.slideSource.length - 1

        scope.getLast = () ->
          scope.slideSource.length - 1

        angular.element($window).on 'keydown', (e) ->
          return unless scope.confSlider.enablekeys
          switch e.keyCode
            when 37
              scope.$apply(()->
                scope.goPrev()
              )
            when 39
              scope.$apply(()->
                scope.goNext()
              )
  }
