class StopPropagation extends Directive
  constructor: () ->
    return {
      link: (scope, element, attr) ->
        element.bind 'click', (e) ->
          e.stopPropagation()

        element.bind 'dblclick', (e) ->
          e.stopPropagation()
    }
