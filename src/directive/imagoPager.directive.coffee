class imagoPager extends Directive

  constructor: (imagoModel) ->
    return {
      scope: {
        posts: '='
        next: '&'
        prev: '&'
        path: '@'
        pageSize: '@'
      }
      templateUrl: '/imagoWidgets/imagoPager.html'
      controller: ($scope, $element, $attrs)->

        @fetchPosts = () ->
            pageSize = parseInt $scope.pageSize
            console.log 'fetchPost', $scope.path, $scope.currentPage, pageSize
            imagoModel.getData([{path: $scope.path, page: $scope.currentPage, pagesize: pageSize}], {localData: false}).then (response) =>
                for collection in response
                    # console.log 'collection', collection
                    $scope.posts = collection.assets
                    $scope.totalPages = collection.count / collection.assets.length
                    break

        $scope.currentPage = 1

        $scope.onNext = =>
          $scope.currentPage += 1
          $scope.next()

        $scope.onPrev = =>
          $scope.currentPage -= 1
          $scope.prev()

        $scope.$watch 'currentPage', @fetchPosts
    }