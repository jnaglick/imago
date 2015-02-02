class imagoVideo extends Directive

  constructor: ($q, $timeout, $window, imagoUtils) ->
    return {
      replace: true
      scope: true
      templateUrl: '/imago/imagoVideo.html'
      controller: ($scope, $element, $attrs, $transclude) ->

        $scope.player  = $element.find('video')[0]
        $scope.loading = true

        angular.element($scope.player).bind 'ended', (e) ->
          $scope.player.currentTime = 0
          $scope.isPlaying = false

        angular.element($scope.player).bind 'loadeddata', () ->
          $scope.hasPlayed = true
          angular.element($scope.player).unbind 'loadeddata'

        angular.element($scope.player).bind 'play', () ->
          $scope.isPlaying = true

      link: (scope, element, attrs) ->
        self = {visible: false}

        opts =
          autobuffer  : null
          autoplay    : false
          controls    : true
          preload     : 'none'
          size        : 'hd'
          align       : 'center center'
          sizemode    : 'fit'
          lazy        : true
          hires       : true
          loop        : false
          width       : ''
          height      : ''

        for key, value of attrs
          if value is 'true' or value is 'false'
            opts[key] = JSON.parse value
          else if key is 'width' or key is 'height'
            opts[key] = if value is 'auto' then value else parseInt value
          else
            opts[key] = value

        self.watch = scope.$watch attrs['imagoVideo'], (data) =>
          return unless data
          self.watch() unless attrs['watch']
          self.source = data

          unless self.source?.serving_url
            element.remove()
            return

          if self.source.fields.hasOwnProperty('crop') and not attrs['align']
            opts.align = self.source.fields.crop.value

          if self.source.fields.hasOwnProperty('sizemode') and not attrs['sizemode']
            opts.sizemode = self.source.fields.sizemode.value

          preload self.source

        preload = (data) ->

          if angular.isString(data.resolution)
            r = data.resolution.split('x')
            resolution =
              width:  r[0]
              height: r[1]
            opts.assetRatio = r[0]/r[1]

          scope.controls = opts.controls

          if opts.width and opts.height
            width  = opts.width
            height = opts.height
          else
            width = element[0].clientWidth
            height = element[0].clientHeight

          dpr = if opts.hires then Math.ceil(window.devicePixelRatio) or 1 else 1

          serving_url = "#{data.serving_url}=s#{ Math.ceil(Math.min(Math.max(width, height) * dpr)) or 1600 }"

          style =
            size:                 opts.size
            sizemode:             opts.sizemode
            backgroundPosition:   opts.align
            backgroundImage:      "url(#{serving_url})"
            backgroundRepeat:     "no-repeat"

          scope.wrapperStyle = style

          setPlayerAttrs()
          scope.videoFormats = loadFormats(self.source)
          render(width, height, serving_url)

        setPlayerAttrs = ->
          scope.player.setAttribute("autoplay", true) if opts.autoplay is true
          scope.player.setAttribute("preload", opts.preload)
          scope.player.setAttribute("x-webkit-airplay", "allow")
          scope.player.setAttribute("webkitAllowFullscreen", true)
          scope.player.setAttribute("loop", opts.loop)

        render = (width, height, servingUrl) =>
          if  opts.lazy and not self.visible
            self.visibleFunc = scope.$watch attrs['visible'], (value) =>
              return unless value
              self.visible = true
              self.visibleFunc()
              render(width, height, servingUrl)
          else
            img = angular.element('<img>')
            img.on 'load', (e) =>
              _.assign(scope.wrapperStyle, styleWrapper(width, height))
              scope.videoStyle   = styleVideo(width, height)
              scope.loading = false
              scope.$apply()

            img[0].src = servingUrl

        styleWrapper = (width, height) ->
          return unless width and height

          style = {}

          wrapperRatio = width / height

          if opts.sizemode is 'crop'
            if opts.assetRatio < wrapperRatio
              style.backgroundSize = '100% auto'
            else
              style.backgroundSize = 'auto 100%'
          else
            if opts.assetRatio < wrapperRatio
              style.width  = "#{ Math.round(height * opts.assetRatio) }px"
              style.height = "#{ height }px"
              style.backgroundSize = 'auto 100%'
            else
              style.width  = "#{ width }px"
              style.height = "#{ Math.round(width / opts.assetRatio) }px"
              style.backgroundSize = '100% auto'

          style

        styleVideo = (width, height)=>
          return unless width and height

          style = {}

          wrapperRatio = width / height

          if imagoUtils.isiOS()
            style.width  = '100%'
            style.height = '100%'
            if opts.align is 'center center' and opts.sizemode is 'crop'
              style.top  = '0'
              style.left = '0'
          else # Not iOS
            if opts.sizemode is 'crop'
              if opts.assetRatio < wrapperRatio
                style.width  = '100%'
                style.height = 'auto'
                if opts.align is 'center center'
                  style.top  = '50%'
                  style.left = 'auto'
                  style.marginTop  = "-#{ Math.round(height / 2) }px"
                  style.marginLeft = '0px'
              else #assetRatio > wrapperRatio
                style.width  = 'auto'
                style.height = '100%'
                if opts.align is 'center center'
                  style.top  = 'auto'
                  style.left = '50%'
                  style.marginTop  = '0px'
                  style.marginLeft = "-#{ Math.round(width / 2) }px"
            else #sizemode Fit
              if opts.assetRatio < wrapperRatio
                style.width  = 'auto'
                style.height = '100%'
              else #assetRatio > wrapperRatio
                style.width  = '100%'
                style.height = 'auto'

          style

        loadFormats = (data) ->
          formats = []
          codec = detectCodec()
          data.fields.formats.sort( (a, b) -> return b.height - a.height )
          for format, i in data.fields.formats
            continue unless codec is format.codec
            formats.push(
                "src" : """//api.2.imagoapp.com/api/play_redirect?uuid=#{data.uuid}&codec=#{format.codec}&quality=hd&max_size=#{format.size}"""
                "size": format.size
                "codec": format.codec
                "type": "video/#{codec}"
            )

          formats

        detectCodec = ->
          return unless scope.player.canPlayType
          codecs =
            mp4:  'video/mp4; codecs="mp4v.20.8"'
            mp4:  'video/mp4; codecs="avc1.42E01E"'
            mp4:  'video/mp4; codecs="avc1.42E01E, mp4a.40.2"'
            webm: 'video/webm; codecs="vp8, vorbis"'
            ogg:  'video/ogg; codecs="theora"'

          for key, value of codecs
            if scope.player.canPlayType value
              return key

        scope.togglePlay = =>
          if scope.player.paused
            scope.player.play()
          else
            scope.isPlaying = false
            scope.player.pause()

        scope.toggleSize = ->

          if opts.size is 'hd'
            opts.size = 'sd'
            scope.wrapperStyle.size = 'sd'

          else
            opts.size = 'hd'
            scope.wrapperStyle.size = 'hd'

          scope.videoFormats.reverse()

          $timeout ->
            scope.player.load()
            scope.player.play()

        onResize = () ->
          width  = element[0].clientWidth  or opts.width
          height = element[0].clientHeight or opts.height

          _.assign(scope.wrapperStyle, styleWrapper(width, height))
          scope.videoStyle = styleVideo(width, height)

          scope.$apply()

        # we should only do this if the video changes actually size
        scope.$on 'resize', onResize

        scope.$on 'resizestop', () ->
          preload(self.source)

    }
