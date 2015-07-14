class Costs extends Directive

  constructor: ->

    return {

      scope:
        costs: '='
        currency: '='
        hideIfNotCountry: '=?'
      templateUrl: '/imago/costs.html'
      controller: 'costsController as costs'

    }


class CostsController extends Controller

  constructor: ($scope, $element, $attrs) ->
    if not $attrs.hideIfNotCountry
      $scope.hideIfNotCountry = false
      $scope.hideCountryDefined = true
    else if not $scope.hideIfNotCountry
      $scope.$watch 'hideIfNotCountry', (value) ->
        $scope.hideCountryDefined = angular.isDefined(value)