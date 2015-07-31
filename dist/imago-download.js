var imagoDownload;

imagoDownload = (function() {
  function imagoDownload($compile, $templateCache, $http) {
    var defaultTemplate, getTemplate;
    defaultTemplate = '/imago/imagoDownload.html';
    getTemplate = function(url) {
      var templateLoader;
      templateLoader = $http.get(url, {
        cache: $templateCache
      });
      return templateLoader;
    };
    return {
      scope: {
        asset: "=",
        fieldname: "="
      },
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

  return imagoDownload;

})();

angular.module('imago').directive('imagoDownload', ['$compile', '$templateCache', '$http', imagoDownload]);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imago-download.html","<a ng-href=\"{{asset.fields[fieldname].download_url}}\" ng-if=\"asset.fields[fieldname].download_url\" analytics-on=\"click\" analytics-event=\"Download {{ asset.fields[fieldname].filename }}\"><i class=\"fa fa-file-pdf-o\"> {{ asset.fields[fieldname].filename }}</i></a>");}]);