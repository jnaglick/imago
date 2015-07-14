class imagoPage extends Controller
  constructor: ($location, imagoModel) ->

    @path = if $location.path() is '/' then '/home' else $location.path()

    imagoModel.getData({path: @path}).then (response) =>
      for data in response
        @data = data
        break