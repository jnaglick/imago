class imagoCart extends Directive

  constructor: ->

    return {

      replace: true
      scope:
        min: '='
        max: '='
        ngModel: '='
      transclude: true
      templateUrl: '/imago/imago-cart.html'
      controller: 'imagoCartController as cart'

    }

class imagoCartController extends Controller

  constructor: (@imagoCart) ->