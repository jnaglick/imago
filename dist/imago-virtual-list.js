var ImagoVirtualList;

ImagoVirtualList = (function() {
  function ImagoVirtualList($window, $rootScope) {
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
        var watcher;
        transclude(scope, function(clone, scope) {
          return element.children().append(clone);
        });
        scope.scrollTop = 0;
        scope.width = element[0].clientWidth;
        scope.visibleProvider = [];
        scope.cellsPerPage = 0;
        scope.numberOfCells = 0;
        scope.canvasHeight = {};
        scope.init = function(rowWidth, rowHeight) {
          var testDiv;
          if (!rowWidth || !rowHeight) {
            testDiv = document.createElement('div');
            testDiv.className = attrs.classitem;
            testDiv.id = 'virtual-list-test-div';
            element.append(testDiv);
            rowWidth = rowWidth || testDiv.clientWidth;
            rowHeight = rowHeight || testDiv.clientHeight;
            angular.element(element[0].querySelector('#virtual-list-test-div')).remove();
          }
          scope.rowWidth = rowWidth;
          scope.rowHeight = rowHeight;
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
          scope.cellsPerPage = Math.round(scope.height / scope.rowHeight) * scope.itemsPerRow;
          scope.numberOfCells = 3 * scope.cellsPerPage;
          scope.margin = 0;
          return scope.updateDisplayList();
        };
        scope.updateDisplayList = function() {
          var cellsToCreate, chunks, data, findIndex, firstCell, i, idx, results;
          firstCell = Math.max(Math.floor(scope.scrollTop / scope.rowHeight) - (Math.round(scope.height / scope.rowHeight)), 0);
          cellsToCreate = Math.min(firstCell + scope.numberOfCells, scope.numberOfCells);
          data = firstCell * scope.itemsPerRow;
          scope.visibleProvider = scope.imagovirtuallist.data.slice(data, data + cellsToCreate);
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
              'transform': "translate3d(" + ((scope.rowWidth * idx.inside) + scope.margin + 'px') + ", " + ((firstCell + idx.chunk) * scope.rowHeight + 'px') + ", 0)"
            };
            results.push(i++);
          }
          return results;
        };
        scope.onScrollContainer = function() {
          scope.scrollTop = element.prop('scrollTop');
          scope.updateDisplayList();
          return scope.$apply();
        };
        scope.onScrollWindow = function() {
          scope.scrollTop = $window.pageYOffset;
          scope.updateDisplayList();
          return scope.$apply();
        };
        scope.$watchGroup(['imagovirtuallist.data', 'imagovirtuallist.rowHeight', 'imagovirtuallist.rowWidth'], function() {
          var rowHeight, rowWidth;
          if (!scope.imagovirtuallist.data) {
            return;
          }
          if (angular.isString(scope.imagovirtuallist.rowWidth)) {
            rowWidth = parseInt(scope.imagovirtuallist.rowWidth) / 100;
            rowWidth = scope.width * rowWidth;
          } else {
            if (angular.isDefined(scope.imagovirtuallist.rowWidth)) {
              rowWidth = scope.imagovirtuallist.rowWidth;
            }
          }
          if (angular.isDefined(scope.imagovirtuallist.rowHeight)) {
            rowHeight = scope.imagovirtuallist.rowHeight;
          }
          return scope.init(rowWidth, rowHeight);
        });
        watcher = $rootScope.$on('imagovirtuallist:init', function() {
          return scope.init();
        });
        return scope.$on('$destroy', function() {
          angular.element($window).off('scroll', scope.onScrollWindow);
          return watcher();
        });
      }
    };
  }

  return ImagoVirtualList;

})();

angular.module('imago').directive('imagoVirtualList', ['$window', '$rootScope', ImagoVirtualList]);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imago-virtual-list.html","<div ng-style=\"canvasHeight\" class=\"canvas\"></div>");}]);