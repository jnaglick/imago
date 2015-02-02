class Costs extends Directive

  constructor: ->

    return {

      scope:
        costs: '='
        currency: '='
      controllerAs: 'costs'
      templateUrl: '/imago/costs.html'

    }