class ImagoVirtualList extends Directive

  constructor: ($window, $rootScope) ->

    return {

      scope: true
      templateUrl: '/imago/imago-virtual-list.html'
      transclude: true
      controller: -> return
      controllerAs: 'imagovirtuallist'
      bindToController:
        data: '='
        rowHeight: '='
        rowWidth: '='

      link: (scope, element, attrs, ctrl, transclude) ->

        transclude scope, (clone, scope) ->
          element.children().append clone

        scope.scrollTop = 0
        scope.width = element[0].clientWidth
        scope.visibleProvider = []
        scope.cellsPerPage = 0
        scope.numberOfCells = 0
        scope.canvasHeight = {}

        scope.init = (rowWidth, rowHeight) ->
          if not rowWidth or not rowHeight
            testDiv = document.createElement 'div'
            testDiv.className = attrs.classitem
            testDiv.id = 'virtual-list-test-div'
            element.append testDiv
            rowWidth = rowWidth or testDiv.clientWidth
            rowHeight = rowHeight or testDiv.clientHeight
            angular.element(element[0].querySelector('#virtual-list-test-div')).remove()

          scope.rowWidth = rowWidth
          scope.rowHeight = rowHeight

          scope.width = element[0].clientWidth unless scope.width
          scope.height = element[0].clientHeight unless scope.height

          if attrs.imagoVirtualListContainer
            element[0].addEventListener 'scroll', scope.onScrollContainer
          else
            angular.element($window).on 'scroll', scope.onScrollWindow
          scope.itemsPerRow = Math.round(scope.width / scope.rowWidth)
          scope.canvasHeight = height: Math.ceil((scope.imagovirtuallist.data.length * scope.rowHeight) / scope.itemsPerRow) + 'px'
          scope.cellsPerPage = Math.round(scope.height / scope.rowHeight) * scope.itemsPerRow
          scope.numberOfCells = 3 * scope.cellsPerPage
          scope.margin = 0
          scope.updateDisplayList()

        scope.updateDisplayList = ->
          firstCell = Math.max(Math.floor(scope.scrollTop / scope.rowHeight) - (Math.round(scope.height / scope.rowHeight)), 0)
          cellsToCreate = Math.min(firstCell + scope.numberOfCells, scope.numberOfCells)
          # oldVisible = angular.copy scope.visibleProvider
          data = firstCell * scope.itemsPerRow
          scope.visibleProvider = scope.imagovirtuallist.data.slice(data, data + cellsToCreate)
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
            scope.visibleProvider[i].styles = 'transform': "translate3d(#{(scope.rowWidth * idx.inside) + scope.margin + 'px'}, #{(firstCell + idx.chunk) * scope.rowHeight + 'px'}, 0)"
            i++

        scope.onScrollContainer = ->
          scope.scrollTop = element.prop('scrollTop')
          scope.updateDisplayList()
          scope.$apply()

        scope.onScrollWindow = ->
          scope.scrollTop = $window.pageYOffset
          scope.updateDisplayList()
          scope.$apply()

        scope.$watchGroup ['imagovirtuallist.data', 'imagovirtuallist.rowHeight', 'imagovirtuallist.rowWidth'], ->
          return unless scope.imagovirtuallist.data

          if angular.isString scope.imagovirtuallist.rowWidth
            rowWidth = parseInt(scope.imagovirtuallist.rowWidth) / 100
            rowWidth = scope.width * rowWidth
          else
            rowWidth = scope.imagovirtuallist.rowWidth if angular.isDefined scope.imagovirtuallist.rowWidth

          rowHeight = scope.imagovirtuallist.rowHeight if angular.isDefined scope.imagovirtuallist.rowHeight

          scope.init(rowWidth, rowHeight)

        watcher = $rootScope.$on 'imagovirtuallist:init', ->
          scope.init()

        scope.$on '$destroy', ->
          angular.element($window).off 'scroll', scope.onScrollWindow
          watcher()

    }
