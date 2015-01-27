class ImagoFieldCurrency extends Directive

  constructor: ($filter) ->

    return {

      replace: true
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
          ngModelController.$setViewValue(value)
          ngModelController.$render()
          scope.save()

    }