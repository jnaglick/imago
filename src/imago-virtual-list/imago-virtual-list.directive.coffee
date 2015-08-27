class ImagoVirtualList extends Directive

  constructor: ($window, $rootScope, $timeout) ->

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

        transclude scope, (clone) ->
          element.children().append clone

        scope.scrollTop       = 0
        scope.width           = element[0].clientWidth
        scope.visibleProvider = []
        scope.cellsPerPage    = 0
        scope.numberOfCells   = 0
        scope.canvasHeight    = {}

        scope.init = ->
          return unless scope.imagovirtuallist.data
          $timeout ->
            testDiv = document.createElement 'div'
            testDiv.className = attrs.classItem
            testDiv.id = 'virtual-list-test-div'
            element.append testDiv
            scope.rowWidth = testDiv.clientWidth
            scope.rowHeight = testDiv.clientHeight
            angular.element(element[0].querySelector('#virtual-list-test-div')).remove()

            scope.width = element[0].clientWidth unless scope.width
            scope.height = element[0].clientHeight unless scope.height

            if attrs.imagoVirtualListContainer
              element[0].addEventListener 'scroll', scope.onScrollContainer
            else
              angular.element($window).on 'scroll', scope.onScrollWindow
            scope.itemsPerRow = Math.round(scope.width / scope.rowWidth)
            scope.canvasHeight = height: Math.ceil((scope.imagovirtuallist.data.length * scope.rowHeight) / scope.itemsPerRow) + 'px'
            cellsPerHeight = Math.round(scope.height / scope.rowHeight)
            scope.cellsPerPage = cellsPerHeight * scope.itemsPerRow
            scope.numberOfCells = 3 * scope.cellsPerPage
            # if cellsPerHeight is Math.ceil(scope.height / scope.rowHeight)
            #   scope.numberOfCells = 3 * scope.cellsPerPage
            # else
            #   scope.numberOfCells = 4 * scope.cellsPerPage
            scope.margin = 0
            scope.updateDisplayList()
          , 50

        scope.updateDisplayList = ->
          firstCell = Math.max(Math.floor(scope.scrollTop / scope.rowHeight) - (Math.round(scope.height / scope.rowHeight)), 0)
          cellsToCreate = Math.min(firstCell + scope.numberOfCells, scope.numberOfCells)
          data = firstCell * scope.itemsPerRow
          scope.visibleProvider = scope.imagovirtuallist.data.slice(data, data + cellsToCreate)
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
            # scope.visibleProvider[i].styles = 'transform': "translate3d(#{(scope.rowWidth * idx.inside) + scope.margin + 'px'}, #{(firstCell + idx.chunk) * scope.rowHeight + 'px'}, 0)"
            scope.visibleProvider[i].styles = 'transform': "translate(#{(scope.rowWidth * idx.inside) + scope.margin + 'px'}, #{(firstCell + idx.chunk) * scope.rowHeight + 'px'})"
            i++

        scope.onScrollContainer = ->
          scope.scrollTop = element.prop('scrollTop')
          scope.updateDisplayList()
          scope.$digest()

        scope.onScrollWindow = ->
          scope.scrollTop = $window.pageYOffset
          scope.updateDisplayList()
          scope.$digest()

        scope.resetSize = ->
          scope.visibleProvider = []
          scope.cellsPerPage    = 0
          scope.numberOfCells   = 0
          scope.canvasHeight    = {}
          scope.$digest()

        scope.$watch 'imagovirtuallist.data', ->
          scope.init()

        watchers = []

        watchers.push $rootScope.$on 'imagovirtuallist:init', ->
          scope.init()

        watchers.push $rootScope.$on 'resizestop', ->
          scope.resetSize()
          scope.init()

        scope.$on '$destroy', ->
          angular.element($window).off 'scroll', scope.onScrollWindow
          for watcher in watchers
            watcher()

    }
