class imagoImage extends Directive

  constructor: ($window, $log, imagoUtils) ->

    return {
      replace: true
      scope: true
      templateUrl: '/imago/imagoImage.html'
      controller: ($scope, $element, $attrs) ->

        $scope.status = 'loading'
        $scope.imageStyle = {}

      link: (scope, element, attrs) ->


        self = {visible: false}
        source = {}

        opts =
          align     : 'center center'
          sizemode  : 'fit'
          hires     : true
          responsive: true
          scale     : 1
          lazy      : true
          maxsize   : 2560
          # width     : ''
          # height    : ''

        for key, value of attrs
          if value is 'true' or value is 'false'
            opts[key] = JSON.parse value
          # else if key is 'width' or key is 'height'
          #   opts[key] = if value is 'auto' then value else parseInt value
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
          if source.fields.hasOwnProperty('sizemode')
            if source.fields.sizemode.value isnt 'default' and not attrs['sizemode']
              opts.sizemode = source.fields.sizemode.value


          if opts.responsive
            if opts.sizemode is 'crop'
              scope.$on 'resizelimit', () ->
                calcMediaSize()
                scope.$digest()

          initialize()


        initialize = () ->

          if angular.isString(source.resolution)
            r = source.resolution.split('x')
            opts.resolution =
              width:  r[0]
              height: r[1]
            opts.assetRatio = r[0]/r[1]

          return console.log('tried to render during rendering!!') if scope.status is 'preloading'
          scope.status = 'preloading'

          scope.align = opts.align
          scope.sizemode = opts.sizemode

          width  = element[0].clientWidth
          height = element[0].clientHeight

          wrapperRatio = width / height if height

          # $log.log 'width, height, wrapperRatio, opts.assetRatio', width, height, wrapperRatio, opts.assetRatio
          # debugger

          dpr = if opts.hires then Math.ceil($window.devicePixelRatio) or 1 else 1

          # $log.log 'width, height', width, height

          if opts.sizemode is 'crop' and height
            if opts.assetRatio <= wrapperRatio
              # $log.log 'crop full width'
              servingSize = Math.round(Math.max(width, width / opts.assetRatio))
            else
              # $log.log 'crop full height'
              servingSize = Math.round(Math.max(height, height * opts.assetRatio))

          # sizemode fit
          else
            # $log.log 'assetratio: ', opts.assetRatio, 'wrapperraito: ' , wrapperRatio
            if not height or opts.autosize
              opts.autosize = true
              # console.log 'opts.autosize inside', opts.autosize
              servingSize = Math.round(Math.max(width, width / opts.assetRatio))

            else if opts.assetRatio <= wrapperRatio
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
            opts.servingUrl = source.serving_url

          else
            opts.servingUrl = "#{ source.serving_url }=s#{ servingSize * opts.scale }"

          # $log.log 'servingURl', servingUrl

          render()


        render = () ->

          if  opts.lazy and not self.visible
            self.visibleFunc = scope.$watch attrs['visible'], (value) =>
              return unless value
              self.visible = true
              self.visibleFunc()
              render()
          else
            img = angular.element('<img>')
            img.on 'load', (e) ->

              if opts.sizemode is 'crop'
                scope.imageStyle =
                  backgroundImage:    "url(#{opts.servingUrl})"
                  backgroundSize:     calcMediaSize()
                  backgroundPosition: opts.align

              else
                scope.servingUrl = opts.servingUrl

              scope.status     = 'loaded'
              scope.$digest()
            # console.log 'scope.imageStyle', scope.imageStyle

            img[0].src = opts.servingUrl

        calcMediaSize = () ->

          # $log.log 'calcMediaSize', opts.sizemode
          width  = element[0].clientWidth
          height = element[0].clientHeight

          # return unless width and height

          wrapperRatio = width / height if height

          if opts.sizemode is 'crop'
            # crop
            if opts.assetRatio < wrapperRatio
              scope.imageStyle['background-size'] = "100% auto"
            else
              scope.imageStyle['background-size'] = "auto 100%"
          # else
          #   # fit
          #   if opts.assetRatio > wrapperRatio
          #     scope.imageStyle['width']  = 'auto'
          #     scope.imageStyle['height'] = '100%'
          #   else
          #     scope.imageStyle['width']  = '100%'
          #     scope.imageStyle['height'] = 'auto'

        setImageStyle = () ->
          if opts.sizemode is 'crop'
            styles =
              backgroundImage:    "url(#{opts.servingUrl})"
              backgroundSize:     calcMediaSize()
              backgroundPosition: opts.align
            return styles

          else
            scope.servingUrl = opts.servingUrl
            # styles = calcMediaSize()
          return


        if opts.responsive
          # console.log 'resize', scope.onResize()

          # scope.$on 'resizestart', () ->
          #   scope.resizing = 'resizing'

          scope.$on 'resizestop', () ->
            scope.status = 'loading'
            # scope.resizing = ''
            initialize()

        angular.element($window).on "orientationchange", initialize

    }
