class imagoControls extends Directive

  constructor: ->
    return {
      replace: true
      require: '^imagoVideo'
      templateUrl: '/imago/controlsVideo.html'
      controller: 'imagoControlsController'
      controllerAs: 'imagocontrols'
      link: (scope, element, attrs) ->

        scope.seek = (value) ->
          scope.imagovideo.player.currentTime = value

        scope.onVolumeChange = (e) =>
          scope.imagovideo.player.volume = parseFloat(e / 100)

        scope.volumeDown = =>
          scope.imagovideo.player.volume = 0
          scope.volumeInput = 0

        scope.volumeUp = =>
          scope.imagovideo.player.volume = 1
          scope.volumeInput = 100

        scope.fullScreen = =>
          if scope.imagovideo.player.requestFullscreen
            scope.imagovideo.player.requestFullscreen();
          else if scope.imagovideo.player.webkitRequestFullscreen
            scope.imagovideo.player.webkitRequestFullscreen();
          else if scope.imagovideo.player.mozRequestFullScreen
            scope.imagovideo.player.mozRequestFullScreen();
          else if scope.imagovideo.player.msRequestFullscreen
            scope.imagovideo.player.msRequestFullscreen();

        element.bind 'mouseup', (e) ->
          e.stopPropagation()

        element.bind 'mousedown', (e) ->
          e.stopPropagation()
    }

class imagoControlsController extends Controller

  constructor: ($scope) ->

    videoPlayer = angular.element($scope.imagovideo.player)
    $scope.currentTime = 0

    videoPlayer.bind 'loadeddata', (e) ->
      $scope.duration = parseInt e.target.duration
      $scope.$digest()

    videoPlayer.bind 'timeupdate', (e) ->
      $scope.currentTime = e.target.currentTime
      $scope.$digest()

    videoPlayer.bind 'seeking', (e) ->
      $scope.currentTime = e.target.currentTime
      $scope.$digest()
