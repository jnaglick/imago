class imagoCompile extends Directive
  constructor: ($compile) ->
    return {
      link: (scope, element, attrs) ->
        scope.$watch(
          (scope) ->
            return unless attrs.compile
            scope.$eval(attrs.compile)

          (value) ->
            return unless value
            element.html(value)
            $compile(element.contents())(scope)
        )
    }