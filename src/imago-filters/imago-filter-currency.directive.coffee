class imagoFilterCurrency extends Directive

  constructor: ($filter) ->

    return {

      require: 'ngModel'
      link: (scope, elem, attrs, ctrl) ->

        ctrl.$formatters.unshift (a) ->
          ctrl.$modelValue = (ctrl.$modelValue / 100).toFixed(2)
          if isNaN(ctrl.$modelValue)
            ctrl.$modelValue = null
          console.log 'ctrl.$modelValue', ctrl.$modelValue
          return ctrl.$modelValue

        ctrl.$parsers.unshift (viewValue) ->
          if viewValue
            plainNumber = viewValue.replace(/[^\d|\-+|\.+]/g, "")
            plainNumber = parseFloat(plainNumber * 100)
            plainNumber
          else
            return 0.00

    }
