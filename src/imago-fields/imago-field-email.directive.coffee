class ImagoFieldEmail extends Directive

  constructor: ->

    return {

      replace: true
      require: 'ngModel'
      scope:
        ngModel: '='
      transclude: true
      templateUrl: '/imago/imago-field-email.html'
      link: (scope, element, attrs, ngModelController) ->

        scope.required = true if attrs.required

        scope.update = (value) ->
          ngModelController.$setViewValue(value)
          ngModelController.$render()

    }