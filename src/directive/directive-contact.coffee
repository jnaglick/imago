class imagoContact extends Directive

  constructor: (imagoSubmit)->
    return {
      replace: true
      scope: {}
      transclude: true
      templateUrl: '/imagoWidgets/contact-widget.html'
      controller: ($scope, imagoSubmit) ->
        console.log 'imagoContact: ', imagoSubmit

        $scope.submitForm = (isValid) ->
          if isValid
            console.log "send function will go here."
            console.log $scope.nexContact
    }
