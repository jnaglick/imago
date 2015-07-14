class ImagoSubscribe extends Directive

  constructor: ($http, $parse, imagoSettings) ->

    defaultTemplate = '/imago/imago-subscribe.html'

    getTemplate = (url) ->
      templateLoader = $http.get(url,
        cache: $templateCache
      )
      templateLoader

    return {

      require: 'form'
      transclude: true
      controller: 'imagoSubscribeController as imagosubscribe'
      link: (scope, element, attrs) ->
        template = if attrs.templateurl then attrs.templateurl else defaultTemplate

        syntax = undefined

        getTemplate(template).success((html) ->
          syntax = html
        ).then ->
          element.append $compile(syntax)(scope)

    }

class ImagoSubscribeController extends Controller

  constructor:($http, $parse, imagoSettings) ->

    @submit = (validate) ->
      return if validate.$invalid
      form = $parse($attrs.imagoSubscribe)($scope)

      @submitted = true

      $http.post("#{imagoSettings.host}/api/subscribe", form).then (response) =>
        @error = false
        console.log 'response', response
      , (error) ->
        @error = true
        console.log 'error', error
