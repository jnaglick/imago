class imagoSlider extends Directive

  constructor: ($q, $document, imagoModel) ->
    return {
      replace: true
      transclude: true
      templateUrl: '/imagoWidgets/imagoSlider.html'
      controllerAs: 'slider'
      controller: ($scope) ->
        @conf = {}
        @currentIndex = 0

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
          align:        'center center'

        angular.forEach @defaults, (value, key) =>
          @conf[key] = value

        @getCurrent = () ->
          return @currentIndex

        @setCurrent = (index) =>
          @currentIndex = index
          $scope.getSiblings()

      link: (scope, element, attrs) ->

        self = {}

        angular.forEach attrs, (value, key) ->
          if value is 'true' or value is 'false'
            value = JSON.parse value
          scope.slider.conf[key] = value

        # computeData = (data) ->
        #   unless angular.isArray(data)
        #     imagoModel.getData(data.path).then (response) ->
        #       data = imagoModel.findChildren(response[0])
        #       prepareSlides(data)
        #   else
        #     prepareSlides(data)

        # self.watch = scope.$watch attrs['source'], (data) =>
        #   return unless data
        #   computeData data
        #   self.watch() unless attrs['watch']


        # prepareSlides = (data) ->
        #   scope.loadedData = true
        #   scope.slideSource = []

        #   scope.dimensions = {width: element[0].clientWidth, height: element[0].clientHeight}

        #   for item in data
        #     if item.serving_url
        #       scope.slideSource.push item

        #   if scope.slideSource?.length <= 1 or !scope.slideSource
        #       scope.slider.conf.enablearrows = false
        #       scope.slider.conf.enablekeys   = false

        #   scope.slider.currentIndex = 0 unless scope.slider.currentIndex
        #   scope.sliderLength = parseInt(attrs.length) - 1
        #   scope.getSiblings()

        scope.displaySlides = (index) ->
          return true if index is scope.slider.currentIndex or scope.nextIndex or scope.prevIndex

        scope.goPrev = ($event) ->
          scope.slider.currentIndex = if (scope.slider.currentIndex > 0) then --scope.slider.currentIndex else parseInt(attrs.length) - 1
          scope.slider.action = 'prev'
          # scope.getSiblings()
          # scope.$broadcast 'slide'

        scope.goNext = ($event) ->
          scope.slider.currentIndex = if (scope.slider.currentIndex < parseInt(attrs.length) - 1) then ++scope.slider.currentIndex else 0
          scope.slider.action = 'next'
          # scope.getSiblings()

        scope.getSiblings = () ->
          scope.nextIndex = if scope.slider.currentIndex is scope.sliderLength then 0 else scope.slider.currentIndex + 1
          scope.prevIndex = if scope.slider.currentIndex is 0 then scope.sliderLength else scope.slider.currentIndex - 1

        scope.getLast = () ->
          parseInt(attrs.length) - 1

        $document.on 'keydown', (e) ->
          return unless scope.slider.conf.enablekeys
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
