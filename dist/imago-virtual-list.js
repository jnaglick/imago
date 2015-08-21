var ImagoVirtualList;

ImagoVirtualList = (function() {
  function ImagoVirtualList($timeout) {
    return {
      scope: {
        data: '='
      },
      templateUrl: '/app/tests/ui-virtual-list.html',
      link: function(scope, element, attrs) {
        var rowHeight, rowWidth;
        rowHeight = 454;
        rowWidth = 350;
        scope.height = 500;
        scope.width = element[0].clientWidth;
        scope.scrollTop = 0;
        scope.visibleProvider = [];
        scope.cellsPerPage = 0;
        scope.numberOfCells = 0;
        scope.canvasHeight = {};
        scope.init = function() {
          element[0].addEventListener('scroll', scope.onScroll);
          scope.itemsPerRow = Math.round(scope.width / rowWidth);
          scope.cellsPerPage = Math.round(scope.height / rowHeight) * scope.itemsPerRow;
          scope.numberOfCells = 3 * scope.cellsPerPage;
          scope.canvasHeight = {
            height: Math.ceil((scope.data.length * rowHeight) / scope.itemsPerRow) + 'px'
          };
          return scope.updateDisplayList();
        };
        scope.updateDisplayList = function() {
          var cellsToCreate, chunks, data, findIndex, firstCell, i, idx, oldVisible, results;
          firstCell = Math.max(Math.floor(scope.scrollTop / rowHeight) - (Math.round(scope.height / rowHeight)), 0);
          cellsToCreate = Math.min(firstCell + scope.numberOfCells, scope.numberOfCells);
          oldVisible = angular.copy(scope.visibleProvider);
          data = firstCell * scope.itemsPerRow;
          scope.visibleProvider = scope.data.slice(data, data + cellsToCreate);
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
              'transform': "translate3d(" + ((rowWidth * idx.inside) + 'px') + ", " + ((firstCell + idx.chunk) * rowHeight + 'px') + ", 0)"
            };
            results.push(i++);
          }
          return results;
        };
        scope.onScroll = function(evt) {
          scope.scrollTop = element.prop('scrollTop');
          scope.updateDisplayList();
          return scope.$apply();
        };
        return scope.$watch('data', function(value) {
          if (!value) {
            return;
          }
          return scope.init();
        });
      }
    };
  }

  return ImagoVirtualList;

})();

angular.module('imago').directive('imagoVirtualList', ['$timeout', ImagoVirtualList]);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imago-virtual-list.html","<div ng-style=\"canvasHeight\" class=\"canvas\"><div ng-repeat=\"item in visibleProvider\" ng-style=\"item.styles\" ui-sref=\"details({\'id\': item._id})\" ng-class=\"item.type\" class=\"renderer item\"><div><div style=\"background-image: url({{item.serving_url}}=s480);\" class=\"media\"></div><div class=\"caption\"><div class=\"source\"><span>{{item.fields.source.value}}</span></div><h2><span>{{item.fields.title.value}}</span></h2><br/><h3><span>{{item.fields.description.value}}</span></h3></div></div></div></div>");}]);