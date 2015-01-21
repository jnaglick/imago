class imagoFilterCurrency extends Directive

  constructor: ($filter) ->

    return {

      require: 'ngModel'
      link: (scope, elem, attrs, ctrl) ->

        ctrl.$formatters.unshift (a) ->
          $filter('number')(ctrl.$modelValue, 2)

        ctrl.$parsers.unshift (viewValue) ->
          if viewValue
            plainNumber = viewValue.replace(/[^\d|\-+|\.+]/g, "")
            elem.val $filter('number')(plainNumber, 2)
            plainNumber
          else
            return 0

    }
