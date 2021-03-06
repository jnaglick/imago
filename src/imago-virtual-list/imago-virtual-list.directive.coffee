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
        onBottom: '&'

      link: (scope, element, attrs, ctrl, transclude) ->

        transclude scope, (clone) ->
          element.children().append clone

        self = {}
        self.scrollTop = 0
        self.scrollBottomTrigger = 500

        scope.init = ->
          return unless scope.imagovirtuallist.data
          scope.resetSize()
          $timeout ->
            testDiv = document.createElement 'div'
            testDiv.className = attrs.classItem
            testDiv.id = 'virtual-list-test-div'
            element.append testDiv
            self.rowWidth = testDiv.clientWidth
            self.rowHeight = testDiv.clientHeight
            angular.element(element[0].querySelector('#virtual-list-test-div')).remove()

            self.width = element[0].clientWidth
            self.height = element[0].clientHeight

            if attrs.imagoVirtualListContainer
              element[0].addEventListener 'scroll', scope.onScrollContainer
            else
              angular.element($window).on 'scroll', scope.onScrollWindow
            self.triggerHeight = self.rowHeight + self.scrollBottomTrigger
            self.itemsPerRow = Math.floor(self.width / self.rowWidth)
            self.canvasHeight = Math.ceil(scope.imagovirtuallist.data.length / self.itemsPerRow) * self.rowHeight
            scope.canvasStyle = height: self.canvasHeight + 'px'
            cellsPerHeight = Math.round(self.height / self.rowHeight)
            self.cellsPerPage = cellsPerHeight * self.itemsPerRow
            self.numberOfCells = 3 * self.cellsPerPage
            self.margin = Math.round((self.width / self.itemsPerRow) - self.rowWidth)
            self.margin = self.margin / 2 if self.itemsPerRow is 1
            self.updateDisplayList()

        self.updateDisplayList = ->
          firstCell = Math.max(Math.round(self.scrollTop / self.rowHeight) - (Math.round(self.height / self.rowHeight)), 0)
          cellsToCreate = Math.min(firstCell + self.numberOfCells, self.numberOfCells)
          data = firstCell * self.itemsPerRow
          scope.visibleProvider = scope.imagovirtuallist.data.slice(data, data + cellsToCreate)
          chunks = _.chunk(scope.visibleProvider, self.itemsPerRow)
          i = 0
          l = scope.visibleProvider.length
          while i < l
            findIndex = ->
              for chunk, indexChunk in chunks
                for item, indexItem in chunk
                  continue unless item._id is scope.visibleProvider[i]._id
                  idx =
                    chunk  : indexChunk
                    inside : indexItem
                  return idx

            idx = findIndex()

            # scope.visibleProvider[i].styles = 'transform': "translate3d(#{(self.rowWidth * idx.inside) + self.margin + 'px'}, #{(firstCell + idx.chunk) * self.rowHeight + 'px'}, 0)"
            scope.visibleProvider[i].styles = 'transform': "translate(#{(self.rowWidth * idx.inside) + self.margin + 'px'}, #{(firstCell + idx.chunk) * self.rowHeight + 'px'})"
            i++

        scope.onScrollContainer = ->
          self.scrollTop = element.prop('scrollTop')
          self.updateDisplayList()
          scope.$digest()

        scope.onScrollWindow = ->
          self.scrollTop = $window.pageYOffset
          if (self.canvasHeight - self.scrollTop) <= self.triggerHeight
            scope.imagovirtuallist.onBottom()
          self.updateDisplayList()
          scope.$digest()

        scope.resetSize = ->
          scope.visibleProvider = []
          scope.canvasStyle     = {}
          self.cellsPerPage     = 0
          self.numberOfCells    = 0
          self.width            = 0
          self.height           = 0

        scope.$watch 'imagovirtuallist.data', ->
          scope.init()

        watchers = []

        watchers.push $rootScope.$on 'imagovirtuallist:init', ->
          scope.init()

        watchers.push $rootScope.$on 'resizestop', ->
          scope.init()

        scope.$on '$destroy', ->
          angular.element($window).off 'scroll', scope.onScrollWindow
          for watcher in watchers
            watcher()

    }
