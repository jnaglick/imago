var ImagoFieldNumber;

ImagoFieldNumber = (function() {
  function ImagoFieldNumber() {
    return {
      require: 'ngModel',
      scope: {
        min: '=',
        max: '=',
        ngModel: '='
      },
      templateUrl: '/imago/imago-field-number.html',
      link: function(scope, element, attrs, ngModelController) {
        var checkValidity, updateModel;
        scope.label = '';
        if (angular.isDefined(attrs.label)) {
          attrs.$observe("label", function(value) {
            scope.label = " " + value;
            ngModelController.$render();
          });
        }
        ngModelController.$render = function() {
          checkValidity();
        };
        ngModelController.$formatters.push(function(value) {
          return parseInt(value, 10);
        });
        ngModelController.$parsers.push(function(value) {
          return parseInt(value, 10);
        });
        checkValidity = function() {
          var valid;
          valid = !(scope.isOverMin(true) || scope.isOverMax(true));
          return ngModelController.$setValidity('outOfBounds', valid);
        };
        updateModel = function(offset) {
          ngModelController.$setViewValue(ngModelController.$viewValue + offset);
          return ngModelController.$render();
        };
        scope.isOverMin = function() {
          if (ngModelController.$viewValue < scope.min + 1) {
            return true;
          }
        };
        scope.isOverMax = function() {
          if (ngModelController.$viewValue > scope.max - 1) {
            return true;
          }
        };
        scope.decrement = function() {
          return updateModel(-1);
        };
        scope.increment = function() {
          return updateModel(+1);
        };
        checkValidity();
        return scope.$watch('min+max', function() {
          return checkValidity();
        });
      }
    };
  }

  return ImagoFieldNumber;

})();

angular.module('imago').directive('imagoFieldNumber', [ImagoFieldNumber]);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imago-field-number.html","<div class=\"imago-field number\"><input type=\"text\" ng-model=\"ngModel\"/><button type=\"button\" ng-disabled=\"isOverMin()\" ng-click=\"decrement()\" class=\"decrement\"></button><button type=\"button\" ng-disabled=\"isOverMax()\" ng-click=\"increment()\" class=\"increment\"></button></div>");}]);