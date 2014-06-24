imagoWidgets.directive 'imagoVideo', (imagoUtils) ->
  replace: true
  scope: true
  templateUrl: '/imagoWidgets/video-widget.html'
  controller: ($scope, $element, $attrs, $transclude, $window) ->

    # console.log $element[0].childen('video')

    $scope.videoWrapper = $element[0].children[1]
    $scope.time = '00:00'
    $scope.seekTime = 0
    # TODO: Remember users preference by localStorage
    $scope.volumeInput = 100

    $scope.$watch $attrs['source'], (video) ->
      if video and video.kind is "Video"
        render video
      else
        $scope.videoBackground =
          "display" : "none"

    angular.element($scope.videoWrapper).bind 'timeupdate', (e) ->
      $scope.$apply(()->
        $scope.seekTime = $scope.videoWrapper.currentTime / $scope.videoWrapper.duration * 100
        updateTime($scope.videoWrapper.currentTime)
      )

    angular.element($window).bind 'resize', (e) ->
      $scope.$apply(()->
        resize()
      )
    render = (video) ->
      @options = {}
      @defaults =
        autobuffer  : null
        autoplay    : false
        controls    : true
        preload     : 'none'
        size        : 'hd'
        align       : 'left top'
        sizemode    : 'fit'
        lazy        : true

      angular.forEach @defaults, (value, key) ->
        @options[key] = value

      angular.forEach $attrs, (value, key) ->
        @options[key] = value

      $scope.optionsVideo = @options

      if @options.controls
        $scope.controls = angular.copy($scope.optionsVideo.controls)

      $scope.videoBackground =
        "background-position" : "#{@options.align}"

      renderVideo video
      videoElement video
      resize()

    renderVideo = (video) ->
      console.log video
      dpr = if @hires then Math.ceil(window.devicePixelRatio) or 1 else 1
      width    = $scope.optionsVideo.width or $element[0].clientWidth
      height   = $scope.optionsVideo.height or $element[0].clientHeight
      @serving_url = video.serving_url
      @serving_url += "=s#{ Math.ceil(Math.min(Math.max(width, height) * dpr, 1600)) }"

      # convert resolution string to object
      if angular.isString(video.resolution)
        r = video.resolution.split('x')
        $scope.optionsVideo.resolution =
          width:  r[0]
          height: r[1]
      $scope.videoBackground["background-image"]  = "url(#{@serving_url})"
      $scope.videoBackground["background-repeat"] = "no-repeat"
      $scope.videoBackground["background-size"]   = "auto 100%"
      $scope.videoBackground["width"]  = width if angular.isNumber(width)
      $scope.videoBackground["height"] = height if angular.isNumber(height)
      $scope.styleFormats =
        "autoplay" : $scope.optionsVideo["autoplay"]
        "preload" : $scope.optionsVideo["preload"]
        "autobuffer" : $scope.optionsVideo["autobuffer"]
        "x-webkit-airplay" : 'allow'
        "webkitAllowFullscreen" : 'true'

      @id = imagoUtils.uuid()

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

    $scope.play       = ->
      $scope.videoWrapper.play()
      $scope.optionsVideo.state = 'playing'

    $scope.togglePlay = ->
      if $scope.optionsVideo.state is 'playing'
        $scope.videoWrapper.pause()
      else
        $scope.videoWrapper.play()

    $scope.pause      = ->
      $scope.videoWrapper.pause()
      $scope.optionsVideo.state = 'pause'

    setSize: (size) ->
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

    $scope.seek       = (e) ->
      seek = parseFloat(e / 100)
      $scope.seekTime = parseFloat($scope.videoWrapper.duration * seek)
      $scope.videoWrapper.currentTime = angular.copy($scope.seekTime)

    $scope.onVolumeChange = (e) ->
      $scope.videoWrapper.volume = parseFloat(e / 100)

    $scope.fullScreen = ->
      if $scope.videoWrapper.requestFullscreen
        $scope.videoWrapper.requestFullscreen();
      else if $scope.videoWrapper.webkitRequestFullscreen
        $scope.videoWrapper.webkitRequestFullscreen();
      else if $scope.videoWrapper.mozRequestFullScreen
        $scope.videoWrapper.mozRequestFullScreen();
      else if $scope.videoWrapper.msRequestFullscreen
        $scope.videoWrapper.msRequestFullscreen();

    resize = ->
      unless $scope.optionsVideo then return
      assetRatio   = $scope.optionsVideo.resolution.width / $scope.optionsVideo.resolution.height

      if $scope.optionsVideo.sizemode is "crop"
        width  = $element[0].clientWidth
        height = $element[0].clientHeight
        wrapperRatio = width / height
        if assetRatio < wrapperRatio

          if imagoUtils.isiOS()
              $scope.styleFormats["width"]  =  "100%"
              $scope.styleFormats["height"] = "100%"

            if $scope.optionsVideo.align is "center center"
              $scope.styleFormats["top"]  = "0"
              $scope.styleFormats["left"] = "0"
          else
              $scope.styleFormats["width"]  =  "100%"
              $scope.styleFormats["height"] = "auto"

            if $scope.optionsVideo.align is "center center"
              $scope.styleFormats["top"]  = "50%"
              $scope.styleFormats["left"] = "auto"
              $scope.styleFormats["margin-top"]  = "-#{ (width / assetRatio / 2) }px"
              $scope.styleFormats["margin-left"] = "0px"

          $scope.videoBackground["background-size"] = "100% auto"
          $scope.videoBackground["background-position"] = $scope.optionsVideo.align

        else

          if imagoUtils.isiOS()
              $scope.styleFormats["width"] = "100%"
              $scope.styleFormats["height"]= "100%"

            if $scope.optionsVideo.align is "center center"
              $scope.styleFormats["top"]  = "0"
              $scope.styleFormats["left"] = "0"
          else
              $scope.styleFormats["width"]  =  "auto"
              $scope.styleFormats["height"] = "100%"

            if $scope.optionsVideo.align is "center center"
              $scope.styleFormats["top"]  = "auto"
              $scope.styleFormats["left"] = "50%"
              $scope.styleFormats["margin-top"]  = "0px"
              $scope.styleFormats["margin-left"] = "-#{ (height * assetRatio / 2) }px"

          $scope.videoBackground["background-size"] = "auto 100%"
          $scope.videoBackground["background-position"] = $scope.optionsVideo.align

      else

        width  = $element[0].clientWidth
        height = $element[0].clientHeight
        wrapperRatio = width / height

        if assetRatio > wrapperRatio
          $scope.styleFormats["width"] = '100%'
          $scope.styleFormats["height"] = if imagoUtils.isiOS() then '100%' else 'auto'
          $scope.videoBackground["background-size"] = '100% auto'
          $scope.videoBackground["background-position"] = $scope.optionsVideo.align
          $scope.videoBackground["width"] = "#{ width }px"
          $scope.videoBackground["height"] = "#{ parseInt(width / assetRatio, 10) }px"
        else
          $scope.styleFormats["width"] = if imagoUtils.isiOS() then '100%' else 'auto'
          $scope.styleFormats["height"] = '100%'
          $scope.videoBackground["background-size"] = 'auto 100%'
          $scope.videoBackground["background-position"] = $scope.optionsVideo.align
          $scope.videoBackground["width"] =  "#{ parseInt(height * assetRatio, 10) }px"
          $scope.videoBackground["height"] = "#{ height }px"

    videoElement = (video) ->
      $scope.videoFormats = []
      @codecs  = ['mp4', 'webm']
      codec = detectCodec()
      video.formats.sort( (a, b) -> return b.height - a.height )
      for format, i in video.formats
        continue unless codec is format.codec
        $scope.videoFormats.push(
          result =
            "src" : "http://#{tenant}.imagoapp.com/assets/api/play_redirect?uuid=#{video.id}&codec=#{format.codec}&quality=hd&max_size=#{format.size}"
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