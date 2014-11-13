class imagoSlider extends Directive

  constructor: ($q, $document, imagoModel) ->
    return {
      replace: true
      transclude: true
      scope: true
      templateUrl: '/imagoWidgets/imagoSlider.html'
      controller: ($scope) ->

        $scope.conf = {
          animation:    'fade'
          enablekeys:   true
          enablearrows: true
          loop:         true
          current:      0
        }

      link: (scope, element, attrs, ctrl, transclude) ->

        transclude scope, (clone, scope) ->
          element.append(clone)

        angular.forEach attrs, (value, key) ->
          if value is 'true' or value is 'false'
            value = JSON.parse value
          scope.conf[key] = value

        scope.currentIndex = scope.conf.current

        scope.displaySlides = (index) ->
          return true if index is scope.currentIndex or scope.nextIndex or scope.prevIndex

        scope.goPrev = ($event) ->
          scope.currentIndex = if (scope.currentIndex > 0) then --scope.currentIndex else parseInt(attrs.length) - 1
          scope.action = 'prev'

        scope.goNext = ($event) ->
          scope.currentIndex = if (scope.currentIndex < parseInt(attrs.length) - 1) then ++scope.currentIndex else 0
          scope.action = 'next'

        scope.getSiblings = () ->
          scope.nextIndex = if scope.currentIndex is scopeLength then 0 else scope.currentIndex + 1
          scope.prevIndex = if scope.currentIndex is 0 then scopeLength else scope.currentIndex - 1

        scope.getLast = () ->
          parseInt(attrs.length) - 1

        scope.getCurrent = () ->
          return $scope.currentIndex

        scope.setCurrent = (index) =>
          $scope.currentIndex = index
          $scope.getSiblings()

        $document.on 'keydown', (e) ->
          return unless scope.conf.enablekeys
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
