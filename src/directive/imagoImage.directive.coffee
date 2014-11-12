class imagoImage extends Directive

  constructor: ($window, $log, imagoUtils) ->

    return {
      replace: true
      scope: true
      templateUrl: '/imagoWidgets/imagoImage.html'
      controller: ($scope, $element, $attrs) ->

        $scope.status = 'loading'
        $scope.imageStyle = {}

      link: (scope, element, attrs) ->

        self = {visible: false}
        source = {}
        scope.elementStyle = {}

        opts =
          align     : 'center center'
          sizemode  : 'fit'
          hires     : true
          responsive: true
          scale     : 1
          lazy      : true
          maxsize   : 2560
          width     : ''
          height    : ''

        for key, value of attrs
          if value is 'true' or value is 'false'
            value = JSON.parse value
          if key is 'width' or key is 'height'
            opts[key] = if value is 'auto' then value else parseInt value
          else
            opts[key] = value

        # console.log opts['imagoImage']

        self.watch = scope.$watch attrs['imagoImage'], (data) =>
          return unless data
          self.watch() unless attrs['watch']
          source = data

          unless source?.serving_url
            element.remove()
            return

          if source.fields.hasOwnProperty('crop') and not attrs['align']
            opts.align = source.fields.crop.value

          if source.fields.hasOwnProperty('sizemode') and not attrs['sizemode']
            opts.sizemode = source.fields.sizemode.value

          calcSize()

        calcSize = ->

          if angular.isString(source.resolution)
            r = source.resolution.split('x')
            opts.resolution =
              width:  r[0]
              height: r[1]
            opts.assetRatio = r[0]/r[1]

          return console.log('tried to render during rendering!!') if scope.status is 'preloading'
          scope.status = 'preloading'

          # console.log 'opts.assetRatio', opts.assetRatio
          # use pvrovided dimentions.
          if angular.isNumber(opts.width) and angular.isNumber(opts.height)
            # $log.log 'fixed size', opts.width, opts.height
            width  = parseInt(opts.width)
            height = parseInt(opts.height)

          #
          # # fit width
          else if opts.height is 'auto' and angular.isNumber(opts.width)
            height =  parseInt opts.width / opts.assetRatio
            width  =  opts.width
            # $log.log 'fit width', opts.width, opts.height
          #
          # # fit height
          else if opts.width is 'auto' and angular.isNumber(opts.height)
            height = opts.height
            width  = opts.height * opts.assetRatio
            # $log.log 'fit height', width, opts.height
          #
          # # we want dynamic resizing without css.
          # # like standard image behaviour. will get a height according to the width
          else if opts.width is 'auto' and opts.height is 'auto'
            width  = element[0].clientWidth
            height = width / opts.assetRatio

            # $log.log 'both auto', opts.width, opts.height, width, height, opts.assetRatio
          #
          # # width and height dynamic, needs to be defined via css
          # # either width height or position
          else
            width  = element[0].clientWidth
            height = element[0].clientHeight
            # $log.log 'width and height dynamic', width, height

          if opts.width is 'auto' and opts.height is 'auto'
            scope.elementStyle =
              height: parseInt(height) + 'px'
          else if opts.width is 'auto' or opts.height is 'auto'
            scope.elementStyle =
              width: parseInt(width) + 'px'
              height: parseInt(height) + 'px'

          createServingUrl(width, height)

        createServingUrl = (width, height) ->

          wrapperRatio = width / height

          # $log.log 'width, height, wrapperRatio, opts.assetRatio', width, height, wrapperRatio, opts.assetRatio
          # debugger

          dpr = if opts.hires then Math.ceil($window.devicePixelRatio) or 1 else 1

          # $log.log 'width, height', width, height

          if opts.sizemode is 'crop'
            if opts.assetRatio <= wrapperRatio
              # $log.log 'crop full width'
              servingSize = Math.round(Math.max(width, width / opts.assetRatio))
            else
              # $log.log 'crop full height'
              servingSize = Math.round(Math.max(height, height * opts.assetRatio))

          # sizemode fit
          else
            # $log.log 'assetratio: ', opts.assetRatio, 'wrapperraito: ' , wrapperRatio
            if opts.assetRatio <= wrapperRatio
              # $log.log 'fit full height', opts.width, opts.height, opts.assetRatio, opts.height * assetRatio
              servingSize = Math.round(Math.max(height, height * opts.assetRatio))
            else
              # $log.log 'fit full width', opts.width, opts.height, opts.assetRatio, height / assetRatio
              servingSize = Math.round(Math.max(width, width / opts.assetRatio))

          servingSize = parseInt Math.min(servingSize * dpr, opts.maxsize), 10

          # make sure we only load a new size
          # console.log 'new size, old size', servingSize, opts.servingSize
          if servingSize is opts.servingSize
            scope.status = 'loaded'
            return

          opts.servingSize = servingSize

          if imagoUtils.isBaseString(source.serving_url)
            servingUrl = source.serving_url

          else
            servingUrl = "#{ source.serving_url }=s#{ servingSize * opts.scale }"

          # $log.log 'servingURl', servingUrl
          unless opts.responsive
            scope.imageStyle.width  = "#{parseInt width,  10}px"
            scope.imageStyle.height = "#{parseInt height, 10}px"

          render(servingUrl)

        render = (servingUrl) ->
          if  opts.lazy and not self.visible
            self.visibleFunc = scope.$watch attrs['visible'], (value) =>
              return unless value
              self.visible = true
              self.visibleFunc()
              render(servingUrl)
          else
            img = angular.element('<img>')
            img.on 'load', (e) =>
              scope.imageStyle.backgroundImage     = "url(#{servingUrl})"
              scope.imageStyle.backgroundSize      = calcMediaSize()
              scope.imageStyle.backgroundPosition  = opts.align
              scope.imageStyle.display             = 'inline-block'
              scope.status                         = 'loaded'
              scope.$apply()
            # console.log 'scope.imageStyle', scope.imageStyle

            img[0].src = servingUrl

        calcMediaSize = () =>

          # $log.log 'calcMediaSize', opts.sizemode
          width  = element[0].clientWidth  or opts.width
          height = element[0].clientHeight or opts.height

          return unless width and height

          wrapperRatio = width / height

          if opts.sizemode is 'crop'
            # $log.log 'opts.sizemode crop', opts.assetRatio, wrapperRatio
            if opts.assetRatio < wrapperRatio then "100% auto" else "auto 100%"
          else
            # $log.log 'opts.sizemode fit', opts.assetRatio, wrapperRatio
            if opts.assetRatio > wrapperRatio then "100% auto" else "auto 100%"

        scope.onResize = () =>
          # console.log 'onResize func', scope.calcMediaSize()
          scope.imageStyle['background-size'] = calcMediaSize()

        if opts.responsive
          scope.$on 'resizelimit', scope.onResize

          scope.$on 'resizestop', () =>
            # console.log 'resizestop'
            scope.status = 'loading'
            calcSize()

        angular.element($window).on "orientationchange", calcSize

    }
