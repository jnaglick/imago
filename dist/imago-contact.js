var imagoContact;

imagoContact = (function() {
  function imagoContact(imagoSubmit) {
    return {
      replace: true,
      scope: {},
      templateUrl: '/contact-widget.html',
      controller: function($scope) {
        return $scope.submitForm = (function(_this) {
          return function(isValid) {
            if (isValid) {
              return imagoSubmit.send($scope.contact);
            }
          };
        })(this);
      }
    };
  }

  return imagoContact;

})();

angular.module('imago').directive('imagoContact', ['imagoSubmit', imagoContact]);
