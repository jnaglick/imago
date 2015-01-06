class ImagoFieldCheckbox extends Directive

  constructor: ->

    return {

      require: 'ngModel'
      scope:
        ngModel: '='
      transclude: true
      templateUrl: '/imago/imago-field-checkbox.html'

      link: (scope, element, attrs, ngModelController) ->

        scope.update = (value) ->
          value = !value
          ngModelController.$setViewValue(value)
          ngModelController.$render()


    }