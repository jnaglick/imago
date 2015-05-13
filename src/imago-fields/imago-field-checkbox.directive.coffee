class ImagoFieldCheckbox extends Directive

  constructor: ->

    return {

      replace: true
      require: 'ngModel'
      scope:
        ngModel: '='
        disabled: '=ngDisabled'
      transclude: true
      templateUrl: '/imago/imago-field-checkbox.html'

      link: (scope, element, attrs, ngModelController) ->

        scope.disabled = true if attrs.disabled

        scope.update = (value, disabled) ->
          return if disabled
          value = !value
          ngModelController.$setViewValue(value)
          ngModelController.$render()
          ngModelController.$setValidity('required', value) if attrs.required

    }