var imagoCompile;

imagoCompile = (function() {
  function imagoCompile($compile) {
    return function(scope, element, attrs) {
      return scope.$watch(attrs.imagoCompile, function(html) {
        if (!html) {
          return;
        }
        element.html(html);
        return $compile(element.contents())(scope);
      });
    };
  }

  return imagoCompile;

})();

angular.module('imago').directive('imagoCompile', ['$compile', imagoCompile]);
