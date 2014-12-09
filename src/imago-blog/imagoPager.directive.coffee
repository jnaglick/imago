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
      controller: ($scope, $element, $attrs)->

        @fetchPosts = () ->
          pageSize = parseInt $scope.pageSize
          console.log 'currentPage', $scope.currentPage
          # console.log 'fetchPost', $scope.path, $scope.currentPage, pageSize

          query =
            path:     $scope.path
            page:     $scope.currentPage
            pagesize: pageSize

          query['tags'] = $scope.tags if $scope.tags

          console.log 'query', query
          imagoModel.getData([query], {localData: false}).then (response) =>
            for collection in response
              console.log 'collection', collection
              $scope.posts = collection.assets
              $scope.totalPages = collection.count / collection.assets.length
              break

        $scope.onNext = =>
          $scope.currentPage += 1
          $scope.next()

        $scope.onPrev = =>
          $scope.currentPage -= 1
          $scope.prev()

        $scope.$watch 'currentPage', @fetchPosts
        $scope.$watch 'tag', @fetchPosts
    }