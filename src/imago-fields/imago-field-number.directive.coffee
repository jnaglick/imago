class ImagoFieldNumber extends Directive

  constructor: ->

    return {

      require: 'ngModel'
      scope:
        min: '='
        max: '='
        ngModel: '='
      transclude: true
      templateUrl: '/imago/imago-field-number.html'

      link: (scope, element, attrs, ngModelController) ->

        ngModelController.$render = ->
          checkValidity()

        ngModelController.$formatters.push (value) ->
          parseFloat value

        ngModelController.$parsers.push (value) ->
          parseFloat value

        checkValidity = ->
          valid = !(scope.isOverMin(true) || scope.isOverMax(true))
          ngModelController.$setValidity('outOfBounds', valid)

        change = (offset) ->
          value = ngModelController.$viewValue + offset
          scope.update(value)

        scope.update = (value) ->
          ngModelController.$setViewValue(value)
          ngModelController.$render()

        scope.isOverMin = ->
          return true if ngModelController.$viewValue < scope.min + 1

        scope.isOverMax = ->
          return true if ngModelController.$viewValue > scope.max - 1

        scope.decrement = ->
          change(-1)

        scope.increment = ->
          change(+1)

        checkValidity()

        scope.$watch 'min+max', ->
          checkValidity()

    }