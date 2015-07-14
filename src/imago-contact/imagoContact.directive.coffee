class imagoContact extends Directive

  constructor: (imagoSubmit)->

    defaultTemplate = '/imago/imago-contact.html'

    getTemplate = (url) ->
      templateLoader = $http.get(url,
        cache: $templateCache
      )
      templateLoader

    return {

      scope: {}
      templateUrl: '/app/directives/views/imago-contact.html'
      controller: 'imagoContactController as contact'
      link: (scope, element, attrs) ->

        template = if attrs.templateurl then attrs.templateurl else defaultTemplate

        syntax = undefined

        getTemplate(template).success((html) ->
          syntax = html
        ).then ->
          element.append $compile(syntax)(scope)

    }

class imagoContactController extends Controller

  constructor: (imagoSubmit) ->

    @data =
      subscribe: true

    @submitForm = (isValid) =>
      return unless isValid
      imagoSubmit.send(@data).then (result) =>
        @status = result.status
        @error = result.message or ''
