class ImagoVirtualList extends Directive

  constructor: ($timeout) ->

    return {

      scope:
        data: '='
      templateUrl: '/app/tests/ui-virtual-list.html'

      link: (scope, element, attrs) ->
        rowHeight = 454
        rowWidth = 350
        scope.height = 500
        scope.width = element[0].clientWidth
        scope.scrollTop = 0
        scope.visibleProvider = []
        scope.cellsPerPage = 0
        scope.numberOfCells = 0
        scope.canvasHeight = {}

        scope.init = ->
          element[0].addEventListener 'scroll', scope.onScroll
          scope.itemsPerRow = Math.round(scope.width / rowWidth)
          scope.cellsPerPage = Math.round(scope.height / rowHeight) * scope.itemsPerRow
          scope.numberOfCells = 3 * scope.cellsPerPage
          scope.canvasHeight = height: Math.ceil((scope.data.length * rowHeight) / scope.itemsPerRow) + 'px'
          scope.updateDisplayList()

        scope.updateDisplayList = ->
          firstCell = Math.max(Math.floor(scope.scrollTop / rowHeight) - (Math.round(scope.height / rowHeight)), 0)
          cellsToCreate = Math.min(firstCell + scope.numberOfCells, scope.numberOfCells)
          oldVisible = angular.copy scope.visibleProvider
          data = firstCell * scope.itemsPerRow
          scope.visibleProvider = scope.data.slice(data, data + cellsToCreate)
          # return if angular.equals(scope.visibleProvider, oldVisible)
          chunks = _.chunk(scope.visibleProvider, scope.itemsPerRow)
          i = 0
          while i < scope.visibleProvider.length
            findIndex = ->
              for chunk, indexChunk in chunks
                for item, indexItem in chunk
                  continue unless item._id is scope.visibleProvider[i]._id
                  idx =
                    chunk  : indexChunk
                    inside : indexItem
                  return idx

            idx = findIndex()
            scope.visibleProvider[i].styles = 'transform': "translate3d(#{(rowWidth * idx.inside) + 'px'}, #{(firstCell + idx.chunk) * rowHeight + 'px'}, 0)"
            i++

        scope.onScroll = (evt) ->
          scope.scrollTop = element.prop('scrollTop')
          scope.updateDisplayList()
          scope.$apply()

        scope.$watch 'data', (value) ->
          return unless value
          scope.init()

    }
