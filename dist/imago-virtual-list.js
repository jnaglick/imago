var ImagoVirtualList;

ImagoVirtualList = (function() {
  function ImagoVirtualList($timeout) {
    return {
      scope: {
        data: '=',
        rowHeight: '=',
        rowWidth: '='
      },
      templateUrl: '/imago/imago-virtual-list.html',
      transclude: true,
      link: function(scope, element, attrs, ctrl, transclude) {
        transclude(scope, function(clone, scope) {
          return element.children().append(clone);
        });
        scope.width = element[0].clientWidth;
        scope.scrollTop = 0;
        scope.visibleProvider = [];
        scope.cellsPerPage = 0;
        scope.numberOfCells = 0;
        scope.canvasHeight = {};
        scope.init = function() {
          scope.height = element[0].clientHeight;
          element[0].addEventListener('scroll', scope.onScroll);
          scope.itemsPerRow = Math.round(scope.width / scope.rowWidth);
          scope.cellsPerPage = Math.round(scope.height / scope.rowHeight) * scope.itemsPerRow;
          scope.numberOfCells = 3 * scope.cellsPerPage;
          scope.canvasHeight = {
            height: Math.ceil((scope.data.length * scope.rowHeight) / scope.itemsPerRow) + 'px'
          };
          return scope.updateDisplayList();
        };
        scope.updateDisplayList = function() {
          var cellsToCreate, chunks, data, findIndex, firstCell, i, idx, oldVisible, results;
          firstCell = Math.max(Math.floor(scope.scrollTop / scope.rowHeight) - (Math.round(scope.height / scope.rowHeight)), 0);
          cellsToCreate = Math.min(firstCell + scope.numberOfCells, scope.numberOfCells);
          oldVisible = angular.copy(scope.visibleProvider);
          data = firstCell * scope.itemsPerRow;
          scope.visibleProvider = scope.data.slice(data, data + cellsToCreate);
          if (angular.equals(scope.visibleProvider, oldVisible)) {
            return;
          }
          chunks = _.chunk(scope.visibleProvider, scope.itemsPerRow);
          i = 0;
          results = [];
          while (i < scope.visibleProvider.length) {
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
              'transform': "translate3d(" + ((scope.rowWidth * idx.inside) + 'px') + ", " + ((firstCell + idx.chunk) * scope.rowHeight + 'px') + ", 0)"
            };
            results.push(i++);
          }
          return results;
        };
        scope.onScroll = function() {
          scope.scrollTop = element.prop('scrollTop');
          scope.updateDisplayList();
          return scope.$apply();
        };
        return scope.$watchGroup(['data', 'rowHeight', 'rowWidth'], function() {
          var rowWidth;
          if (!scope.data || !scope.rowWidth || !scope.rowHeight) {
            return;
          }
          if (typeof scope.rowWidth === 'string') {
            rowWidth = parseInt(scope.rowWidth) / 100;
            scope.rowWidth = scope.width * rowWidth;
          }
          return scope.init();
        });
      }
    };
  }

  return ImagoVirtualList;

})();

angular.module('imago').directive('imagoVirtualList', ['$timeout', ImagoVirtualList]);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imago-virtual-list.html","<div ng-style=\"canvasHeight\" class=\"canvas\"></div>");}]);