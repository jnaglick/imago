var ImagoFieldCheckbox;

ImagoFieldCheckbox = (function() {
  function ImagoFieldCheckbox() {
    return {
      require: 'ngModel',
      scope: {
        ngModel: '='
      },
      transclude: true,
      templateUrl: '/imago/imago-field-checkbox.html',
      link: function(scope, element, attrs, ngModelController) {
        return scope.update = function(value) {
          value = !value;
          ngModelController.$setViewValue(value);
          return ngModelController.$render();
        };
      }
    };
  }

  return ImagoFieldCheckbox;

})();

angular.module('imago').directive('imagoFieldCheckbox', [ImagoFieldCheckbox]);

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
      transclude: true,
      templateUrl: '/imago/imago-field-number.html',
      link: function(scope, element, attrs, ngModelController) {
        var change, checkValidity;
        ngModelController.$render = function() {
          return checkValidity();
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
        change = function(offset) {
          var value;
          value = ngModelController.$viewValue + offset;
          return scope.update(value);
        };
        scope.update = function(value) {
          ngModelController.$setViewValue(value);
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
          return change(-1);
        };
        scope.increment = function() {
          return change(+1);
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

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imago-field-checkbox.html","<div class=\"imago-checkbox\"><label ng-class=\"{active: ngModel}\" class=\"topcoat-checkbox\"><div ng-click=\"update(ngModel)\" class=\"topcoat-checkbox__checkmark\"></div><span ng-transclude=\"ng-transclude\"></span></label></div>");
$templateCache.put("/imago/imago-field-number.html","<div class=\"imago-field number\"><div ng-transclude=\"ng-transclude\"></div><input type=\"text\" ng-model=\"ngModel\" ng-blur=\"update(ngModel)\"/><button type=\"button\" ng-disabled=\"isOverMin()\" ng-click=\"decrement()\" class=\"decrement\"></button><button type=\"button\" ng-disabled=\"isOverMax()\" ng-click=\"increment()\" class=\"increment\"></button></div>");}]);