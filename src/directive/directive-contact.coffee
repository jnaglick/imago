class imagoContact extends Directive

  constructor: ->
    return {
      replace: true
      scope: {}
      transclude: true
      templateUrl: '/imagoWidgets/contact-widget.html'
      controller: ($scope, imagoContact) ->

        $scope.submitForm = (isValid) ->
          if isValid
            console.log "send function will go here."
            console.log $scope.nexContact
    }
