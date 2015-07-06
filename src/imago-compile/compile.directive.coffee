class imagoCompile extends Directive

  constructor: ($compile) ->

    return (scope, element, attrs) ->
      scope.$watch attrs.imagoCompile, (html) ->
        return unless html
        element.html(html)
        $compile(element.contents())(scope)