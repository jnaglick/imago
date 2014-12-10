var imagoLike;

imagoLike = (function() {
  function imagoLike() {
    return {
      scope: {},
      templateUrl: '/imago/imagoLike.html',
      controller: function() {}
    };
  }

  return imagoLike;

})();

angular.module('imago').directive('imagoLike', [imagoLike]);

var imagoShare;

imagoShare = (function() {
  function imagoShare() {
    return {
      scope: {
        asset: "="
      },
      templateUrl: '/imago/imagoShare.html',
      controller: function($scope, $element, $attrs, $location) {
        var watcher;
        $scope.location = $location.absUrl();
        return watcher = $scope.$watch('asset', (function(_this) {
          return function(value) {
            var key;
            if (!value) {
              return;
            }
            for (key in $attrs.$attr) {
              if (key !== 'asset') {
                $scope[key] = true;
              }
            }
            return watcher();
          };
        })(this));
      }
    };
  }

  return imagoShare;

})();

angular.module('imago').directive('imagoShare', [imagoShare]);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imagoLike.html","<div class=\"social\"><a href=\"http://instagram.com/###\" target=\"_blank\" class=\"instagram\">Instagram</a><a href=\"https://www.facebook.com/###\" target=\"_blank\" class=\"facebook\">Facebook</a><a href=\"https://plus.google.com/###\" target=\"_blank\" class=\"googleplus\">Google +</a></div>");
$templateCache.put("/imago/imagoShare.html","<div class=\"share\"><a href=\"http://www.facebook.com/share.php?u={{location}}\" target=\"_blank\" ng-if=\"facebook\" class=\"fa fa-facebook\"></a><a href=\"http://twitter.com/home?status={{location}}\" target=\"_blank\" ng-if=\"twitter\" class=\"fa fa-twitter\"></a><a href=\"https://plus.google.com/share?url={{location}}\" ng-if=\"google\" class=\"fa fa-google\"></a><a href=\"https://www.linkedin.com/shareArticle?mini=true&amp;url=http://olas.2.imagoapp.com/press/gift&amp;title={{asset | meta:\'title\'}}&amp;summary=&amp;source={{asset.serving_url}}\" target=\"_blank\" ng-if=\"linkedin\" class=\"fa fa-linkedin\"></a><a href=\"http://www.tumblr.com/share/photo?source={{asset.serving_url}}&amp;caption={{asset | meta:\'title\'}}\" target=\"_blank\" ng-if=\"tumblr\" class=\"fa fa-tumblr\"></a><a href=\"http://www.pinterest.com/pin/create/abutton/?url=http://www.server.com/&amp;media={{asset.serving_url}}&amp;description={{asset | meta:\'title\'}}\" target=\"_blank\" title=\"Pin It\" ng-if=\"pintrest\" class=\"fa fa-pinterest\"></a></div>");}]);