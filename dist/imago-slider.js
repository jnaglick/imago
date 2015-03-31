var imagoSlider;

imagoSlider = (function() {
  function imagoSlider($rootScope, $q, $document, imagoModel, $interval, $location) {
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
          autoplay: 0,
          next: null,
          prev: null
        };
      },
      link: function(scope, element, attrs, ctrl, transclude) {
        var slider, watcher;
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
        scope.conf.siblings = !!(scope.conf.next && scope.conf.prev);
        if ($location.path().indexOf('last')) {
          scope.currentIndex = scope.conf.current;
        } else {
          scope.currentIndex = scope.getLast();
        }
        scope.clearInterval = function() {
          if (!scope.conf.interval) {
            return;
          }
          return $interval.cancel(scope.conf.interval);
        };
        scope.goPrev = function(ev) {
          if (_.isPlainObject(ev)) {
            scope.clearInterval();
          }
          if (!scope.conf.loop) {
            return scope.setCurrent(scope.currentIndex > 0 ? scope.currentIndex - 1 : scope.currentIndex);
          } else if (scope.conf.loop && !scope.conf.siblings) {
            return scope.setCurrent(scope.currentIndex > 0 ? scope.currentIndex - 1 : parseInt(attrs.length) - 1);
          } else if (scope.conf.loop && scope.conf.siblings) {
            if (scope.currentIndex > 0) {
              return scope.setCurrent(scope.currentIndex - 1);
            } else {
              return $location.path(scope.conf.prev);
            }
          }
        };
        scope.goNext = function(ev) {
          if (_.isPlainObject(ev)) {
            scope.clearInterval();
          }
          if (!scope.conf.loop) {
            return scope.setCurrent(scope.currentIndex < parseInt(attrs.length) - 1 ? scope.currentIndex + 1 : scope.currentIndex);
          } else if (scope.conf.loop && !scope.conf.siblings) {
            return scope.setCurrent(scope.currentIndex < parseInt(attrs.length) - 1 ? scope.currentIndex + 1 : 0);
          } else if (scope.conf.loop && scope.conf.siblings) {
            if (scope.currentIndex < parseInt(attrs.length) - 1) {
              return scope.setCurrent(scope.currentIndex + 1);
            } else {
              return $location.path(scope.conf.next);
            }
          }
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
                case !(index === 0 && scope.currentIndex === (parseInt(attrs.length) - 1) && !scope.conf.siblings):
                  return 'next';
                case !(index === (parseInt(attrs.length) - 1) && scope.currentIndex === 0 && !scope.conf.siblings):
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
            return $rootScope.$emit(scope.conf.namespace + ":changed", index);
          };
        })(this);
        if (!_.isUndefined(attrs.autoplay)) {
          scope.$watch(attrs.autoplay, (function(_this) {
            return function(value) {
              if (parseInt(value) > 0) {
                return scope.conf.interval = $interval(scope.goNext, parseInt(value));
              } else {
                return scope.clearInterval();
              }
            };
          })(this));
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
        watcher = $rootScope.$on(scope.conf.namespace + ":change", function(event, index) {
          scope.clearInterval();
          return scope.setCurrent(index);
        });
        return scope.$on('$destroy', function() {
          scope.clearInterval();
          return watcher();
        });
      }
    };
  }

  return imagoSlider;

})();

angular.module('imago').directive('imagoSlider', ['$rootScope', '$q', '$document', 'imagoModel', '$interval', '$location', imagoSlider]);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imagoSlider.html","<div ng-class=\"[conf.animation, action]\" hm-swipeleft=\"goNext\" hm-swiperight=\"goPrev\" hm-recognizer-options=\"{&quot;directions&quot;: &quot;DIRECTION_HORIZONTAL&quot;}\" class=\"imagoslider\"><div ng-show=\"conf.enablearrows\" hm-tap=\"goPrev\" class=\"prev\"></div><div ng-show=\"conf.enablearrows\" hm-tap=\"goNext\" class=\"next\"></div></div>");}]);