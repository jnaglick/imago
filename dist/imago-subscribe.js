var ImagoSubscribe, ImagoSubscribeController;

ImagoSubscribe = (function() {
  function ImagoSubscribe($http, $parse, imagoSettings) {
    var defaultTemplate, getTemplate;
    defaultTemplate = '/imago/imago-subscribe.html';
    getTemplate = function(url) {
      var templateLoader;
      templateLoader = $http.get(url, {
        cache: $templateCache
      });
      return templateLoader;
    };
    return {
      require: 'form',
      transclude: true,
      controller: 'imagoSubscribeController as imagosubscribe',
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

  return ImagoSubscribe;

})();

ImagoSubscribeController = (function() {
  function ImagoSubscribeController($http, $parse, imagoSettings) {
    this.submit = function(validate) {
      var form;
      if (validate.$invalid) {
        return;
      }
      form = $parse($attrs.imagoSubscribe)($scope);
      this.submitted = true;
      return $http.post(imagoSettings.host + "/api/subscribe", form).then((function(_this) {
        return function(response) {
          _this.error = false;
          return console.log('response', response);
        };
      })(this), function(error) {
        this.error = true;
        return console.log('error', error);
      });
    };
  }

  return ImagoSubscribeController;

})();

angular.module('imago').directive('imagoSubscribe', ['$http', '$parse', 'imagoSettings', ImagoSubscribe]).controller('imagoSubscribeController', ['$http', '$parse', 'imagoSettings', ImagoSubscribeController]);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imago-subscribe.html","<div class=\"imago-subscribe\"><div ng-transclude=\"ng-transclude\" ng-hide=\"imagosubscribe.submitted &amp;&amp; !imagosubscribe.error\"></div><div ng-show=\"imagosubscribe.submitted &amp;&amp; imagosubscribe.error\" class=\"error\">please try again later</div><div ng-show=\"imagosubscribe.submitted &amp;&amp; !imagosubscribe.error\" class=\"submitted\">subscription created</div></div>");}]);