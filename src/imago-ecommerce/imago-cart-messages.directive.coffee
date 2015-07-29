class ImagoCartMessages extends Directive

  constructor: ->

    return {

      scope:
        item: '=imagoCartMessages'
      templateUrl: '/imago/imago-cart-messages.html'

    }
