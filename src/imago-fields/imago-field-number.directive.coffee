class ImagoFieldNumber extends Directive

  constructor: ->

    return {

      require: 'ngModel'
      scope:
        min: '='
        max: '='
        ngModel: '='
      templateUrl: '/imago/imago-field-number.html'

      link: (scope, element, attrs, ngModelController) ->

        scope.label = ''

        if angular.isDefined(attrs.label)
          attrs.$observe "label", (value) ->
            scope.label = " " + value
            ngModelController.$render()
            return

        ngModelController.$render = ->
          # update the validation status
          checkValidity()
          return

        # when model change, cast to integer
        ngModelController.$formatters.push (value) ->
          parseInt value, 10

        # when view change, cast to integer
        ngModelController.$parsers.push (value) ->
          parseInt value, 10

        checkValidity = ->
          valid = !(scope.isOverMin(true) || scope.isOverMax(true))
          ngModelController.$setValidity('outOfBounds', valid)

        updateModel = (offset) ->
          ngModelController.$setViewValue(ngModelController.$viewValue + offset)
          ngModelController.$render()

        scope.isOverMin = ->
          # console.log 'isOverMin', scope.min, ngModelController.$viewValue
          return true if ngModelController.$viewValue < scope.min + 1

        scope.isOverMax = ->
          # console.log 'isOverMax', scope.max, ngModelController.$viewValue
          return true if ngModelController.$viewValue > scope.max - 1

        scope.decrement = ->
          updateModel(-1)

        scope.increment = ->
          updateModel(+1)

        checkValidity()

        scope.$watch 'min+max', ->
            checkValidity()

    }