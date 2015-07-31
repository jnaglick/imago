class imagoDownload extends Directive
  constructor: ($compile, $templateCache, $http) ->

    defaultTemplate = '/imago/imagoDownload.html'
    getTemplate = (url) ->

      templateLoader = $http.get(url,
        cache: $templateCache
      )
      templateLoader

    return {
      scope:
        asset: "="
        fieldname: "="
      link: (scope, element, attrs) ->

        template = if attrs.templateurl then attrs.templateurl else defaultTemplate

        syntax = undefined

        getTemplate(template).success((html) ->
          syntax = html
        ).then ->
          element.append $compile(syntax)(scope)
      }