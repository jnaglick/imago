class imagoControls extends Directive

  constructor: () ->
    return {
      replace: true
      require: '^imagoVideo'
      templateUrl: '/imagoWidgets/controls-widget.html'
      link: (scope, element, attrs, player) ->

        videoPlayer = angular.element(player)

        videoPlayer.bind 'loadeddata', () ->
          scope.duration = player.duration
          scope.currentTime = 0
          scope.$apply()

        videoPlayer.bind 'timeupdate', (e) ->
          scope.currentTime = player.currentTime
          scope.$apply()

        scope.seek = (value) ->
          player.currentTime = value

        # scope.toggleSize = ->
        #   if scope.optionsVideo.size is 'hd'
        #     scope.optionsVideo.size = 'sd'
        #   else
        #     scope.optionsVideo.size = 'hd'
        #
        #   scope.videoFormats.reverse()

        # scope.seek = (time) =>
        #   scope.player.currentTime = parseFloat(time/100 * scope.player.duration)

        scope.onVolumeChange = (e) =>
          scope.player.volume = parseFloat(e / 100)

        scope.volumeDown = () =>
          scope.player.volume = 0
          scope.volumeInput = 0

        scope.volumeUp = () =>
          scope.player.volume = 1
          scope.volumeInput = 100

        scope.fullScreen = =>
          if scope.player.requestFullscreen
            scope.player.requestFullscreen();
          else if scope.player.webkitRequestFullscreen
            scope.player.webkitRequestFullscreen();
          else if scope.player.mozRequestFullScreen
            scope.player.mozRequestFullScreen();
          else if scope.player.msRequestFullscreen
            scope.player.msRequestFullscreen();
    }
