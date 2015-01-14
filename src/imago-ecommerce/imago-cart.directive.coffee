class imagoCart extends Directive

  constructor: (imagoCart) ->

    return {

      replace: true
      scope:
        min: '='
        max: '='
        ngModel: '='
      transclude: true
      controllerAs: 'cart'
      templateUrl: '/imago/imago-cart.html'
      controller: ($scope) ->

        @utils  = imagoCart

    }