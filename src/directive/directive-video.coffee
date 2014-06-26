class imagoVideo extends Directive

  constructor: ->
    return {
      replace: true
      scope: true
      templateUrl: '/imagoWidgets/video-widget.html'
      controller: ($scope, $element, $attrs, $transclude, $window) ->

        @defaults =
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

        angular.forEach @defaults, (value, key) =>
          @[key] = value

        angular.forEach $attrs, (value, key) =>
          @[key] = value


        @videoEl = $element[0].children[1]
        $scope.time = '00:00'
        $scope.seekTime = 0

        # TODO: Remember users preference by localStorage
        $scope.volumeInput = 100

        $scope.$watch $attrs['source'], (data) ->
          return unless data
          @data = data
          render @data

        angular.element(@videoEl).bind 'timeupdate', (e) =>
            $scope.seekTime = @videoEl.currentTime / @videoEl.duration * 100
            updateTime @videoEl.currentTime
            $scope.$apply()

        angular.element(@videoEl).bind 'ended', (e) =>
          $scope.optionsVideo.playing = false
          $scope.$apply()

        render = (data) =>

          $scope.wrapperStyle = {} unless $scope.wrapperStyle

          if angular.isString(data.resolution)
            r = data.resolution.split('x')
            @resolution =
              width:  r[0]
              height: r[1]
            @assetRatio = r[0]/r[1]

          if @controls
            $scope.controls = angular.copy(@controls)

          # use pvrovided dimentions.
          if angular.isNumber(@width) and angular.isNumber(@height)


          # fit width
          else if @height is 'auto' and angular.isNumber(@width)
            @height = @width / @assetRatio
            $scope.wrapperStyle.height = parseInt @height
            # @log 'fit width', @width, @height

          # fit height
          else if @width is 'auto' and angular.isNumber(@height)
            @width = @height * @assetRatio
            $scope.wrapperStyle.width  = parseInt @width
            # @log 'fit height', @width, @height

          # we want dynamic resizing without css.
          # like standard image behaviour. will get a height according to the width
          else if @width is 'auto' and @height is 'auto'
            @width  = $element[0].clientWidth
            @height = @width / @assetRatio
            $scope.wrapperStyle.height = parseInt @height
            # $log.log 'both auto', @width, @height

          # width and height dynamic, needs to be defined via css
          # either width height or position
          else
            @width  = $element[0].clientWidth
            @height = $element[0].clientHeight
            # console.log 'fit width', @width, @height

          $scope.wrapperStyle['background-position'] = "#{@align}"

          $scope.optionsVideo = @

          renderVideo data
          loadSources data
          resize()

        renderVideo = (data) =>
          # console.log data
          dpr = if @hires then Math.ceil(window.devicePixelRatio) or 1 else 1


          @serving_url = data.serving_url
          @serving_url += "=s#{ Math.ceil(Math.min(Math.max(@width, @height) * dpr, 1600)) }"

          $scope.wrapperStyle["background-image"]  = "url(#{@serving_url})"
          $scope.wrapperStyle["background-repeat"] = "no-repeat"
          $scope.wrapperStyle["background-size"]   = "auto 100%"
          $scope.wrapperStyle["width"]  = parseInt @width  if angular.isNumber(@width)
          $scope.wrapperStyle["height"] = parseInt @height if angular.isNumber(@width)
          $scope.videoStyle =
            "autoplay" :   $scope.optionsVideo["autoplay"]
            "preload" :    $scope.optionsVideo["preload"]
            "autobuffer" : $scope.optionsVideo["autobuffer"]
            "x-webkit-airplay" : 'allow'
            "webkitAllowFullscreen" : 'true'

        pad = (num)->
          return "0" + num  if num < 10
          num

        updateTime = (sec) ->
          calc = []
          minutes = Math.floor(sec / 60)
          hours = Math.floor(sec / 3600)
          seconds = (if (sec is 0) then 0 else (sec % 60))
          seconds = Math.round(seconds)
          calc.push pad(hours)  if hours > 0
          calc.push pad(minutes)
          calc.push pad(seconds)
          result = calc.join ":"
          $scope.time = result

        $scope.play = =>
          @videoEl.play()
          $scope.optionsVideo.playing = true

        $scope.togglePlay = =>
          unless @videoEl.paused
            $scope.pause()
          else
            $scope.play()

        $scope.pause = =>
          @videoEl.pause()
          $scope.optionsVideo.playing = false

        setSize = (size) ->
          # srcs = @el.children('source')
          # return unless srcs.length > 1

          # poster = @player.el.css('backgroundImage')
          # @player.el.css('backgroundImage', '')

          # $scope.pause()
          # @el.attr 'src', srcs[(if size is "hd" then 0 else srcs.length - 1)].src

        $scope.toggleSize = ->
          if $scope.optionsVideo.size is 'hd'
            $scope.optionsVideo.size = 'sd'
          else
            $scope.optionsVideo.size = 'hd'

          $scope.videoFormats.reverse()

        $scope.seek = (e) =>
          seek = parseFloat(e / 100)
          $scope.seekTime = parseFloat(@videoEl.duration * seek)
          @videoEl.currentTime = angular.copy($scope.seekTime)

        $scope.onVolumeChange = (e) =>
          @videoEl.volume = parseFloat(e / 100)

        $scope.volumeDown = () =>
          @videoEl.volume = 0
          $scope.volumeInput = 0

        $scope.volumeUp = () =>
          @videoEl.volume = 1
          $scope.volumeInput = 100

        $scope.fullScreen = =>
          if @videoEl.requestFullscreen
            @videoEl.requestFullscreen();
          else if @videoEl.webkitRequestFullscreen
            @videoEl.webkitRequestFullscreen();
          else if @videoEl.mozRequestFullScreen
            @videoEl.mozRequestFullScreen();
          else if @videoEl.msRequestFullscreen
            @videoEl.msRequestFullscreen();

        resize = =>
          return unless $scope.optionsVideo

          vs = $scope.videoStyle
          ws = $scope.wrapperStyle

          if @sizemode is 'crop'
            width  = $element[0].clientWidth
            height = $element[0].clientHeight
            wrapperRatio = width / height
            if @assetRatio < wrapperRatio
              #log 'full width'
              if imagoUtils.isiOS()
                  vs.width  = '100%'
                  vs.height = '100%'
                if @align is 'center center'
                  vs.top  = '0'
                  vs.left = '0'
              else
                  vs.width  = '100%'
                  vs.height = 'auto'
                if @align is 'center center'
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
                if @align is 'center center'
                  vs.top  = '0'
                  vs.left = '0'
              else
                  vs.width  = 'auto'
                  vs.height = '100%'

                if @align is 'center center'
                  vs.top  = 'auto'
                  vs.left = '50%'
                  vs.marginTop  = '0px'
                  vs.marginLeft = "-#{ parseInt(@height * @assetRatio / 2, 10) }px"

              ws.backgroundSize = 'auto 100%'
              ws.backgroundPosition = @align


          else if @sizemode is 'fit'
            # console.log 'fit'

            width  = $element[0].clientWidth
            height = $element[0].clientHeight
            wrapperRatio = width / height

            if @assetRatio > wrapperRatio
              vs.width  = '100%'
              vs.height = if imagoUtils.isiOS() then '100%' else 'auto'
              ws.backgroundSize = '100% auto'
              ws.backgroundPosition = @align
              # ws.width  = "#{ @width }px"
              # ws.height = "#{ parseInt(@width / @assetRatio, 10) }px"
            else
              vs.width  = if imagoUtils.isiOS() then '100%' else 'auto'
              vs.height = '100%'
              ws.backgroundSize = 'auto 100%'
              ws.backgroundPosition = @align
              # ws.width  = "#{ parseInt(@height * @assetRatio, 10) }px"
              # ws.height = "#{ @height }px"

        loadSources = (data) ->
          $scope.videoFormats = []
          @codecs  = ['mp4', 'webm']
          codec = detectCodec()
          data.formats.sort( (a, b) -> return b.height - a.height )
          for format, i in data.formats
            continue unless codec is format.codec
            $scope.videoFormats.push(
              result =
                "src" : "http://#{tenant}.imagoapp.com/assets/api/play_redirect?uuid=#{data.id}&codec=#{format.codec}&quality=hd&max_size=#{format.size}"
                "size": format.size
                "codec": format.codec
                "type": "video/#{codec}"
            )

        detectCodec = ->
          tag = document.createElement 'video'
          return unless tag.canPlayType

          codecs =
            mp4:  'video/mp4; codecs="mp4v.20.8"'
            mp4:  'video/mp4; codecs="avc1.42E01E"'
            mp4:  'video/mp4; codecs="avc1.42E01E, mp4a.40.2"'
            webm: 'video/webm; codecs="vp8, vorbis"'
            ogg:  'video/ogg; codecs="theora"'

          for key, value of codecs
            if tag.canPlayType value
              return key

        $scope.$on 'resizelimit', () =>
          resize()
    }