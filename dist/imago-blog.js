var imagoPager, imagoPagerController;

imagoPager = (function() {
  function imagoPager($http, $compile, $templateCache) {
    var defaultTemplate, getTemplate;
    defaultTemplate = '/imago/imagoPager.html';
    getTemplate = function(url) {
      var templateLoader;
      templateLoader = $http.get(url, {
        cache: $templateCache
      });
      return templateLoader;
    };
    return {
      scope: {
        posts: '=',
        nextPage: '&next',
        prevPage: '&prev',
        path: '@',
        pageSize: '@',
        tags: '=',
        currentPage: '=',
        shuffle: '@'
      },
      controller: 'imagoPagerController',
      link: function(scope, element, attrs) {
        var syntax, template;
        template = attrs.templateurl ? attrs.templateurl : defaultTemplate;
        syntax = void 0;
        return getTemplate(template).success(function(html) {
          return syntax = html;
        }).then(function() {
          return element.append($compile(syntax)(scope));
        });
      }
    };
  }

  return imagoPager;

})();

imagoPagerController = (function() {
  function imagoPagerController($scope, $element, $attrs, imagoModel) {
    this.fetchPosts = function() {
      var idx, pageNo, pageSize, query;
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
      if ((query != null ? query.path : void 0) && _.includes(query.path, '/page/')) {
        idx = query.path.indexOf('/page/');
        query.path = query.path.slice(0, idx);
      }
      return imagoModel.getData([query], {
        localData: false
      }).then((function(_this) {
        return function(response) {
          var collection, i, len, results;
          results = [];
          for (i = 0, len = response.length; i < len; i++) {
            collection = response[i];
            $scope.next = collection.next;
            if ($scope.shuffle) {
              $scope.posts = _.shuffle(collection.assets);
            } else {
              $scope.posts = collection.assets;
            }
            $scope.totalPages = collection.count / pageSize;
            break;
          }
          return results;
        };
      })(this));
    };
    $scope.onPrev = (function(_this) {
      return function() {
        $scope.currentPage = parseInt($scope.currentPage) - 1;
        return $scope.prevPage();
      };
    })(this);
    $scope.onNext = (function(_this) {
      return function() {
        $scope.currentPage = parseInt($scope.currentPage) + 1;
        return $scope.nextPage();
      };
    })(this);
    $scope.$watchGroup(['currentPage', 'tags'], this.fetchPosts);
  }

  return imagoPagerController;

})();

angular.module('imago').directive('imagoPager', ['$http', '$compile', '$templateCache', imagoPager]).controller('imagoPagerController', ['$scope', '$element', '$attrs', 'imagoModel', imagoPagerController]);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imagoPager.html","<div class=\"pager\"><button ng-disabled=\"currentPage &lt;= 1\" ng-click=\"onPrev()\" class=\"prev\">Previous</button><button ng-disabled=\"currentPage &gt;= totalPages || posts.length &lt; pageSize || !next\" ng-click=\"onNext()\" class=\"next\">Next</button></div>");}]);