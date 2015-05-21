class Costs extends Directive

  constructor: ->

    return {

      scope:
        costs: '='
        currency: '='
        hideShippingIfNotCountry: '=?'
      controllerAs: 'costs'
      templateUrl: '/imago/costs.html'
      controller: ($scope, $element, $attrs) ->
        $scope.hideShippingIfNotCountry = false unless $attrs.hideShippingIfNotCountry

    }