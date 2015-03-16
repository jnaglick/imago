class imagoShare extends Directive

  constructor: ($location) ->

    return {

      scope:
        asset: "="
      templateUrl: '/imago/imagoShare.html'
      controllerAs: 'imagoshare'
      controller: ($scope, $element, $attrs) ->
        @location = $location.absUrl()

        return console.log 'You need to specify one service at least.' unless $attrs.imagoShare

        options = $scope.$eval $attrs.imagoShare

        if _.isArray options
          for item in options
            @[item] = true
        else if $attrs.imagoShare is 'all'
          @all = true

    }