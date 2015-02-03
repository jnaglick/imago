class imagoForm extends Directive

  constructor: (imagoSubmit)->
    return {
      scope: {
        data: '='
      }
      replace: true
      transclude: true
      templateUrl: '/imago/imagoForm.html'
      link: (scope, element, attr, cntrl, transclude) ->

        transclude scope, (clone, scope) ->
          element.append(clone)

        scope.submitForm = (isValid) =>
          if isValid
            imagoSubmit.send(scope.data).then (result) =>
              scope.status = result.status
              scope.error = result.message or ''

    }
