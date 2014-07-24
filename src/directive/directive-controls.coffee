class imagoControls extends Directive

  constructor: () ->
    return {
      replace: true
      require: '^imagoVideo'
      templateUrl: '/imagoWidgets/controls-widget.html'
      link: (scope, element, attrs, player) ->

        videoPlayer = angular.element(player)

        videoPlayer.bind 'loadedmetadata', () ->
          scope.duration = player.duration
          scope.currentTime = player.currentTime

        # scope.time = '00:00'
        # scope.seekTime = 0
        # scope.volumeInput = 100

        # updateTime = (sec) ->
        #   calc = []
        #   minutes = Math.floor(sec / 60)
        #   hours = Math.floor(sec / 3600)
        #   seconds = (if (sec is 0) then 0 else (sec % 60))
        #   seconds = Math.round(seconds)
        #   calc.push pad(hours)  if hours > 0
        #   calc.push pad(minutes)
        #   calc.push pad(seconds)
        #   result = calc.join ":"
        #   scope.time = result

        # pad = (num)->
          # return "0" + num  if num < 10
          # num

        scope.toggleSize = ->
          if scope.optionsVideo.size is 'hd'
            scope.optionsVideo.size = 'sd'
          else
            scope.optionsVideo.size = 'hd'

          scope.videoFormats.reverse()

        scope.seek = (time) =>
          scope.player.currentTime = parseFloat(time/100 * scope.player.duration)

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
