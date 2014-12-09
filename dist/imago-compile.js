var imagoCompile;

imagoCompile = (function() {
  function imagoCompile($compile) {
    return function(scope, element, attrs) {
      var compile, htmlName;
      compile = function(newHTML) {
        newHTML = $compile(newHTML)(scope);
        return element.html("").append(newHTML);
      };
      htmlName = attrs.compile;
      return scope.$watch(htmlName, function(newHTML) {
        if (!newHTML) {
          return;
        }
        return compile(newHTML);
      });
    };
  }

  return imagoCompile;

})();

angular.module('imago').directive('imagoCompile', ['$compile', imagoCompile]);
