class imagoContact extends Directive

  constructor: (imagoSubmit)->
    return {
      replace: true
      scope: {}
      templateUrl: '/contact-widget.html'
      controller: ($scope) ->

        $scope.submitForm = (isValid) =>
          if isValid
            imagoSubmit.send($scope.contact)

    }
