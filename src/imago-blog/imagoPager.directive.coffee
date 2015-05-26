class imagoPager extends Directive

  constructor: ($http, $compile, $templateCache, imagoModel) ->

    defaultTemplate = '/imago/imagoPager.html'
    getTemplate = (url) ->

      templateLoader = $http.get(url,
        cache: $templateCache
      )
      templateLoader

    return {
      scope: {
        posts: '='
        nextPage: '&next'
        prevPage: '&prev'
        path: '@'
        pageSize: '@'
        tags: '='
        currentPage: '='
        shuffle: '@'
      }
      controller: ($scope, $element, $attrs) ->

        @fetchPosts = ->
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
              $scope.next = collection.next

              if $scope.shuffle
                $scope.posts = _.shuffle collection.assets
              else
                $scope.posts = collection.assets

              $scope.totalPages = collection.count / pageSize
              break

        $scope.onPrev = =>
          $scope.currentPage = parseInt($scope.currentPage) - 1
          $scope.prevPage()

        $scope.onNext = =>
          $scope.currentPage = parseInt($scope.currentPage) + 1
          $scope.nextPage()

        $scope.$watchGroup ['currentPage', 'tags'], @fetchPosts

      link: (scope, element, attrs) ->
        template = if attrs.templateurl then attrs.templateurl else defaultTemplate

        syntax = undefined

        getTemplate(template).success((html) ->
          syntax = html
        ).then ->
          element.append $compile(syntax)(scope)
    }