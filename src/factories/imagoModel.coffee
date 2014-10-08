class imagoModel extends Service
  # I converted everything to the new syntax, but didn't refact the methods
  constructor: (@$rootScope, @$http, @$location, @$q, @imagoUtils) ->

  data: []

  currentCollection: undefined

  getSearchUrl: ->
    if (data? is 'online' and debug?)
      return "#{window.location.protocol}//imagoapi-nex9.rhcloud.com/api/search"
    else
      return "/api/search"

  search: (query) ->
    # console.log 'search...', query
    params = @formatQuery query
    return @$http.post(@getSearchUrl(), angular.toJson(params))

  getData: (query, cache) =>
    query = @$location.path() unless query
    if angular.isString query
      query =
        [path: query]

    query = @imagoUtils.toArray query

    promises = []

    _.forEach query, (value) =>
      promises.push @search(value).then (response) =>
        return unless response.data
        response.data.page = value.page if value.page
        @create response.data


    @$q.all(promises).then (data) =>
      # What does data equal here.
      data = _.flatten data
      return data

  formatQuery: (query) ->
    querydict = {}
    if angular.isArray(query)
      for elem in query
        for key of elem
          value = elem[key]
          querydict[key] or= []
          querydict[key].push(value)
    else
      for key of query
        value = query[key]
        querydict[key] = if angular.isArray(value) then value else [value]
    for key in ['page', 'pagesize']
      if querydict.hasOwnProperty(key)
        querydict[key] = querydict[key][0]
    querydict

  create: (data) =>
    oldData = @find(data._id) or false
    if data.assets
      _.forEach data.assets, (asset) =>
        oldAsset = @find(asset._id) or false
        if _.isEqual(oldAsset, asset)
          return
        else if oldAsset and not _.isEqual(oldAsset, asset)
          # @update(asset)
        else
          if @imagoUtils.isBaseString(asset.serving_url)
            asset.base64 = true
          else
            asset.base64 = false
          @data.push asset

    if _.isEqual(oldData, data)
      return data
    else if oldData and not _.isEqual(oldData, data)
      # @update(data)
      return data
    else
      data = _.omit data, 'assets' if data.assets
      @data.push data
      return data

  findChildren: (asset) =>
    _.where @data, {parent: asset._id}

  findParent: (asset) =>
    _.find @data, {_id: asset.parent}

  findByAttr: (attr) =>
    _.where @data, attr

  find: (id) =>
    _.find @data, '_id' : id

  findIdx: (id, attribute = '_id') =>
    parameter = {}
    parameter[attribute] = id
    _.findIndex @data, parameter

  add: (asset) =>
    if @imagoUtils.isBaseString(asset.serving_url)
      asset.base64 = true
    else
      asset.base64 = false
    @data.unshift asset
    @$rootScope.$broadcast 'assets:update', asset

  update: (data, attribute = '_id') =>
    if _.isPlainObject(data)
      return unless data[attribute]
      delete data.assets if data.assets
      idx = @findIdx(data[attribute], attribute)
      @data[idx] = _.assign(@data[idx], data)

    else if _.isArray(data)
      for asset in data
        delete asset.assets if asset.assets
        idx = @findIdx(asset[attribute], attribute)
        _.assign(@data[idx], asset)

    @$rootScope.$broadcast 'assets:update', data


  delete: (id) =>
    return unless id
    # returns an array without the asset of id
    @data = _.reject(@data, { _id: id })
    @$rootScope.$broadcast 'assets:update', id
    return @data

  # move: (data) =>
  #   # I'm not sure if thise will work as intended
  #   # finds assets of a collection then reorders them
  #   # and returns the reordered array
  #   assets = @findChildren(data)
  #   _.forEach assets, (asset) =>
  #       order = _.indexOf assets, asset
  #       assets.splice order, 1

  paste: (assets, checkdups=true) =>
    defer = @$q.defer()

    assetsChildren = @findChildren(@currentCollection)

    for asset in assets
      if not checkdups or _.where(assetsChildren, {name: asset.name}).length is 0
        @data.unshift asset

      else
        i = 1
        exists = true
        original_name = asset.name
        while exists
          asset.name = "#{original_name}_#{i}"
          i++
          exists = (if _.where(assetsChildren, {name: asset.name}).length > 0 then true else false)

        @data.unshift asset

    @$rootScope.$broadcast 'assets:update', assets

    defer.resolve assets

    defer.promise

  batchAddRemove: (assets) =>

    for asset in assets
      @data = _.reject(@data, { _id: asset.id })
      @data.push asset

    @$rootScope.$broadcast 'assets:update', assets

  reorder: (assets) =>

    for asset in assets
      idxAsset = @findIdx asset._id
      idx = (if idxAsset > idx then idx else idxAsset)

    args = [idx, assets.length].concat(assets)
    Array.prototype.splice.apply(@data, args)

    @$rootScope.$broadcast 'assets:update', assets

  reindexAll:  (list) =>

    newList = []

    count = list.length

    for asset, key in list
      asset.order = (count-key) * 1000
      ordered = {
        _id: asset._id
        order: asset.order
      }
      newList.push ordered

    orderedList =
      assets : newList

    return orderedList

  orderChanged:  (start, finish, dropped, list) =>

    if dropped < finish
      finish = finish+1
      prev = if list[dropped-1] then list[dropped-1].order else list[0].order+1000
      next = if list[finish] then list[finish].order else 0
      assets = list.slice dropped, finish

    else if dropped > start
      dropped = dropped+1
      prev = if list[start-1] then list[start-1].order else list[0].order+1000
      next = if list[dropped] then list[dropped].order else 0
      assets = list.slice start, dropped

    else
      return

    console.log 'prev', prev, 'next', next

    count = prev-1000

    for asset in assets
      # console.log 'asset', asset.order, asset.name
      asset.order = count
      count = count-1000

    orderedList =
      assets: assets

    return orderedList

  batchChange: (assets, save = false) =>

    for asset in assets
      idx = @findIdx(asset._id)

      return if idx is -1

      if _.isBoolean(asset.visible)
        @data[idx]['visible'] = asset.visible

      for key of asset.fields
        @data[idx]['fields'] or= {}
        @data[idx]['fields'][key] or= {}
        @data[idx]['fields'][key]['value'] = asset.fields[key]['value']

    if save
      object =
        assets : assets

      return object

    else return false

  isDuplicated: (name, rename = false) =>
    defer = @$q.defer()

    defer.reject(name) unless name

    name = @imagoUtils.normalize(name)

    result = undefined

    assetsChildren = _.find @currentCollection.assets, (chr) =>
      normalizeName = angular.copy @imagoUtils.normalize(chr.name)
      return normalizeName is name

    if assetsChildren

      if rename
        assets = @currentCollection.assets
        i = 1
        exists = true
        original_name = name
        while exists
          name = "#{original_name}_#{i}"
          i++
          findName = _.find assets, (chr) =>
            normalizeName = angular.copy @imagoUtils.normalize(chr.name)
            return normalizeName is name
          exists = (if findName then true else false)

        result = name

        defer.resolve(result)

      else
        result = true
        defer.resolve result

    else
      result = false
      defer.resolve result

    defer.promise


  prepareCreation: (asset, parent, order, rename = false) =>
    defer = @$q.defer()
    defer.reject(asset.name) unless asset.name

    @isDuplicated(asset.name, rename).then (isDuplicated) =>

      if isDuplicated and _.isBoolean isDuplicated
        defer.resolve('duplicated')

      else

        if _.isString isDuplicated
          asset.name = isDuplicated

        if order
          asset.order = order

        else
          assets = @findChildren(parent)
          asset.order = (if assets.length is 0 then 1000 else assets[0].order + 1000)

        asset.parent = parent

        defer.resolve asset

    defer.promise
