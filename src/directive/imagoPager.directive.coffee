class imagoPager extends Directive

  constructor: (imagoModel) ->
    return {
      scope:
        posts: '='
        next: '&'
        prev: '&'
        path: '@'
        pageSize: '@'
      templateUrl: '/imagoWidgets/imagoPager.html'
      controller: ($scope, $element, $attrs)->

        # @options =
        #   path:     $scope.path or '/blog'
        #   pageSize: $scope.pageSize or 5

        @fetchPosts = () ->
            # query = {path:'/blog', pagesize: 16}
            # query.page = pageNo if pageNo
            # query.tags = tag if tag
            # @tag = tag if tag
            console.log 'fetchPost', $scope.path, $scope.currentPage, $scope.pageSize
            # imagoModel.getData([{path: $scope.path, page: $scope.currentPage, pagesize: $scope.pagesize}]).then (response) =>
            #     for collection in response
            #         $scope.posts = collection.assets
            #         break

        $scope.currentPage = 1

        $scope.onNext = =>
          $scope.currentPage += 1
          $scope.next()
          @fetchPosts()

        $scope.onPrev = =>
          $scope.currentPage -= 1
          $scope.prev()

        $scope.$watch 'currentPage', @fetchPosts
    }