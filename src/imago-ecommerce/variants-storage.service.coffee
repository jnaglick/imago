class VariantsStorage extends Service

  data: []

  constructor: (@$http, @$q, @imagoModel, @imagoSettings) ->

  search: (id) ->
    return @$http.get("#{@imagoSettings.host}/api/variants/#{id}")

  get: (parent) ->
    defer = @$q.defer()

    asset = @imagoModel.find {_id: parent}
    data = _.filter @data, {parent: parent}

    if asset?.variants.length is data.length
      defer.resolve data
    else
      @search(parent).then (response) ->
        defer.resolve response.data

    defer.promise