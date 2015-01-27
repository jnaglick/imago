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

class imagoFilterCurrency extends Directive

  constructor: ($filter) ->

    return {

      require: 'ngModel'
      link: (scope, elem, attrs, ctrl) ->

        ctrl.$formatters.unshift (a) ->
          ctrl.$modelValue = (ctrl.$modelValue / 100).toFixed(2)
          if isNaN(ctrl.$modelValue)
            ctrl.$modelValue = null
          return ctrl.$modelValue

        ctrl.$parsers.unshift (viewValue) ->
          if viewValue
            plainNumber = viewValue.replace(/[^\d|\-+|\.+]/g, "")
            plainNumber = parseFloat(plainNumber * 100)
            plainNumber
          else
            return 0.00

    }
