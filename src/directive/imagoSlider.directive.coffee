class imagoSlider extends Directive

  constructor: ($q, $document, imagoModel) ->
    return {
      replace: true
      transclude: true
      scope: true
      templateUrl: '/imagoWidgets/imagoSlider.html'
      controller: ($scope) ->

        $scope.conf =
          animation:    'fade'
          enablekeys:   true
          enablearrows: true
          loop:         true
          current:      0
          namespace:    'slider'

      link: (scope, element, attrs, ctrl, transclude) ->

        transclude scope, (clone, scope) ->
          element.append(clone)

        angular.forEach attrs, (value, key) ->
          if value is 'true' or value is 'false'
            value = JSON.parse value
          scope.conf[key] = value

        scope.currentIndex = scope.conf.current

        scope.goPrev = ($event) ->
          scope.action = 'prev'
          scope.setCurrent(if (scope.currentIndex > 0) then --scope.currentIndex else parseInt(attrs.length) - 1)

        scope.goNext = ($event) ->
          scope.action = 'next'
          scope.setCurrent(if (scope.currentIndex < parseInt(attrs.length) - 1) then ++scope.currentIndex else 0)

        scope.getLast = () ->
          parseInt(attrs.length) - 1

        scope.getCurrent = () ->
          return scope.currentIndex

        scope.setCurrent = (index) =>
          scope.currentIndex = index
          scope.$emit "#{scope.conf.namespace}:changed", index

        if scope.conf.enablekeys

          $document.on 'keydown', (e) ->

            switch e.keyCode
              when 37
                scope.$apply(()->
                  scope.goPrev()
                )
              when 39
                scope.$apply(()->
                  scope.goNext()
                )

        scope.$on "#{scope.conf.namespace}:change", (event, index) ->
          scope.setCurrent(index)
  }
