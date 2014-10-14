class imagoControls extends Directive

  constructor: () ->
    return {
      replace: true
      scope: true
      require: '^imagoVideo'
      templateUrl: '/imagoWidgets/controls-widget.html'
      controller: ($scope) ->

        videoPlayer = angular.element($scope.player)
        $scope.currentTime = 0

        videoPlayer.bind 'loadeddata', () ->
          $scope.duration = parseInt $scope.player.duration
          $scope.$apply()

        videoPlayer.bind 'timeupdate', (e) ->
          $scope.currentTime = $scope.player.currentTime
          $scope.$apply()

      link: (scope, element, attrs) ->
        element.bind 'swipe', (e) ->
          e.stopPropagation()

        scope.seek = (value) ->
          scope.player.currentTime = value

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
