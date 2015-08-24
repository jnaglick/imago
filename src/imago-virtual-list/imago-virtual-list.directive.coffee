class ImagoVirtualList extends Directive

  constructor: ($timeout) ->

    return {

      scope:
        data: '='
        rowHeight: '='
        rowWidth: '='
      templateUrl: '/imago/imago-virtual-list.html'
      transclude: true

      link: (scope, element, attrs, ctrl, transclude) ->

        transclude scope, (clone, scope) ->
          element.children().append clone

        scope.width = element[0].clientWidth
        scope.scrollTop = 0
        scope.visibleProvider = []
        scope.cellsPerPage = 0
        scope.numberOfCells = 0
        scope.canvasHeight = {}

        scope.init = ->
          scope.height = element[0].clientHeight
          element[0].addEventListener 'scroll', scope.onScroll
          scope.itemsPerRow = Math.round(scope.width / scope.rowWidth)
          scope.cellsPerPage = Math.round(scope.height / scope.rowHeight) * scope.itemsPerRow
          scope.numberOfCells = 3 * scope.cellsPerPage
          scope.canvasHeight = height: Math.ceil((scope.data.length * scope.rowHeight) / scope.itemsPerRow) + 'px'
          scope.updateDisplayList()

        scope.updateDisplayList = ->
          firstCell = Math.max(Math.floor(scope.scrollTop / scope.rowHeight) - (Math.round(scope.height / scope.rowHeight)), 0)
          cellsToCreate = Math.min(firstCell + scope.numberOfCells, scope.numberOfCells)
          oldVisible = angular.copy scope.visibleProvider
          data = firstCell * scope.itemsPerRow
          scope.visibleProvider = scope.data.slice(data, data + cellsToCreate)
          return if angular.equals(scope.visibleProvider, oldVisible)
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
            scope.visibleProvider[i].styles = 'transform': "translate3d(#{(scope.rowWidth * idx.inside) + 'px'}, #{(firstCell + idx.chunk) * scope.rowHeight + 'px'}, 0)"
            i++

        scope.onScroll = ->
          scope.scrollTop = element.prop('scrollTop')
          scope.updateDisplayList()
          scope.$apply()

        scope.$watchGroup ['data', 'rowHeight', 'rowWidth'], ->
          return if not scope.data or not scope.rowWidth or not scope.rowHeight
          if typeof scope.rowWidth is 'string'
            rowWidth = parseInt(scope.rowWidth) / 100
            scope.rowWidth = scope.width * rowWidth
          scope.init()

    }
