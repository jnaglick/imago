class imagoVideo extends Directive

  constructor: ($q, $window, imagoUtils, $timeout) ->
    return {
      replace: true
      scope: true
      templateUrl: '/imagoWidgets/video-widget.html'
      controller: ($scope, $element, $attrs, $transclude) ->

        $scope.videoOpts = {}
        $scope.player = $element.find('video')[0]

        defaults =
          autobuffer  : null
          autoplay    : false
          controls    : true
          preload     : 'none'
          # keyShortcut : true
          size        : 'hd'
          align       : 'left top'
          sizemode    : 'fit'
          lazy        : true
          width       : ''
          height      : ''
          hires       : true

        angular.forEach defaults, (value, key) =>
          $scope.videoOpts[key] = value

        @player = $scope.player

        return @

      link: (scope, element, attrs) ->
        self = {}

        angular.forEach attrs, (value, key) =>
          scope.videoOpts[key] = value

        # TODO: Remember users preference by localStorage
        sourcePromise = do () =>
          deffered = $q.defer()

          self.watch = scope.$watch attrs['source'], (data) =>
            return unless data

            deffered.resolve(data)

          return deffered.promise

        # angular.element(@videoEl).bind 'timeupdate', (e) =>
        #   $scope.seekTime = parseFloat((@videoEl.currentTime / @videoEl.duration) * 100)
        #   # console.log 'timeupdate seektime ' ,$scope.seekTime
        #   updateTime @videoEl.currentTime
        #
        # angular.element(@videoEl).bind 'ended', (e) =>
        #   $scope.optionsVideo.playing = false

        sourcePromise.then (data) =>
          return unless data
          source = data

          render source

        render = (data) =>

          scope.wrapperStyle = {} unless scope.wrapperStyle

          if angular.isString(data.resolution)
            r = data.resolution.split('x')
            resolution =
              width:  r[0]
              height: r[1]
            assetRatio = r[0]/r[1]

          if scope.videoOpts.width and scope.videoOpts.height
            width = parseInt opts.width
            height = parseInt opts.height
          else
            width = element[0].clientWidth
            height = element[0].clientHeight
            # console.log 'height' ,@height, 'width ' ,@width

          scope.wrapperStyle.backgroundPosition = "#{scope.videoOpts.align}"

          dpr = if @hires then Math.ceil(window.devicePixelRatio) or 1 else 1


          serving_url = data.serving_url
          serving_url += "=s#{ Math.ceil(Math.min(Math.max(width, height) * dpr, 1600)) }"

          scope.wrapperStyle.backgroundImage  = "url(#{serving_url})"
          scope.wrapperStyle.backgroundRepeat = "no-repeat"
          scope.wrapperStyle.backgroundSize  = "auto 100%"

          scope.videoStyle =
            "autoplay" :   scope.videoOpts.autoplay
            "preload" :    scope.videoOpts.preload
            "autobuffer" : scope.videoOpts.autobuffer
            "x-webkit-airplay" : 'allow'
            "webkitAllowFullscreen" : 'true'

          scope.videoFormats = []
          codecs  = ['mp4', 'webm']
          codec = detectCodec()
          data.formats.sort( (a, b) -> return b.height - a.height )
          for format, i in data.formats
            continue unless codec is format.codec
            scope.videoFormats.push(
                "src" : "http://#{tenant}.imagoapp.com/assets/api/play_redirect?uuid=#{data.id}&codec=#{format.codec}&quality=hd&max_size=#{format.size}"
                "size": format.size
                "codec": format.codec
                "type": "video/#{codec}"
            )

          resize()

        resize = =>
          return unless scope.videoOpts

          vs = scope.videoStyle
          ws = scope.wrapperStyle

          if scope.videoOpts.sizemode is 'crop'
            width  = element[0].clientWidth
            height = element[0].clientHeight
            wrapperRatio = width / height
            if scope.videoOpts.assetRatio < wrapperRatio
              # log 'full width'
              if imagoUtils.isiOS()
                  vs.width  = '100%'
                  vs.height = '100%'
                if scope.videoOpts.align is 'center center'
                  vs.top  = '0'
                  vs.left = '0'
              else
                  vs.width  = '100%'
                  vs.height = 'auto'
                if scope.videoOpts.align is 'center center'
                  vs.top  = '50%'
                  vs.left = 'auto'
                  vs.marginTop  = "-#{ (@width / @assetRatio / 2) }px"
                  vs.marginLeft = '0px'

              ws.backgroundSize = '100% auto'
              ws.backgroundPosition = @align

            else
              # log 'full height'
              if imagoUtils.isiOS()
                  vs.width = '100%'
                  vs.height= '100%'
                if scope.videoOpts.align is 'center center'
                  vs.top  = '0'
                  vs.left = '0'
              else
                  vs.width  = 'auto'
                  vs.height = '100%'

                if scope.videoOpts.align is 'center center'
                  vs.top  = 'auto'
                  vs.left = '50%'
                  vs.marginTop  = '0px'
                  vs.marginLeft = "-#{ parseInt(@height * @assetRatio / 2, 10) }px"

              ws.backgroundSize = 'auto 100%'
              ws.backgroundPosition = @align


          else if scope.videoOpts.sizemode is 'fit'
            # console.log 'fit'
            width  = element[0].clientWidth
            height = element[0].clientHeight

            wrapperRatio = width / height

            if scope.videoOpts.assetRatio > wrapperRatio
              # console.log  'assetRatio > wrapperRatio'
              vs.width  = '100%'
              vs.height = if imagoUtils.isiOS() then '100%' else 'auto'
              ws.backgroundSize = '100% auto'
              ws.backgroundPosition = @align
              ws.width  = "#{ width }px"
              ws.height = "#{ parseInt(width / @assetRatio, 10) }px"
            else
              # console.log  'assetRatio = ', @assetRatio , ' < wrapperRatio'
              vs.width  = if imagoUtils.isiOS() then '100%' else 'auto'
              vs.height = '100%'
              ws.backgroundSize = 'auto 100%'
              ws.backgroundPosition = @align
              ws.height = "#{ height }px"
              ws.width  = "#{ parseInt( height * @assetRatio, 10) }px"


        detectCodec = ->
          return unless scope.player.canPlayType
          #
          codecs =
            mp4:  'video/mp4; codecs="mp4v.20.8"'
            mp4:  'video/mp4; codecs="avc1.42E01E"'
            mp4:  'video/mp4; codecs="avc1.42E01E, mp4a.40.2"'
            webm: 'video/webm; codecs="vp8, vorbis"'
            ogg:  'video/ogg; codecs="theora"'

          for key, value of codecs
            if scope.player.canPlayType value
              return key

        # scope.toggleSize = ->
        #   if scope.optionsVideo.size is 'hd'
        #     scope.optionsVideo.size = 'sd'
        #   else
        #     scope.optionsVideo.size = 'hd'
        #
        #   scope.videoFormats.reverse()

        scope.togglePlay = =>
          unless scope.player.paused
            scope.player.play()
          else
            scope.player.pause()


        # we should only do this if the video changes actually size
          scope.$on 'resizelimit', resize()
    }
