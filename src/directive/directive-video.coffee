class imagoVideo extends Directive

  constructor: ($q, $window, imagoUtils, $timeout) ->
    return {
      replace: true
      scope: true
      templateUrl: '/imagoWidgets/video-widget.html'
      controller: ($scope, $element, $attrs, $transclude) ->

        $scope.player = $element.find('video')[0]
        $scope.loading =true

        angular.element($scope.player).bind 'ended', (e) =>
          $scope.player.currentTime = 0
          $scope.isPlaying = false

      link: (scope, element, attrs) ->
        self = {}
        videoOpts = {}

        defaults =
          autobuffer  : null
          autoplay    : false
          controls    : true
          preload     : 'none'
          size        : 'hd'
          align       : 'left top'
          sizemode    : 'fit'
          lazy        : true
          width       : ''
          height      : ''
          hires       : true

        angular.forEach defaults, (value, key) =>
          videoOpts[key] = value

        angular.forEach attrs, (value, key) =>
          videoOpts[key] = value

        # TODO: Remember users preference by localStorage
        if videoOpts.lazy
          visiblePromise = do () =>
            deffered = $q.defer()
            self.visibleFunc = scope.$watch attrs['visible'], (value) =>
              return unless value
              deffered.resolve(value)

            return deffered.promise

        sourcePromise = do () =>
          deffered = $q.defer()

          self.watch = scope.$watch attrs['source'], (data) =>
            return unless data

            deffered.resolve(data)

          return deffered.promise


        sourcePromise.then (data) =>
          return unless data
          self.source = data

          if angular.isString(data.resolution)
            r = data.resolution.split('x')
            resolution =
              width:  r[0]
              height: r[1]
            videoOpts.assetRatio = r[0]/r[1]

          scope.loading = false
          if videoOpts.lazy
            visiblePromise.then (value) =>
              self.visibleFunc()
              render self.source
          else
            render self.source

        render = (data) =>
          scope.wrapperStyle = {} unless scope.wrapperStyle
          scope.controls = videoOpts.controls

          if videoOpts.width and videoOpts.height
            width = parseInt videoOpts.width
            height = parseInt videoOpts.height
          else
            width = element[0].clientWidth
            height = element[0].clientHeight
            # console.log 'height' ,@height, 'width ' ,@width

          dpr = if @hires then Math.ceil(window.devicePixelRatio) or 1 else 1


          serving_url = data.serving_url
          serving_url += "=s#{ Math.ceil(Math.min(Math.max(width, height) * dpr, 1600)) }"


          scope.wrapperStyle =
            size:                 videoOpts.size
            sizemode:             videoOpts.sizemode
            backgroundPosition:   videoOpts.align
            backgroundImage:      "url(#{serving_url})"
            backgroundRepeat:     "no-repeat"

          scope.player.setAttribute("autoplay", videoOpts.autoplay)
          scope.player.setAttribute("preload", videoOpts.preload)
          scope.player.setAttribute("x-webkit-airplay", "allow")
          scope.player.setAttribute("webkitAllowFullscreen", true)

          scope.videoFormats = []
          codec = detectCodec()
          data.formats.sort( (a, b) -> return b.height - a.height )
          for format, i in data.formats
            continue unless codec is format.codec
            scope.videoFormats.push(
                "src" : """http://#{tenant}.imagoapp.com/assets/api/
                           play_redirect?uuid=#{data.id}&codec=#{format.codec}
                           &quality=hd&max_size=#{format.size}"""
                "size": format.size
                "codec": format.codec
                "type": "video/#{codec}"
            )

          resize()

        resize = =>
          return unless videoOpts

          videoStyle = {}

          width  = element[0].clientWidth
          height = element[0].clientHeight
          wrapperRatio = width / height

          if imagoUtils.isiOS()
            videoStyle.width  = '100%'
            videoStyle.height = '100%'
            if videoOpts.align is 'center center' and videoOpts.sizemode is 'crop'
              videoStyle.top  = '0'
              videoStyle.left = '0'
          else # Not iOS
            if videoOpts.sizemode is 'crop'
              if videoOpts.assetRatio < wrapperRatio
                videoStyle.width  = '100%'
                videoStyle.height = 'auto'
                if videoOpts.align is 'center center'
                  videoStyle.top  = '50%'
                  videoStyle.left = 'auto'
                  videoStyle.marginTop  = "-#{ parseInt(height / 2) }px"
                  videoStyle.marginLeft = '0px'
                scope.wrapperStyle.backgroundSize = '100% auto'
              else #assetRatio > wrapperRatio
                videoStyle.width  = 'auto'
                videoStyle.height = '100%'
                if videoOpts.align is 'center center'
                  videoStyle.top  = 'auto'
                  videoStyle.left = '50%'
                  videoStyle.marginTop  = '0px'
                  videoStyle.marginLeft = "-#{ parseInt(width / 2) }px"
                scope.wrapperStyle.backgroundSize = 'auto 100%'
            else #sizemode Fit
              if videoOpts.assetRatio < wrapperRatio
                videoStyle.width  = 'auto'
                videoStyle.height = '100%'
                scope.wrapperStyle.width  = "#{ parseInt(height * videoOpts.assetRatio) }px"
                scope.wrapperStyle.height = "#{ height }px"
                scope.wrapperStyle.backgroundSize = 'auto 100%'
              else #assetRatio > wrapperRatio
                videoStyle.width  = '100%'
                videoStyle.height = 'auto'
                scope.wrapperStyle.width  = "#{ width }px"
                scope.wrapperStyle.height = "#{ parseInt(width / videoOpts.assetRatio) }px"
                scope.wrapperStyle.backgroundSize = '100% auto'

          scope.videoStyle = videoStyle


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
            scope.isPlaying = true
            scope.hasPlayed = true
            scope.player.play()
          else
            scope.isPlaying = false
            scope.player.pause()

        scope.toggleSize = ->
          if videoOpts.size is 'hd'
            videoOpts.size = 'sd'
            scope.wrapperStyle.size = 'sd'
          else
            videoOpts.size = 'hd'
            scope.wrapperStyle.size = 'hd'

          scope.videoFormats.reverse()

        # we should only do this if the video changes actually size
        scope.$on 'resizelimit', () ->
          scope.$apply( resize )
    }
