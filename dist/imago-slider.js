var imagoSlider, imagoSliderController;

imagoSlider = (function() {
  function imagoSlider($rootScope, $document, $interval, $location) {
    return {
      transclude: true,
      scope: true,
      templateUrl: '/imago/imagoSlider.html',
      controller: 'imagoSliderController as imagoslider',
      bindToController: {
        assets: '=imagoSlider',
        length: '@?'
      },
      link: function(scope, element, attrs, ctrl, transclude) {
        var key, keyboardBinding, slider, value, watcher;
        slider = element.children();
        if (_.isArray(scope.imagoslider.assets)) {
          scope.imagoslider.length = scope.imagoslider.assets.length;
        }
        transclude(scope, function(clone, scope) {
          return slider.append(clone);
        });
        for (key in attrs) {
          value = attrs[key];
          if (key.charAt(0) === '$') {
            continue;
          }
          if (value === 'true' || value === 'false') {
            value = JSON.parse(value);
          }
          scope.imagoslider.conf[key] = value;
        }
        watcher = scope.$watch('assets', function(data) {
          if (!data || !_.isArray(data)) {
            return;
          }
          scope.imagoslider.length = data.length;
          return console.log('data', data);
        });
        scope.imagoslider.conf.siblings = !!(scope.imagoslider.conf.next && scope.imagoslider.conf.prev);
        if ($location.path().indexOf('last')) {
          scope.currentIndex = parseInt(scope.imagoslider.conf.current);
        } else {
          scope.currentIndex = scope.getLast();
        }
        scope.clearInterval = function() {
          if (!scope.imagoslider.conf.interval) {
            return;
          }
          return $interval.cancel(scope.imagoslider.conf.interval);
        };
        scope.goPrev = function(ev) {
          if (typeof ev === 'object') {
            scope.clearInterval();
            ev.stopPropagation();
          }
          if (!scope.imagoslider.conf.loop) {
            return scope.setCurrent(scope.currentIndex > 0 ? scope.currentIndex - 1 : scope.currentIndex);
          } else if (scope.imagoslider.conf.loop && !scope.imagoslider.conf.siblings) {
            return scope.setCurrent(scope.currentIndex > 0 ? scope.currentIndex - 1 : parseInt(scope.imagoslider.length) - 1);
          } else if (scope.imagoslider.conf.loop && scope.imagoslider.conf.siblings) {
            if (scope.currentIndex > 0) {
              return scope.setCurrent(scope.currentIndex - 1);
            } else {
              return $location.path(scope.imagoslider.conf.prev);
            }
          }
        };
        scope.goNext = function(ev) {
          if (typeof ev === 'object') {
            scope.clearInterval();
            ev.stopPropagation();
          }
          if (!scope.imagoslider.conf.loop) {
            return scope.setCurrent(scope.currentIndex < parseInt(scope.imagoslider.length) - 1 ? scope.currentIndex + 1 : scope.currentIndex);
          } else if (scope.imagoslider.conf.loop && !scope.imagoslider.conf.siblings) {
            return scope.setCurrent(scope.currentIndex < parseInt(scope.imagoslider.length) - 1 ? scope.currentIndex + 1 : 0);
          } else if (scope.imagoslider.conf.loop && scope.imagoslider.conf.siblings) {
            if (scope.currentIndex < parseInt(scope.imagoslider.length) - 1) {
              return scope.setCurrent(scope.currentIndex + 1);
            } else {
              return $location.path(scope.imagoslider.conf.next);
            }
          }
        };
        scope.getLast = function() {
          return parseInt(scope.imagoslider.length) - 1;
        };
        scope.getCurrent = function() {
          return scope.currentIndex;
        };
        scope.setCurrent = (function(_this) {
          return function(index) {
            scope.action = (function() {
              switch (false) {
                case !(index === 0 && scope.currentIndex === (parseInt(scope.imagoslider.length) - 1) && !scope.imagoslider.conf.siblings):
                  return 'next';
                case !(index === (parseInt(scope.imagoslider.length) - 1) && scope.currentIndex === 0 && !scope.imagoslider.conf.siblings):
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
            return $rootScope.$emit(scope.imagoslider.conf.namespace + ":changed", index);
          };
        })(this);
        if (!_.isUndefined(attrs.autoplay)) {
          scope.$watch(attrs.autoplay, (function(_this) {
            return function(value) {
              if (parseInt(value) > 0) {
                return scope.imagoslider.conf.interval = $interval(scope.goNext, parseInt(value));
              } else {
                return scope.clearInterval();
              }
            };
          })(this));
        }
        keyboardBinding = function(e) {
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
        };
        if (scope.imagoslider.conf.enablekeys) {
          $document.on('keydown', keyboardBinding);
        }
        watcher = $rootScope.$on(scope.imagoslider.conf.namespace + ":change", function(event, index) {
          scope.clearInterval();
          return scope.setCurrent(index);
        });
        return scope.$on('$destroy', function() {
          $document.off("keydown", keyboardBinding);
          scope.clearInterval();
          return watcher();
        });
      }
    };
  }

  return imagoSlider;

})();

imagoSliderController = (function() {
  function imagoSliderController() {
    this.conf = {
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
  }

  return imagoSliderController;

})();

angular.module('imago').directive('imagoSlider', ['$rootScope', '$document', '$interval', '$location', imagoSlider]).controller('imagoSliderController', [imagoSliderController]);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imagoSlider.html","<div ng-class=\"[conf.animation, action]\" ng-swipe-left=\"goNext($event)\" ng-swipe-right=\"goPrev($event)\" class=\"imagoslider\"><div ng-show=\"conf.enablearrows\" ng-click=\"goPrev($event)\" analytics-on=\"click\" analytics-event=\"Previous Slide\" class=\"prev\"></div><div ng-show=\"conf.enablearrows\" ng-click=\"goNext($event)\" analytics-on=\"click\" analytics-event=\"Next Slide\" class=\"next\"></div></div>");}]);