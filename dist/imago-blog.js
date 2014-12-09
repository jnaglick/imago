var imagoPager;

imagoPager = (function() {
  function imagoPager(imagoModel) {
    return {
      scope: {
        posts: '=',
        next: '&',
        prev: '&',
        path: '@',
        pageSize: '@',
        tags: '=',
        currentPage: '='
      },
      templateUrl: '/imago/imagoPager.html',
      controller: function($scope, $element, $attrs) {
        this.fetchPosts = function() {
          var pageSize, query;
          pageSize = parseInt($scope.pageSize);
          console.log('currentPage', $scope.currentPage);
          query = {
            path: $scope.path,
            page: $scope.currentPage,
            pagesize: pageSize
          };
          if ($scope.tags) {
            query['tags'] = $scope.tags;
          }
          console.log('query', query);
          return imagoModel.getData([query], {
            localData: false
          }).then((function(_this) {
            return function(response) {
              var collection, _i, _len, _results;
              _results = [];
              for (_i = 0, _len = response.length; _i < _len; _i++) {
                collection = response[_i];
                console.log('collection', collection);
                $scope.posts = collection.assets;
                $scope.totalPages = collection.count / collection.assets.length;
                break;
              }
              return _results;
            };
          })(this));
        };
        $scope.onNext = (function(_this) {
          return function() {
            $scope.currentPage += 1;
            return $scope.next();
          };
        })(this);
        $scope.onPrev = (function(_this) {
          return function() {
            $scope.currentPage -= 1;
            return $scope.prev();
          };
        })(this);
        $scope.$watch('currentPage', this.fetchPosts);
        return $scope.$watch('tag', this.fetchPosts);
      }
    };
  }

  return imagoPager;

})();

angular.module('imago').directive('imagoPager', ['imagoModel', imagoPager]);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imagoPager.html","<div class=\"pager\"><button ng-disabled=\"currentPage &lt;= 1\" ng-click=\"onPrev()\">Previous</button><button ng-disabled=\"currentPage &gt;= totalPages\" ng-click=\"onNext()\">Next</button></div>");}]);