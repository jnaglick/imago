var ImagoVirtualList;

ImagoVirtualList = (function() {
  function ImagoVirtualList($window, $rootScope, $timeout) {
    return {
      scope: true,
      templateUrl: '/imago/imago-virtual-list.html',
      transclude: true,
      controller: function() {},
      controllerAs: 'imagovirtuallist',
      bindToController: {
        data: '=',
        rowHeight: '=',
        rowWidth: '='
      },
      link: function(scope, element, attrs, ctrl, transclude) {
        var watchers;
        transclude(scope, function(clone) {
          return element.children().append(clone);
        });
        scope.scrollTop = 0;
        scope.width = element[0].clientWidth;
        scope.visibleProvider = [];
        scope.cellsPerPage = 0;
        scope.numberOfCells = 0;
        scope.canvasHeight = {};
        scope.times = 0;
        scope.total = 0;
        scope.init = function() {
          if (!scope.imagovirtuallist.data) {
            return;
          }
          return $timeout(function() {
            var cellsPerHeight, testDiv;
            testDiv = document.createElement('div');
            testDiv.className = attrs.classItem;
            testDiv.id = 'virtual-list-test-div';
            element.append(testDiv);
            scope.rowWidth = testDiv.clientWidth;
            scope.rowHeight = testDiv.clientHeight;
            angular.element(element[0].querySelector('#virtual-list-test-div')).remove();
            if (!scope.width) {
              scope.width = element[0].clientWidth;
            }
            if (!scope.height) {
              scope.height = element[0].clientHeight;
            }
            if (attrs.imagoVirtualListContainer) {
              element[0].addEventListener('scroll', scope.onScrollContainer);
            } else {
              angular.element($window).on('scroll', scope.onScrollWindow);
            }
            scope.itemsPerRow = Math.round(scope.width / scope.rowWidth);
            scope.canvasHeight = {
              height: Math.ceil((scope.imagovirtuallist.data.length * scope.rowHeight) / scope.itemsPerRow) + 'px'
            };
            cellsPerHeight = Math.round(scope.height / scope.rowHeight);
            scope.cellsPerPage = cellsPerHeight * scope.itemsPerRow;
            if (cellsPerHeight === Math.ceil(scope.height / scope.rowHeight)) {
              scope.numberOfCells = 3 * scope.cellsPerPage;
            } else {
              scope.numberOfCells = 4 * scope.cellsPerPage;
            }
            scope.margin = 0;
            return scope.updateDisplayList();
          }, 50);
        };
        scope.updateDisplayList = function() {
          var cellsToCreate, chunks, data, findIndex, firstCell, i, idx, l, results;
          firstCell = Math.max(Math.floor(scope.scrollTop / scope.rowHeight) - (Math.round(scope.height / scope.rowHeight)), 0);
          cellsToCreate = Math.min(firstCell + scope.numberOfCells, scope.numberOfCells);
          data = firstCell * scope.itemsPerRow;
          scope.visibleProvider = scope.imagovirtuallist.data.slice(data, data + cellsToCreate);
          chunks = _.chunk(scope.visibleProvider, scope.itemsPerRow);
          i = 0;
          l = scope.visibleProvider.length;
          results = [];
          while (i < l) {
            findIndex = function() {
              var chunk, idx, indexChunk, indexItem, item, j, k, len, len1;
              for (indexChunk = j = 0, len = chunks.length; j < len; indexChunk = ++j) {
                chunk = chunks[indexChunk];
                for (indexItem = k = 0, len1 = chunk.length; k < len1; indexItem = ++k) {
                  item = chunk[indexItem];
                  if (item._id !== scope.visibleProvider[i]._id) {
                    continue;
                  }
                  idx = {
                    chunk: indexChunk,
                    inside: indexItem
                  };
                  return idx;
                }
              }
            };
            idx = findIndex();
            scope.visibleProvider[i].styles = {
              'transform': "translate3d(" + ((scope.rowWidth * idx.inside) + scope.margin + 'px') + ", " + ((firstCell + idx.chunk) * scope.rowHeight + 'px') + ", 0)"
            };
            results.push(i++);
          }
          return results;
        };
        scope.onScrollContainer = function() {
          scope.scrollTop = element.prop('scrollTop');
          scope.updateDisplayList();
          return scope.$digest();
        };
        scope.onScrollWindow = function() {
          scope.scrollTop = $window.pageYOffset;
          scope.updateDisplayList();
          return scope.$digest();
        };
        scope.resetSize = function() {
          scope.visibleProvider = [];
          scope.cellsPerPage = 0;
          scope.numberOfCells = 0;
          scope.width = 0;
          scope.height = 0;
          scope.canvasHeight = {};
          return scope.$digest();
        };
        scope.$watch('imagovirtuallist.data', function() {
          return scope.init();
        });
        watchers = [];
        watchers.push($rootScope.$on('imagovirtuallist:init', function() {
          return scope.init();
        }));
        watchers.push($rootScope.$on('resizestop', function() {
          scope.resetSize();
          return scope.init();
        }));
        return scope.$on('$destroy', function() {
          var j, len, results, watcher;
          angular.element($window).off('scroll', scope.onScrollWindow);
          results = [];
          for (j = 0, len = watchers.length; j < len; j++) {
            watcher = watchers[j];
            results.push(watcher());
          }
          return results;
        });
      }
    };
  }

  return ImagoVirtualList;

})();

angular.module('imago').directive('imagoVirtualList', ['$window', '$rootScope', '$timeout', ImagoVirtualList]);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imago-virtual-list.html","<div ng-style=\"canvasHeight\" class=\"canvas\"></div>");}]);