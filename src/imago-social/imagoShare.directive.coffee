class imagoShare extends Directive

  constructor: () ->

    return {
      scope:
        asset: "="
      templateUrl: '/imago/imagoShare.html'
      controller: ($scope, $element, $attrs, $location) ->
        $scope.location = $location.absUrl()
        watcher = $scope.$watch 'asset', (value) =>
          return unless value
          for key of $attrs.$attr
            unless key is 'asset'
              $scope[key] = true
          watcher()
    }