class ImagoFieldCurrency extends Directive

  constructor: ->

    return {

      require: 'ngModel'
      scope:
        currencies: '='
        ngModel: '='
        save: '&'
      transclude: true
      templateUrl: '/imago/imago-field-currency.html'

      link: (scope, element, attrs, ngModelController) ->

        return console.log 'no currencies!!' unless scope.currencies

        scope.currency = scope.currencies[0]

        scope.update = (value) ->
          for key of value
            value[key] = parseFloat value[key]
          scope.save()
          ngModelController.$setViewValue(value)
          ngModelController.$render()

    }