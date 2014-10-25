class imagoSlider extends Directive

  constructor: ($q, $document, imagoModel) ->
    return {
      replace: true
      transclude: true
      templateUrl: '/imagoWidgets/slider-widget.html'
      controllerAs: 'slider'
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

        @setCurrentSlideIndex = (index) ->
          $scope.currentIndex = index
          $scope.getSiblings()

      link: (scope, element, attrs) ->

        self = {}

        angular.forEach attrs, (value, key) ->
          scope.confSlider[key] = value

        # scope.$on 'slider:change', (e, index) ->
        #   scope.setCurrentSlideIndex index

        computeData = (data) ->
          unless angular.isArray(data)
            imagoModel.getData(data.path).then (response) ->
              data = imagoModel.findChildren(response[0])
              prepareSlides(data)
          else
            prepareSlides(data)

        self.watch = scope.$watch attrs['source'], (data) =>
          return unless data
          computeData data
          self.watch() unless attrs['watch']


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

          scope.currentIndex = 0 unless scope.currentIndex
          scope.sliderLength = scope.slideSource.length - 1
          scope.getSiblings()

        scope.displaySlides = (index) ->
          return true if index is scope.currentIndex or scope.nextIndex or scope.prevIndex

        scope.goNext = ($event) ->
          scope.currentIndex = if (scope.currentIndex < scope.slideSource.length - 1) then ++scope.currentIndex else 0
          scope.getSiblings()
          scope.$broadcast 'slide'

        scope.goPrev = ($event) ->
          scope.currentIndex = if (scope.currentIndex > 0) then --scope.currentIndex else scope.slideSource.length - 1
          scope.getSiblings()
          scope.$broadcast 'slide'

        scope.getSiblings = () ->
          scope.nextIndex = if scope.currentIndex is scope.sliderLength then 0 else scope.currentIndex + 1
          scope.prevIndex = if scope.currentIndex is 0 then scope.sliderLength else scope.currentIndex - 1

        scope.getLast = () ->
          scope.slideSource.length - 1

        $document.on 'keydown', (e) ->
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
