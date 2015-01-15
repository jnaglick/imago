var imagoSlider;

imagoSlider = (function() {
  function imagoSlider($rootScope, $q, $document, imagoModel, $interval) {
    return {
      transclude: true,
      scope: true,
      templateUrl: '/imago/imagoSlider.html',
      controller: function($scope) {
        return $scope.conf = {
          animation: 'fade',
          enablekeys: true,
          enablearrows: true,
          loop: true,
          current: 0,
          namespace: 'slider',
          autoplay: 0
        };
      },
      link: function(scope, element, attrs, ctrl, transclude) {
        var interval, slider, watcher;
        slider = element.children();
        transclude(scope, function(clone, scope) {
          return slider.append(clone);
        });
        angular.forEach(attrs, function(value, key) {
          if (value === 'true' || value === 'false') {
            value = JSON.parse(value);
          }
          return scope.conf[key] = value;
        });
        scope.currentIndex = scope.conf.current;
        scope.goPrev = function($event) {
          if (interval) {
            $interval.cancel(interval);
          }
          return scope.setCurrent(scope.currentIndex > 0 ? scope.currentIndex - 1 : parseInt(attrs.length) - 1);
        };
        scope.goNext = function($event) {
          if (interval) {
            $interval.cancel(interval);
          }
          return scope.setCurrent(scope.currentIndex < parseInt(attrs.length) - 1 ? scope.currentIndex + 1 : 0);
        };
        scope.getLast = function() {
          return parseInt(attrs.length) - 1;
        };
        scope.getCurrent = function() {
          return scope.currentIndex;
        };
        scope.setCurrent = (function(_this) {
          return function(index) {
            scope.action = (function() {
              switch (false) {
                case !(index === 0 && scope.currentIndex === (parseInt(attrs.length) - 1)):
                  return 'next';
                case !(index === (parseInt(attrs.length) - 1) && scope.currentIndex === 0):
                  return 'prev';
                case !(index > scope.currentIndex):
                  return 'next';
                case !(index < scope.currentIndex):
                  return 'prev';
                default:
                  return '';
              }
            })();
            scope.currentIndex = index;
            return $rootScope.$emit("" + scope.conf.namespace + ":changed", index);
          };
        })(this);
        if (scope.conf.autoplay) {
          interval = $interval(function() {
            return scope.setCurrent(scope.currentIndex < parseInt(attrs.length) - 1 ? scope.currentIndex + 1 : 0);
          }, parseInt(scope.conf.autoplay));
        }
        if (scope.conf.enablekeys) {
          $document.on('keydown', function(e) {
            switch (e.keyCode) {
              case 37:
                return scope.$apply(function() {
                  return scope.goPrev();
                });
              case 39:
                return scope.$apply(function() {
                  return scope.goNext();
                });
            }
          });
        }
        watcher = $rootScope.$on("" + scope.conf.namespace + ":change", function(event, index) {
          return scope.setCurrent(index);
        });
        return scope.$on('$destroy', function() {
          if (interval) {
            $interval.cancel(interval);
          }
          return watcher();
        });
      }
    };
  }

  return imagoSlider;

})();

angular.module('imago').directive('imagoSlider', ['$rootScope', '$q', '$document', 'imagoModel', '$interval', imagoSlider]);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imagoSlider.html","<div ng-class=\"[conf.animation, action]\" hm-swipe-left=\"goNext\" hm-swipe-right=\"goPrev\" class=\"imagoslider\"><div ng-show=\"conf.enablearrows\" hm-tap=\"goPrev\" stop-propagation=\"stop-propagation\" class=\"prev\"></div><div ng-show=\"conf.enablearrows\" hm-tap=\"goNext\" stop-propagation=\"stop-propagation\" class=\"next\"></div></div>");}]);