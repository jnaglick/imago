class ImagoFieldString extends Directive

  constructor: ->

    return {

      replace: true
      require: 'ngModel'
      scope:
        ngModel: '='
      transclude: true
      templateUrl: '/imago/imago-field-string.html'

      link: (scope, element, attrs, ngModelController) ->

        scope.update = (value) ->
          ngModelController.$setViewValue(value)
          ngModelController.$render()

    }