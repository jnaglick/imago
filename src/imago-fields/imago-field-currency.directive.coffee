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

        decimalPlaces = (num) ->
          match = ("" + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/)
          return 0  unless match
          Math.max 0, ((if match[1] then match[1].length else 0)) - ((if match[2] then +match[2] else 0))

        scope.currency = scope.currencies[0]

        scope.update = (value) ->
          for key of value
            value[key] = parseFloat value[key]
            console.log 'decimalPlaces', decimalPlaces(value[key])
          console.log 'value', value
          ngModelController.$setViewValue(value)
          ngModelController.$render()
          scope.save()

    }