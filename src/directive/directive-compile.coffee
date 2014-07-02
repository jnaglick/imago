class imagoCompile extends Directive
  constructor: ($compile) ->
    return (scope, element, attrs) ->

      compile = (newHTML) ->
        newHTML = $compile(newHTML)(scope)
        element.html("").append newHTML

      htmlName = attrs.compile
      scope.$watch htmlName, (newHTML) ->
        return unless newHTML
        compile newHTML

      # ensureCompileRunsOnce = scope.$watch(
      #   (scope) ->
      #     return unless attrs.compile
      #     scope.$eval(attrs.compile)

      #   (value) ->
      #     return unless value
      #     element.html(value)
      #     $compile(element.contents())(scope)
      #     ensureCompileRunsOnce()
      # )