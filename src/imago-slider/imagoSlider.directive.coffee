class imagoSlider extends Directive

  constructor: ($rootScope, $document, $interval, $location) ->
    return {
      transclude: true
      scope: true
      templateUrl: '/imago/imagoSlider.html'
      controller: 'imagoSliderController as imagoslider'
      bindToController:
        assets: '=?imagoSlider'

      link: (scope, element, attrs, ctrl, transclude) ->
        slider = element.children()

        scope.imagoslider.length = attrs.length or scope.imagoslider.assets?.length

        transclude scope, (clone, scope) ->
          slider.append(clone)

        for key, value of attrs
          continue unless key.charAt(0) isnt '$'
          if value in ['true', 'false']
            value = JSON.parse value
          scope.imagoslider.conf[key] = value

        watchers = []

        if angular.isDefined attrs.length
          watchers.push attrs.$observe 'length', (data) ->
            scope.imagoslider.length = data

        else
          watchers.push scope.$watch 'imagoslider.assets', (data) ->
            # console.log 'data', data
            return if not data or not _.isArray data
            scope.imagoslider.length = data.length

        scope.imagoslider.conf.siblings = !!(scope.imagoslider.conf.next and scope.imagoslider.conf.prev)

        if $location.path().indexOf('last')
          scope.currentIndex = parseInt(scope.imagoslider.conf.current)
        else
          scope.currentIndex = scope.getLast()

        scope.clearInterval = ->
          return unless scope.imagoslider.conf.interval
          $interval.cancel(scope.imagoslider.conf.interval)

        scope.goPrev = (ev) ->
          if typeof ev is 'object'
            scope.clearInterval()
            ev.stopPropagation()

          # no loop
          if not scope.imagoslider.conf.loop
            scope.setCurrent(
              if (scope.currentIndex > 0) then scope.currentIndex - 1 else scope.currentIndex
            )

          # loop through current collection
          else if scope.imagoslider.conf.loop and not scope.imagoslider.conf.siblings
            scope.setCurrent(
              if (scope.currentIndex > 0) then scope.currentIndex - 1 else parseInt(scope.imagoslider.length) - 1
            )

          # loop through sibling collections
          else if scope.imagoslider.conf.loop and scope.imagoslider.conf.siblings
            if (scope.currentIndex > 0)
              scope.setCurrent(scope.currentIndex - 1)
            else
              $location.path scope.imagoslider.conf.prev

        scope.goNext = (ev) =>
          if typeof ev is 'object'
            scope.clearInterval()
            ev.stopPropagation()

          # no loop
          if not scope.imagoslider.conf.loop
            scope.setCurrent(
              if (scope.currentIndex < parseInt(scope.imagoslider.length) - 1) then scope.currentIndex + 1 else scope.currentIndex
            )

          # loop through current collection
          else if scope.imagoslider.conf.loop and not scope.imagoslider.conf.siblings
            scope.setCurrent(
              if (scope.currentIndex < parseInt(scope.imagoslider.length) - 1) then scope.currentIndex + 1 else 0
            )

          # loop through sibling collections
          else if scope.imagoslider.conf.loop and scope.imagoslider.conf.siblings
            if (scope.currentIndex < parseInt(scope.imagoslider.length) - 1)
              scope.setCurrent(scope.currentIndex + 1)
            else
              $location.path scope.imagoslider.conf.next

        scope.getLast = ->
          parseInt(scope.imagoslider.length) - 1

        scope.getCurrent = ->
          return scope.currentIndex

        scope.setCurrent = (index) =>
          scope.action = switch
            # make last to first infinit if loop over one collection
            when index is 0 and scope.currentIndex is (parseInt(scope.imagoslider.length) - 1) and not scope.imagoslider.conf.siblings then 'next'
            when index is (parseInt(scope.imagoslider.length) - 1) and scope.currentIndex is 0 and not scope.imagoslider.conf.siblings then 'prev'

            when index > scope.currentIndex then 'next'
            when index < scope.currentIndex then 'prev'
            else ''

          # console.log 'scope.action', scope.action
          scope.currentIndex = index
          $rootScope.$emit "#{scope.imagoslider.conf.namespace}:changed", index

        if !_.isUndefined attrs.autoplay
          scope.$watch attrs.autoplay, (value) =>
            if parseInt(value) > 0
              scope.imagoslider.conf.interval = $interval scope.goNext, parseInt(value)
            else
              scope.clearInterval()

        keyboardBinding = (e) ->
          switch e.keyCode
            when 37
              scope.$apply ->
                scope.goPrev()
            when 39
              scope.$apply ->
                scope.goNext()

        if scope.imagoslider.conf.enablekeys
          $document.on 'keydown', keyboardBinding

        watchers.push $rootScope.$on "#{scope.imagoslider.conf.namespace}:change", (event, index) ->
          scope.clearInterval()
          scope.setCurrent(index)

        scope.$on '$destroy', ->
          $document.off "keydown", keyboardBinding
          scope.clearInterval()
          for watch in watchers
            watch()
  }


class imagoSliderController extends Controller

  constructor: ->

    @conf =
      animation:    'fade'
      enablekeys:   true
      enablearrows: true
      loop:         true
      current:      0
      namespace:    'slider'
      autoplay:     0
      next:         null
      prev:         null

