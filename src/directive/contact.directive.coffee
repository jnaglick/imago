class imagoContact extends Directive

  constructor: (imagoSubmit)->
    return {
      replace: true
      scope: {}
      templateUrl: '/imagoWidgets/contact-widget.html'
      controller: ($scope) ->

        $scope.submitForm = (isValid) =>
          if isValid
            imagoSubmit.send($scope.contact)

    }
