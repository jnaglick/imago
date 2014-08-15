class imagoModel extends Service
  # I converted everything to the new syntax, but didn't refact the methods
  constructor: (@$http, @$location, @$q, @$filter, @imagoUtils) ->

  data: []

  tenant: ''

  currentCollection: ''

  searchUrl: if (data is 'online' and debug) then "http://#{tenant}.imagoapp.com/api/v3/search" else "/api/v3/search"

  search: (query) ->
    # console.log 'search...', query
    params = @formatQuery query
    return @$http.post(@searchUrl, angular.toJson(params))

    # TODO ISSUE: This getData set up is only good if we get exactly one object back.
    #      If the post returns an array with multiple objects each with their own path
    #      the current getData would only add the first object in the array, and if we looped
    #      over the array we'd add a new property onto list for each object in response.data
    #      Maybe we should find a different approach to naming the 'keys' in @list.

  getData: (query, cache) ->
    # query = @$location.$$path unless query
    if angular.isString query
      query =
        [path: query]

    query = @imagoUtils.toArray query

    promises = []

    angular.forEach query, (value) =>
      promises.push @search(value).then (response) =>
        return unless response.data.length > 0

        response.data[0].page = value.page if value.page

        for data in response.data
          for asset in @data
            return unless angular.equals(asset, data)
             # if this returns the model
             @create data

    @$q.all(promises).then (data) =>
      # What does data equal here.
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

  create: (data) ->
    if data.assets
      _.forEach data.assets, (asset) =>
        @data.push asset
      @data.push model = _.omit data, 'assets'
      return model
    else
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

  findIdx: (id) =>
    _.findIndex @data, id

  add: (asset) =>
    return unless asset._id
    @data.push asset

  update = (asset) =>
    return unless asset._id
    @data[_.indexOf(@data, asset)] = asset

  delete: (id) =>
    return unless id
    #returns an array without the asset of id
    @data = _.reject(@data, { _id: id })

  move: (data) =>
    # I'm not sure if thise will work as intended
    # finds assets of a collection then reorders them
    # and returns the reordered array
    assets = @findChildren(data)
    _.forEach assets, (asset) =>
        order = _.indexOf assets, asset
        assets.splice order, 1

  paste: (assets, checkdups=true) =>
    for asset in assets
      if not checkdups or not @checkDuplicate(asset.name, assets)
        @data.push asset
      else
        i = 1
        exists = true
        original_name = asset.name
        while exists
          exists = @checkDuplicate(asset.name)
          asset.name = "#{original_name}_#{i}"
          i++

        @data.push asset

  reindexAll:  (path = @$location.$$path) =>

    return if @list[path].sortorder is '-order'

    @list[path].sortorder is '-order'
    @list[path].sortorder = '-order'
    # imagoRest.asset.update @list

    newList = []

    count = @list[path].assets.length

    for asset, key in @list[path].assets
      asset.order = (count-key) * 1000
      ordered = {
        _id: asset._id
        order: asset.order
      }
      newList.push ordered

    orderedList =
      parent : @list[path]._id
      assets : newList

    return orderedList

    # imagoRest.asset.batch(orderedList)
    #   .then (result) ->
    #     console.log 'result batch updating', result

  orderChanged:  (start, finish, dropped, path = @$location.$$path) =>
    if dropped < finish
      finish = finish+1
      prev = if @list[path].assets[dropped-1] then @list[path].assets[dropped-1].order else @list[path].assets[0]+1000
      next = if @list[path].assets[finish] then @list[path].assets[finish].order else 0
      assets = @list[path].assets.slice dropped, finish

    else if dropped > start
      dropped = dropped+1
      prev = if @list[path].assets[start-1] then @list[path].assets[start-1].order else @list[path].assets[0]+1000
      next = if @list[path].assets[dropped] then @list[path].assets[dropped].order else 0
      assets = @list[path].assets.slice start, dropped

    else
      return

    console.log 'prev', prev, 'next', next

    count = prev - 1000

    for asset in assets
      asset.order = count
      count = count-1000
      # console.log 'order', asset.order, 'name', asset.name

    orderedList =
      parent: @list[path]._id
      assets: assets

    console.log assets

    return orderedList

    # imagoRest.asset.batch(orderedList)
    #   .then (result) ->
    #     console.log 'new order saved', result


  reorder: (id) =>
    # not sure if this fucks up the reorder let me know.
    # we could also do this by path.
    model = @findById(id)
    list =
      order : model.sortorder
      assets: @findChildren(model)

    @worker.postMessage list

  batchChange: (assets, save = false, path = @$location.$$path) =>
    for asset in assets
      idx = @findIdx(asset._id)
      return if idx is -1

      if _.isBoolean(asset.visible)
        @list[path].assets[idx]['visible'] = asset.visible

      for key of asset.meta
        @list[path].assets[idx]['meta'] or= {}
        @list[path].assets[idx]['meta'][key] or= {}
        @list[path].assets[idx]['meta'][key]['value'] = asset.meta[key]['value']

    if save
      object =
        parent : @list[path]._id
        assets : assets

      return object

    else return false

      # imagoRest.asset.batch object

  checkDuplicate: (name, assets) =>
    return unless name
    nameIfDuplicate = name
    nameIfDuplicate = @imagoUtils.normalize nameIfDuplicate

    normalizeList = []

    for asset in assets
      normalizeList.push @imagoUtils.normalize asset.name

    if @$filter('filter')(normalizeList, nameIfDuplicate, true).length > 1 then return true  else return false

  prepareCreation: (asset, parent) =>
    return unless asset.name

    assets = @findChildren _id : parent

    return unless @checkDuplicate asset.name

    asset.parent = parent
    asset._tenant = @data.tenant
    asset.order = (if assets.length is 0 then 1000 else assets[0].order + 1000)

    return asset

    # return imagoRest.asset.create(asset)
