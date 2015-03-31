class imagoSlider extends Directive

  constructor: ($rootScope, $q, $document, imagoModel, $interval, $location) ->
    return {
      transclude: true
      scope: true
      templateUrl: '/imago/imagoSlider.html'
      controller: ($scope) ->

        $scope.conf =
          animation:    'fade'
          enablekeys:   true
          enablearrows: true
          loop:         true
          current:      0
          namespace:    'slider'
          autoplay:     0
          next:         null
          prev:         null

      link: (scope, element, attrs, ctrl, transclude) ->
        slider = element.children()

        transclude scope, (clone, scope) ->
          slider.append(clone)

        angular.forEach attrs, (value, key) ->
          if value in ['true', 'false']
            value = JSON.parse value
          scope.conf[key] = value

        scope.conf.siblings = !!(scope.conf.next and scope.conf.prev)

        if $location.path().indexOf('last')
          scope.currentIndex = scope.conf.current
        else
          scope.currentIndex = scope.getLast()

        scope.clearInterval = ->
          return unless scope.conf.interval
          $interval.cancel(scope.conf.interval)

        scope.goPrev = (ev) ->
          scope.clearInterval() if _.isPlainObject ev

          # no loop
          if not scope.conf.loop
            scope.setCurrent(
              if (scope.currentIndex > 0) then scope.currentIndex - 1 else scope.currentIndex
            )

          # loop through current collection
          else if scope.conf.loop and not scope.conf.siblings
            scope.setCurrent(
              if (scope.currentIndex > 0) then scope.currentIndex - 1 else parseInt(attrs.length) - 1
            )

          # loop through sibling collections
          else if scope.conf.loop and scope.conf.siblings
            if (scope.currentIndex > 0)
              scope.setCurrent(scope.currentIndex - 1)
            else
              $location.path scope.conf.prev

        scope.goNext = (ev) ->
          scope.clearInterval() if _.isPlainObject ev

          # no loop
          if not scope.conf.loop
            scope.setCurrent(
              if (scope.currentIndex < parseInt(attrs.length) - 1) then scope.currentIndex + 1 else scope.currentIndex
            )

          # loop through current collection
          else if scope.conf.loop and not scope.conf.siblings
            scope.setCurrent(
              if (scope.currentIndex < parseInt(attrs.length) - 1) then scope.currentIndex + 1 else 0
            )

          # loop through sibling collections
          else if scope.conf.loop and scope.conf.siblings
            if (scope.currentIndex < parseInt(attrs.length) - 1)
              scope.setCurrent(scope.currentIndex + 1)
            else
              $location.path scope.conf.next



        scope.getLast = ->
          parseInt(attrs.length) - 1

        scope.getCurrent = ->
          return scope.currentIndex

        scope.setCurrent = (index) =>
          scope.action = switch
            # make last to first infinit if loop over one collection
            when index is 0 and scope.currentIndex is (parseInt(attrs.length) - 1) and not scope.conf.siblings then 'next'
            when index is (parseInt(attrs.length) - 1) and scope.currentIndex is 0 and not scope.conf.siblings then 'prev'

            when index > scope.currentIndex then 'next'
            when index < scope.currentIndex then 'prev'
            else ''

          console.log 'scope.action', scope.action
          scope.currentIndex = index
          $rootScope.$emit "#{scope.conf.namespace}:changed", index

        if !_.isUndefined attrs.autoplay
          scope.$watch attrs.autoplay, (value) =>
            if parseInt(value) > 0
              scope.conf.interval = $interval scope.goNext, parseInt(value)
            else
              scope.clearInterval()

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
          scope.clearInterval()
          scope.setCurrent(index)

        scope.$on '$destroy', ->
          scope.clearInterval()
          watcher()
  }
