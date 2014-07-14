class imagoContact extends Directive

  constructor: (imagoSubmit)->
    return {
      replace: true
      scope: {}
      transclude: true
      templateUrl: '/imagoWidgets/contact-widget.html'
      controller: ($scope, imagoSubmit) ->
        console.log 'imagoContact: ', $scope.submitForm

        $scope.submitForm = (isValid) =>
          if isValid
            console.log "send function will go here."
            console.log @getValues()

        getValues: () ->
          @formData =
            name:      $scope.name
            email:     $scope.email
            message:   $scope.message
            subscribe: $scope.subscribe
    }
