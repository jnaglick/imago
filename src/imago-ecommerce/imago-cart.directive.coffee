class imagoCart extends Directive

  constructor: ->

    return {

      replace: true
      scope:
        min: '='
        max: '='
        ngModel: '='
      transclude: true
      controllerAs: 'cart'
      templateUrl: '/imago/imago-cart.html'
      controller: 'imagoCartController'

    }

class imagoCartController extends Controller

  constructor: (@imagoCart) ->