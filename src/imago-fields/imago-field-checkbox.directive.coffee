class ImagoFieldCheckbox extends Directive

  constructor: ->

    return {

      replace: true
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
          ngModelController.$setValidity('required', value) if attrs.required

    }