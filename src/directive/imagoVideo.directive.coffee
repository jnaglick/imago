class imagoVideo extends Directive

  constructor: ($q, $timeout, $window, imagoUtils) ->
    return {
      replace: true
      scope: true
      templateUrl: '/imagoWidgets/imagoVideo.html'
      controller: ($scope, $element, $attrs, $transclude) ->

        @player  = $element.find('video')[0]
        $scope.loading = true

        angular.element(@player).bind 'ended', (e) =>
          @player.currentTime = 0
          $scope.isPlaying = false

        @

      link: (scope, element, attrs, ctrl) ->
        self = {visible: false}

        opts =
          autobuffer  : null
          autoplay    : false
          controls    : true
          preload     : 'none'
          size        : 'hd'
          align       : 'top left'
          sizemode    : 'fit'
          lazy        : true
          width       : ''
          height      : ''
          hires       : true

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
            # console.log 'height' ,@height, 'width ' ,@width

          dpr = if opts.hires then Math.ceil(window.devicePixelRatio) or 1 else 1

          serving_url = "#{data.serving_url}=s#{ Math.ceil(Math.min(Math.max(width, height) * dpr)) or 1600 }"

          setPlayerAttrs()
          render(width, height, serving_url)

        setPlayerAttrs = ->
          ctrl.player.setAttribute("autoplay", true) if opts.autoplay is true
          ctrl.player.setAttribute("preload", opts.preload)
          ctrl.player.setAttribute("x-webkit-airplay", "allow")
          ctrl.player.setAttribute("webkitAllowFullscreen", true)

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
              scope.wrapperStyle = styleWrapper(width, height, servingUrl)
              scope.videoStyle   = styleVideo(width, height)
              scope.videoFormats = loadFormats(self.source)
              scope.loading = false
              scope.$apply()

            img[0].src = servingUrl

        styleWrapper = (width, height, servingUrl) ->
          return unless width and height and servingUrl

          style =
            size:                 opts.size
            sizemode:             opts.sizemode
            backgroundPosition:   opts.align
            backgroundImage:      "url(#{servingUrl})"
            backgroundRepeat:     "no-repeat"

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
          return unless ctrl.player.canPlayType
          codecs =
            mp4:  'video/mp4; codecs="mp4v.20.8"'
            mp4:  'video/mp4; codecs="avc1.42E01E"'
            mp4:  'video/mp4; codecs="avc1.42E01E, mp4a.40.2"'
            webm: 'video/webm; codecs="vp8, vorbis"'
            ogg:  'video/ogg; codecs="theora"'

          for key, value of codecs
            if ctrl.player.canPlayType value
              return key

        scope.togglePlay = =>
          if ctrl.player.paused
            scope.isPlaying = true
            scope.hasPlayed = true
            ctrl.player.play()
          else
            scope.isPlaying = false
            ctrl.player.pause()

        scope.toggleSize = ->

          if opts.size is 'hd'
            opts.size = 'sd'
            scope.wrapperStyle.size = 'sd'

          else
            opts.size = 'hd'
            scope.wrapperStyle.size = 'hd'

          scope.videoFormats.reverse()

          $timeout ->
            ctrl.player.load()
            ctrl.player.play()

        # we should only do this if the video changes actually size
        scope.$on 'resizestop', () ->
          preload(self.source)

        # scope.$on 'slide', () ->
        #   return unless scope.isPlaying
        #   scope.isPlaying = false
        #   ctrl.player.pause()
    }
