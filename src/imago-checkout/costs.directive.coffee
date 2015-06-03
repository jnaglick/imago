class Costs extends Directive

  constructor: ->

    return {

      scope:
        costs: '='
        currency: '='
        hideIfNotCountry: '=?'
      controllerAs: 'costs'
      templateUrl: '/imago/costs.html'
      controller: ($scope, $element, $attrs) ->
        if not $attrs.hideIfNotCountry
          $scope.hideIfNotCountry = false
        else if not $scope.hideIfNotCountry
          $scope.$watch 'hideIfNotCountry', (value) ->
            $scope.hideCountryDefined = angular.isDefined(value)


    }