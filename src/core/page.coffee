class imagoPage extends Controller
  constructor: ($scope, $state, imagoModel) ->
    path = '/'

    imagoModel.getData(path).then (response) ->
      $scope.collection = response[0]
      $scope.assets = imagoModel.getChildren(response[0])
