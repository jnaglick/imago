class imagoPager extends Directive

  constructor: (imagoModel) ->
    return {
      scope: {
        posts: '='
        next: '&'
        prev: '&'
        path: '@'
        pageSize: '@'
        tags: '='
        currentPage: '='
      }
      templateUrl: '/imago/imagoPager.html'
      controller: ($scope, $element, $attrs) ->

        @fetchPosts = () ->
          @count += 1
          $scope.posts = []
          pageSize = parseInt $scope.pageSize
          pageNo = parseInt $scope.currentPage

          query =
            path:     $scope.path
            page:     pageNo
            pagesize: pageSize

          query['tags'] = $scope.tags if $scope.tags

          # console.log 'query', query
          if query?.path and _.includes query.path, '/page/'
            idx = query.path.indexOf '/page/'
            query.path = query.path.slice 0, idx

          imagoModel.getData([query], {localData: false}).then (response) =>
            # console.log 'response', response
            for collection in response
              # console.log 'collection', collection
              $scope.posts = collection.assets
              $scope.totalPages = collection.count / pageSize
              break

        $scope.onNext = =>
          $scope.currentPage = parseInt($scope.currentPage) + 1
          $scope.next()

        $scope.onPrev = =>
          $scope.currentPage = parseInt($scope.currentPage) - 1
          $scope.prev()

        $scope.$watchGroup ['currentPage', 'tags'], @fetchPosts
    }