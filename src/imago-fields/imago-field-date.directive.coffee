class ImagoFieldDate extends Directive

  constructor: ->

    return {

      replace: true
      require: 'ngModel'
      scope:
        min: '='
        max: '='
        ngModel: '='
      transclude: true
      templateUrl: '/imago/imago-field-date.html'
      link: (scope, element, attrs, ngModelController) ->

        scope.update = (value) ->
          ngModelController.$setViewValue(value)
          ngModelController.$render()

    }