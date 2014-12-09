class imagoContact extends Directive

  constructor: (imagoSubmit)->
    return {
      replace: true
      scope: {}
      templateUrl: '/imago/contactWidget.html'
      controller: ($scope) ->

        $scope.submitForm = (isValid) =>
          if isValid
            imagoSubmit.send($scope.contact)

    }
