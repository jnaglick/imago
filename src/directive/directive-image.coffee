class imagoImage extends Directive

  constructor: ->
    return {
      replace: true
      scope: true
      templateUrl: '/imagoWidgets/image-widget.html'
      controller: ($scope, $element, $attrs, $transclude, $window, $log, $q, $timeout) ->

        @defaults =
          align     : 'center center'
          sizemode  : 'fit'              # fit, crop
          hires     : true
          scale     : 1
          lazy      : true
          maxsize   : 2560
          # noResize  : false deprecated
          mediasize : false
          width     : ''
          height    : ''
          responsive: true


        angular.forEach @defaults, (value, key) =>
          @[key] = value

        angular.forEach $attrs, (value, key) =>
          @[key] = value

        if $attrs['no-resize']
          $log.log '@noResize depricated will be removed soon, use responsive: false'
          @responsive = false

        $scope.$watch $attrs['source'], (data) =>
          return unless data
          @data = data
          render @data

        render = (data) =>

          unless data.serving_url
            $element.remove()
            return

          $scope.elementStyle = {} unless $scope.elementStyle

          if angular.isString(data.resolution)
            r = data.resolution.split('x')
            @resolution =
              width:  r[0]
              height: r[1]
            @assetRatio = r[0]/r[1]

          # return $log.log('tried to render during rendering!!') if $scope.status is 'preloading'

          # console.log '@assetRatio', @assetRatio

          # use pvrovided dimentions.
          if angular.isNumber(@width) and angular.isNumber(@height)
            # $log.log 'fixed size', @width, @height

          # fit width
          else if @height is 'auto' and angular.isNumber(@width)
            @height = @width / @assetRatio
            $scope.elementStyle.height = parseInt @height
            # $log.log 'fit width', @width, @height

          # fit height
          else if @width is 'auto' and angular.isNumber(@height)
            @width = @height * @assetRatio
            $scope.elementStyle.width = parseInt @width
            # $log.log 'fit height', @width, @height

          # we want dynamic resizing without css.
          # like standard image behaviour. will get a height according to the width
          else if @width is 'auto' and @height is 'auto'
            @width  = $element[0].clientWidth
            @height = @width / @assetRatio
            $scope.elementStyle.height = parseInt @height
            # $log.log 'both auto', @width, @height

          # width and height dynamic, needs to be defined via css
          # either width height or position
          else
            @width  = $element[0].clientWidth
            @height = $element[0].clientHeight
            # $log.log 'width and height dynamic', @width, @height


          $scope.status = 'preloading'

          # unbind scrollstop listener for lazy loading
          # @window.off "scrollstop.#{@id}" if @lazy

          wrapperRatio = @width / @height

          # $log.log 'width, height, wrapperRatio, @assetRatio', @width, @height, wrapperRatio, assetRatio
          # debugger

          dpr = if @hires then Math.ceil(window.devicePixelRatio) or 1 else 1

          # $log.log 'width, height', width, height
          if @sizemode is 'crop'
            if @assetRatio <= wrapperRatio
              # $log.log 'crop full width'
              servingSize = Math.round(Math.max(@width, @width / @assetRatio))
            else
              # $log.log 'crop full height'
              servingSize = Math.round(Math.max(@height, @height * @assetRatio))

          # sizemode fit
          else
            # $log.log 'ratios', @assetRatio, wrapperRatio
            if @assetRatio <= wrapperRatio
              # $log.log 'fit full height', @width, @height, @assetRatio, @height * assetRatio
              servingSize = Math.round(Math.max(@height, @height * @assetRatio))
            else
              # $log.log 'fit full width', @width, @height, @assetRatio, height / assetRatio
              servingSize = Math.round(Math.max(@width, @width / @assetRatio))

          servingSize = parseInt Math.min(servingSize * dpr, @maxsize), 10

          # make sure we only load a new size
          if servingSize is @servingSize
            # console.log 'same size exit'
            $scope.status = 'loaded'
            return

          servingUrl = "#{ data.serving_url }=s#{ servingSize * @scale }"

          @servingSize = servingSize

          # $log.log 'servingURl', servingUrl
          $scope.imageStyle = {}

          unless @responsive
            $scope.imageStyle['width']  = "#{parseInt @width,  10}px"
            $scope.imageStyle['height'] = "#{parseInt @height, 10}px"

          img = angular.element('<img>')
          img.on 'load', (e) =>
            $scope.imageStyle['background-image']    = "url(#{servingUrl})"
            $scope.imageStyle['background-size']     = $scope.calcMediaSize()
            $scope.imageStyle['background-position'] = @align
            $scope.imageStyle['display']             = 'inline-block'
            $scope.status = 'loaded'
            $scope.$apply()
            # console.log '$scope.imageStyle', $scope.imageStyle

          img[0].src = servingUrl


        $scope.onResize = () =>
          $scope.imageStyle['background-size'] = $scope.calcMediaSize()

        $scope.calcMediaSize = () =>
          # console.log 'calcMediaSize'
          # for key, value of options
          #   @[key] = value

          # $log.log 'calcMediaSize', @sizemode
          @width  = $element[0].clientWidth  or @width
          @height = $element[0].clientHeight or @height
          # $log.log 'calcMediaSize: @width, @height', @width, @height
          return unless @width and @height

          wrapperRatio = @width / @height
          if @sizemode is 'crop'
            # $log.log '@sizemode crop', @assetRatio, wrapperRatio
            if @assetRatio < wrapperRatio then "100% auto" else "auto 100%"
          else
            # $log.log '@sizemode fit', @assetRatio, wrapperRatio
            if @assetRatio > wrapperRatio then "100% auto" else "auto 100%"


        $scope.$on 'resizelimit', () =>
          # console.log 'resizelimit'
          $scope.onResize if @responsive

        $scope.$on 'resizestop', () =>
          # console.log 'resizestop'
          render(@data) if @responsive

        $scope.$on 'scrollstop', () =>
          # console.log 'scrollstop'
          render(@data) if @lazy
    }
