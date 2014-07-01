class imagoCompile extends Directive
  constructor: ($compile) ->
    return {
      controller: ($scope, $element, $attrs) ->
        $scope.$watch(
          ($scope) ->
            $scope.$eval($attrs.compile)

          (value) ->
            $element.html(value)
            $compile(element.contents())($scope)
        )
    }