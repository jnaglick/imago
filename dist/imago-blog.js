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
          var pageNo, pageSize, query;
          this.count += 1;
          $scope.posts = [];
          pageSize = parseInt($scope.pageSize);
          pageNo = parseInt($scope.currentPage);
          query = {
            path: $scope.path,
            page: pageNo,
            pagesize: pageSize
          };
          if ($scope.tags) {
            query['tags'] = $scope.tags;
          }
          return imagoModel.getData([query], {
            localData: false
          }).then((function(_this) {
            return function(response) {
              var collection, _i, _len, _results;
              _results = [];
              for (_i = 0, _len = response.length; _i < _len; _i++) {
                collection = response[_i];
                $scope.posts = collection.assets;
                $scope.totalPages = collection.count / pageSize;
                break;
              }
              return _results;
            };
          })(this));
        };
        $scope.onNext = (function(_this) {
          return function() {
            $scope.currentPage = parseInt($scope.currentPage) + 1;
            return $scope.next();
          };
        })(this);
        $scope.onPrev = (function(_this) {
          return function() {
            $scope.currentPage = parseInt($scope.currentPage) - 1;
            return $scope.prev();
          };
        })(this);
        $scope.$watch('currentPage', this.fetchPosts);
        $scope.$watch('tags', this.fetchPosts);
        return $scope.$watchGroup(['currentPage', 'tags'], this.fetchPosts);
      }
    };
  }

  return imagoPager;

})();

angular.module('imago').directive('imagoPager', ['imagoModel', imagoPager]);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imagoPager.html","<div class=\"pager\"><button ng-disabled=\"currentPage &lt;= 1\" hm-tap=\"onPrev\">Previous</button><button ng-disabled=\"currentPage &gt;= totalPages || posts.length &lt; pageSize\" hm-tap=\"onNext\">Next</button></div>");}]);