class imagoSlider extends Directive

  constructor: ($rootScope, $q, $document, imagoModel) ->
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
          scope.setCurrent(if (scope.currentIndex > 0) then scope.currentIndex - 1 else parseInt(attrs.length) - 1)

        scope.goNext = ($event) ->
          scope.setCurrent(if (scope.currentIndex < parseInt(attrs.length) - 1) then scope.currentIndex + 1 else 0)

        scope.getLast = () ->
          parseInt(attrs.length) - 1

        scope.getCurrent = () ->
          return scope.currentIndex

        scope.setCurrent = (index) =>
          scope.action = switch
            when index is 0 and scope.currentIndex is (parseInt(attrs.length) - 1) then 'next'
            when index is (parseInt(attrs.length) - 1) and scope.currentIndex is 0 then 'prev'
            when index > scope.currentIndex then 'next'
            when index < scope.currentIndex then 'prev'
            else ''

          scope.currentIndex = index
          $rootScope.$emit "#{scope.conf.namespace}:changed", index

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


        watcher = $rootScope.$on "#{scope.conf.namespace}:change", (event, index) ->
          scope.setCurrent(index)

        scope.$on '$destroy', ->
          watcher()
  }
