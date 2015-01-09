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

var ImagoFieldCurrency;

ImagoFieldCurrency = (function() {
  function ImagoFieldCurrency() {
    return {
      require: 'ngModel',
      scope: {
        currencies: '=',
        ngModel: '=',
        save: '&'
      },
      transclude: true,
      templateUrl: '/imago/imago-field-currency.html',
      link: function(scope, element, attrs, ngModelController) {
        if (!scope.currencies) {
          return console.log('no currencies!!');
        }
        scope.currency = scope.currencies[0];
        return scope.update = function(value) {
          var key;
          for (key in value) {
            value[key] = parseFloat(value[key]);
          }
          scope.save();
          ngModelController.$setViewValue(value);
          return ngModelController.$render();
        };
      }
    };
  }

  return ImagoFieldCurrency;

})();

angular.module('imago').directive('imagoFieldCurrency', [ImagoFieldCurrency]);

var ImagoFieldDate;

ImagoFieldDate = (function() {
  function ImagoFieldDate() {
    return {
      require: 'ngModel',
      scope: {
        min: '=',
        max: '=',
        ngModel: '='
      },
      transclude: true,
      templateUrl: '/imago/imago-field-date.html',
      link: function(scope, element, attrs, ngModelController) {
        return scope.update = function(value) {
          ngModelController.$setViewValue(value);
          return ngModelController.$render();
        };
      }
    };
  }

  return ImagoFieldDate;

})();

angular.module('imago').directive('imagoFieldDate', [ImagoFieldDate]);

var ImagoFieldEmail;

ImagoFieldEmail = (function() {
  function ImagoFieldEmail() {
    return {
      require: 'ngModel',
      scope: {
        ngModel: '='
      },
      transclude: true,
      templateUrl: '/imago/imago-field-email.html',
      link: function(scope, element, attrs, ngModelController) {
        if (attrs.required) {
          scope.required = true;
        }
        return scope.update = function(value) {
          ngModelController.$setViewValue(value);
          return ngModelController.$render();
        };
      }
    };
  }

  return ImagoFieldEmail;

})();

angular.module('imago').directive('imagoFieldEmail', [ImagoFieldEmail]);

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
          return parseFloat(value);
        });
        ngModelController.$parsers.push(function(value) {
          return parseFloat(value);
        });
        checkValidity = function() {
          var valid;
          valid = !(scope.isLimitMin(true) || scope.isLimitMax(true));
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
        scope.isLimitMin = function() {
          if (ngModelController.$viewValue < scope.min) {
            return true;
          }
        };
        scope.isLimitMax = function() {
          if (ngModelController.$viewValue > scope.max) {
            return true;
          }
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

var ImagoFieldString;

ImagoFieldString = (function() {
  function ImagoFieldString() {
    return {
      require: 'ngModel',
      scope: {
        ngModel: '='
      },
      transclude: true,
      templateUrl: '/imago/imago-field-string.html',
      link: function(scope, element, attrs, ngModelController) {
        return scope.update = function(value) {
          ngModelController.$setViewValue(value);
          return ngModelController.$render();
        };
      }
    };
  }

  return ImagoFieldString;

})();

angular.module('imago').directive('imagoFieldString', [ImagoFieldString]);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imago-field-checkbox.html","<div class=\"imago-checkbox\"><label ng-class=\"{active: ngModel}\" ng-click=\"update(ngModel)\" class=\"topcoat-checkbox\"><div class=\"topcoat-checkbox__checkmark\"></div><span ng-transclude=\"ng-transclude\"></span></label></div>");
$templateCache.put("/imago/imago-field-currency.html","<div class=\"imago-field currency\"><div ng-transclude=\"ng-transclude\"></div><select ng-model=\"currency\" ng-options=\"currency for currency in currencies\"></select><input type=\"text\" ng-model=\"ngModel[currency]\" ng-blur=\"update(ngModel)\" ng-disabled=\"!currency\"/></div>");
$templateCache.put("/imago/imago-field-date.html","<div class=\"imago-field date\"><div ng-transclude=\"ng-transclude\"></div><input type=\"text\" date-time=\"date-time\" dismiss=\"true\" ng-model=\"ngModel\" ng-blur=\"update(ngModel)\" view=\"date\" min-view=\"date\" partial=\"true\"/></div>");
$templateCache.put("/imago/imago-field-email.html","<div class=\"imago-field email\"><div ng-transclude=\"ng-transclude\"></div><input type=\"email\" ng-model=\"ngModel\" ng-blur=\"update(ngModel)\" ng-required=\"required\"/></div>");
$templateCache.put("/imago/imago-field-number.html","<div class=\"imago-field number\"><div ng-transclude=\"ng-transclude\"></div><input type=\"text\" ng-model=\"ngModel\" ng-blur=\"update(ngModel)\"/><button type=\"button\" ng-disabled=\"isOverMin()\" ng-click=\"decrement()\" class=\"decrement\"></button><button type=\"button\" ng-disabled=\"isOverMax()\" ng-click=\"increment()\" class=\"increment\"></button></div>");
$templateCache.put("/imago/imago-field-string.html","<div class=\"imago-field string\"><div ng-transclude=\"ng-transclude\"></div><input type=\"text\" ng-model=\"ngModel\" ng-change=\"update(ngModel)\"/></div>");}]);