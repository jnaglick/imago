class imagoModel extends Service

  constructor: (@$http, @$location, @$q, @$filter, @imagoUtils) ->

  data: []

  tenant: ''

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
            continue if angular.equals(asset, data)
             @create data

    @$q.all(promises).then (data) =>
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
    #create model here and save to @data


    @findAsset = (path, index) =>
      return @list[path][index or 0]

    @findByAttr = (path, attr) =>
      _.find @list[path], attr

    @find = (id, path = @$location.$$path) =>
      _.find @list[path].assets, '_id' : id

    @findIdx = (id, path = @$location.$$path) =>
      _.findIndex @list[path].assets, '_id' : id

    @create = (asset, path = @$location.$$path) =>
      return unless asset._id
      @list[path].assets.unshift asset

    @update = (asset, path = @$location.$$path) =>
      return unless asset._id

      id =
        _id: asset._id

      filter = @$filter('filter')(@list[path].assets, id)

      return if filter.length is 0
      for result in filter
        order = @list[path].assets.indexOf result
        @list[path].assets[order] = asset

    @delete = (id, path = @$location.$$path) =>
      return unless id

      id =
        _id: id

      filter = @$filter('filter')(@list[path].assets, id)
      return if filter.length is 0
      for result in filter
        order = @list[path].assets.indexOf result
        @list[path].assets.splice order, 1

    @move = (data, path = @$location.$$path) =>
      for asset in data.assets
        id =
          _id: asset._id

        filter = @$filter('filter')(@list[path].assets, id)
        if filter.length > 0
          for result in filter
            order = @list[path].assets.indexOf result
            @list[path].assets.splice order, 1

    @paste = (assets, checkdups=true, path = @$location.$$path) =>
      for asset in assets
        if not checkdups or not @checkDuplicate(asset.name)
          @list[path].assets.unshift asset
        else
          i = 1
          exists = true
          original_name = asset.name
          while exists
            exists = @checkDuplicate(asset.name)
            asset.name = "#{original_name}_#{i}"
            i++

          @list[path].assets.unshift asset

    @reindexAll = (path = @$location.$$path) =>

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

    @orderChanged = (start, finish, dropped, path = @$location.$$path) =>
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


    @reorder = (path = @$location.$$path) =>
      list =
        order : @list[path].sortorder
        assets: @list[path].assets

      @worker.postMessage list

    @batchChange = (assets, save = false, path = @$location.$$path) =>
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

    @checkDuplicate = (name, path = @$location.$$path) ->
      return unless name
      nameIfDuplicate = name
      nameIfDuplicate = @imagoUtils.normalize nameIfDuplicate

      normalizeList = []

      for asset in @list[path].assets
        normalizeList.push @imagoUtils.normalize asset.name

      if @$filter('filter')(normalizeList, nameIfDuplicate, true).length > 1 then return true  else return false

    @prepareCreation = (asset, path = @$location.$$path) =>
      return unless asset.name or not @checkDuplicate asset.name

      asset.parent = @list[path]._id
      asset._tenant = @list[path]._tenant
      asset.order = (if @list[path].assets.length is 0 then 1000 else @list[path].assets[0].order + 1000)

      return asset

      # return imagoRest.asset.create(asset)

    return @
