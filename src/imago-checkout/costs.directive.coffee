class Costs extends Directive

  constructor: ->

    return {

      scope:
        costs: '='
        currency: '='
      controllerAs: 'costs'
      templateUrl: '/app/views/costs.html'

    }