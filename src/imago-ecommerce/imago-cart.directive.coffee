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

  constructor: (@imagoCart, @$location) ->

    @clickOut = (evt, className) ->
      return if evt.target.tagName is 'BUTTON' and evt.target.className.indexOf(className) isnt -1
      @imagoCart.show = false

  goToProduct: (url) ->
    @$location.url(url)

