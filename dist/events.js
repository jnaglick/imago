var ResponsiveEvents;

ResponsiveEvents = (function() {
  function ResponsiveEvents($window) {
    return {
      restrict: 'A',
      link: function($scope) {
        var onMouseWheelStart, onResizeStart, onScrollStart, w;
        w = angular.element($window);
        onResizeStart = (function(_this) {
          return function(e) {
            var resizeStop;
            if (_this.resizeing) {
              return;
            }
            $scope.$broadcast('resizestart');
            _this.resizeing = true;
            return resizeStop = $scope.$on('resizestop', function() {
              _this.resizeing = false;
              return resizeStop();
            });
          };
        })(this);
        onScrollStart = (function(_this) {
          return function(e) {
            var scrollStop;
            if (_this.scrolling) {
              return;
            }
            $scope.$broadcast('scrollstart');
            _this.scrolling = true;
            return scrollStop = $scope.$on('scrollstop', function() {
              _this.scrolling = false;
              return scrollStop();
            });
          };
        })(this);
        onMouseWheelStart = (function(_this) {
          return function(e) {
            var mouseStop;
            if (_this.isMouseWheeling) {
              return;
            }
            $scope.$broadcast('mousewheelstart');
            _this.isMouseWheeling = true;
            return mouseStop = $scope.$on('mousewheelstop', function() {
              _this.isMouseWheeling = false;
              return mouseStop();
            });
          };
        })(this);
        w.on('resize', function() {
          return $scope.$broadcast('resize');
        });
        w.on('resize', onResizeStart);
        w.on('resize', _.debounce((function() {
          return $scope.$broadcast('resizestop');
        }), 200));
        w.on('resize', _.throttle((function() {
          return $scope.$broadcast('resizelimit');
        }), 150));
        w.on('scroll', onScrollStart);
        w.on('scroll', _.debounce((function() {
          return $scope.$broadcast('scrollstop');
        }), 200));
        w.on('scroll', _.throttle((function() {
          return $scope.$broadcast('scrolllimit');
        }), 150));
        w.on('mousewheel', onMouseWheelStart);
        w.on('mousewheel', _.debounce((function() {
          return $scope.$broadcast('mousewheelstop');
        }), 200));
        return w.on('mousewheel', _.throttle((function() {
          return $scope.$broadcast('mousewheellimit');
        }), 150));
      }
    };
  }

  return ResponsiveEvents;

})();

angular.module('imago').directive('responsiveEvents', ['$window', ResponsiveEvents]);

var StopPropagation;

StopPropagation = (function() {
  function StopPropagation() {
    return {
      link: function(scope, element, attr) {
        element.bind('click', function(e) {
          return e.stopPropagation();
        });
        return element.bind('dblclick', function(e) {
          return e.stopPropagation();
        });
      }
    };
  }

  return StopPropagation;

})();

angular.module('imago').directive('stopPropagation', [StopPropagation]);
