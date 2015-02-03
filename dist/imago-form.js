var imagoForm;

imagoForm = (function() {
  function imagoForm(imagoSubmit) {
    return {
      scope: {
        data: '='
      },
      replace: true,
      transclude: true,
      templateUrl: '/imago/imagoForm.html',
      link: function(scope, element, attr, cntrl, transclude) {
        var defaults;
        defaults = scope.data;
        transclude(scope, function(clone, scope) {
          return element.append(clone);
        });
        return scope.submitForm = (function(_this) {
          return function(isValid) {
            if (isValid) {
              return imagoSubmit.send(scope.data).then(function(result) {
                scope.status = result.status;
                scope.error = result.message || '';
                if (scope.status) {
                  return scope.data = defaults;
                }
              });
            }
          };
        })(this);
      }
    };
  }

  return imagoForm;

})();

angular.module('imago').directive('imagoForm', ['imagoSubmit', imagoForm]);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imagoForm.html","<div class=\"imagoForm\"></div>");}]);