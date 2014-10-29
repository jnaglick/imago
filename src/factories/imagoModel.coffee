class imagoModel extends Service
  # I converted everything to the new syntax, but didn't refact the methods
  constructor: (@$rootScope, @$http, @$location, @$q, @imagoUtils) ->
    if (data is 'online' and debug)
      @host = window.location.protocol + "//imagoapi-nex9.rhcloud.com"
    else
      @host = window.location.protocol + "//localhost:8000"

    @assets =
      get: (id) =>
        $http.get "#{@host}/api/assets/#{id}"

      create: (assets) =>
        $http.post "#{@host}/api/assets", assets

      update: (item) =>
        $http.put "#{@host}/api/assets/#{item._id}", item

      delete: (id) =>
        $http.delete "#{@host}/api/assets/#{id}"

      trash: (assets) =>
        $http.post "#{@host}/api/assets/trash", assets

      move: (items, src, dest) =>
        data =
          src   : src
          dest  : dest
          items : items

        $http.post "#{@host}/api/assets/move", data

      copy: (items, src, dest) =>
        data =
          src   : src
          dest  : dest
          items : items

        $http.post "#{@host}/api/assets/copy", data

      batch: (object) =>

        # format = {
        #   assets: list
        # }

        $http.put "#{@host}/api/assets/update", object

  data: []

  currentCollection: undefined

  getSearchUrl: ->
    if (data is 'online' and debug)
      return "#{window.location.protocol}//imagoapi-nex9.rhcloud.com/api/search"
    else
      return "http://localhost:8000/api/search"

  search: (query) ->
    # console.log 'search...', query
    params = @formatQuery query
    return @$http.post(@getSearchUrl(), angular.toJson(params))

  getLocalData: (query) =>

    defer = @$q.defer()

    for key, value of query

      if key is 'fts'
        defer.reject query

      else if key is 'collection'
        query = @imagoUtils.renameKey('collection', 'path', query)
        path = value

      # else if key is 'kind'
        # query = @imagoUtils.renameKey('kind', 'metakind', query)

      else if key is 'path'
        path or= []
        path.push value

    if path

      if _.isString path
        asset = @find('path' : path)

      else if _.isArray path
        # if path[0] is '/'
        asset = @find('path' : path[0])

      if asset
        if asset.count? isnt 0
          asset.assets = @findChildren(asset)

          if asset.assets.length isnt asset.count
            # console.log 'rejected in count', asset.assets, asset.assets.length, asset.count
            defer.reject query

          else
            asset.assets = @filterAssets(asset.assets, query)

          defer.resolve asset

        else
          defer.resolve asset

      else
        defer.reject query

    else
      defer.reject query

    defer.promise

  getData: (query, cache) =>

    defer = @$q.defer()

    query = @$location.path() unless query
    if angular.isString query
      query =
        [path: query]

    query = @imagoUtils.toArray query

    promises = []
    fetches = []
    data = []

    resolve = =>
      @$q.all(fetches).then (resolve) =>
        defer.resolve data

    _.forEach query, (value) =>
      promises.push @getLocalData(value).then (result) =>
        data.push result
        data = _.flatten data
      , (reject) =>
        fetches.push @search(reject).then (response) =>
          return unless response.data
          response.data.page = reject.page if reject.page
          data.push @create response.data

    @$q.all(promises).then (response) ->
      resolve()

    defer.promise


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
    collection = data
    if collection.assets
      _.forEach collection.assets, (asset) =>
        return if @find 'id': asset.id
        if @imagoUtils.isBaseString(asset.serving_url)
          asset.base64 = true
        else
          asset.base64 = false
        @data.push asset

    unless @find('id' : collection.id)
      collection = _.omit collection, 'assets' if collection.kind is 'Collection'
      @data.push collection

    return data

  findChildren: (asset) =>
    _.where @data, {parent: asset._id}

  findParent: (asset) =>
    _.find @data, {_id: asset.parent}

  findByAttr: (options = {}) =>
    _.where @data, options

  find: (options = {}) =>
    _.find @data, options

  findIdx: (options = {}) =>
    _.findIndex @data, options

  filterAssets: (assets, query) =>

    if _.keys(query).length > 0
      for key, value of query
        for params in value
          if key isnt 'path'
            # console.log 'params', key, params
            assets = _.filter assets, (asset) ->
              if asset.fields?.hasOwnProperty key
                return asset if asset.fields[key]['value'] is params

              else if asset[key] is params
                return asset

    return assets

  add: (assets, options = {}) =>
      options.stream = true if _.isUndefined options.stream
      options.push = true if _.isUndefined options.push

      if options.save
        defer = @$q.defer()

        @assets.create(assets).then (result) =>

          console.log 'result created', result

          if options.push

            for asset in result.data.data
              if @imagoUtils.isBaseString(asset.serving_url)
                asset.base64 = true
              else
                asset.base64 = false

              @data.unshift(asset)

          defer.resolve result.data.data
          @$rootScope.$broadcast('assets:update', result.data.data) if options.stream

        defer.promise

      else

        if options.push
          for asset in assets
            if @imagoUtils.isBaseString(asset.serving_url)
              asset.base64 = true
            else
              asset.base64 = false
            @data.unshift(asset)

        @$rootScope.$broadcast('assets:update', assets) if options.stream

  update: (data, options = {}) =>
    options.stream = true if _.isUndefined options.stream
    attribute = (if options.attribute then options.attribute else '_id')

    copy = angular.copy data
    if _.isPlainObject(copy)
      query = {}
      query[attribute] = copy[attribute]
      return unless copy[attribute]
      delete copy.assets if copy.assets
      idx = @findIdx(query)
      @data[idx] = _.assign(@data[idx], copy)

    else if _.isArray(copy)
      for asset in copy
        query = {}
        query[attribute] = asset[attribute]
        delete asset.assets if asset.assets
        idx = @findIdx(query)
        _.assign(@data[idx], asset)

    @$rootScope.$broadcast('assets:update', copy) if options.stream
    @assets.update(copy) if options.save


  delete: (id, save=false) =>
    return unless id
    # returns an array without the asset of id
    @data = _.reject(@data, { _id: id })
    @$rootScope.$broadcast 'assets:update', id
    @assets.delete(id) if save
    return @data

  move: (data) =>
    # I'm not sure if thise will work as intended
    # finds assets of a collection then reorders them
    # and returns the reordered array
    assets = @findChildren(data)
    _.forEach assets, (asset) =>
        order = _.indexOf assets, asset
        assets.splice order, 1

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

  batchAddRemove: (assets, options = {}) =>
    options.stream = true if _.isUndefined options.stream

    for asset in assets
      @data = _.reject(@data, { _id: asset.id })
      @data.push asset

    @$rootScope.$broadcast('assets:update', assets) if options.stream

  reorder: (assets, options = {}) =>

    copy = []

    for asset, index in assets
      idxAsset = @findIdx 'id': asset._id

      if idxAsset isnt -1
        asset = _.assign @data[idxAsset], asset
        copy.push asset

        idx = (if idxAsset > idx then idx else idxAsset)

    args = [idx, assets.length].concat(copy)
    Array.prototype.splice.apply(@data, args)

    @$rootScope.$broadcast('assets:update', assets) if options.stream
    @assets.batch(assets: assets) if options.save

  reindexAll:  (list) =>
    newList = []

    count = list.length

    for asset, key in list
      asset.order = (count-key) * 1000
      ordered =
        _id: asset._id
        order: asset.order

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
      idx = @findIdx('_id' : asset._id)

      return if idx is -1

      copy = angular.copy asset

      for key, value of copy
        continue unless key isnt '_id' and key isnt 'id'

        if key is 'fields'

          for key of copy.fields
            @data[idx]['fields'] or= {}
            @data[idx]['fields'][key] or= {}
            @data[idx]['fields'][key] = copy.fields[key]

        else
          @data[idx][key] = copy[key]

    if save
      object =
        assets : assets

      return object

    else return false

  isDuplicated: (asset, rename = false) =>
    defer = @$q.defer()

    defer.reject(asset.name) unless asset.name

    name = @imagoUtils.normalize(asset.name)

    result = undefined

    assetsChildren = _.where @currentCollection.assets, (chr) =>
      normalizeName = angular.copy @imagoUtils.normalize(chr.name)
      return normalizeName is name

    if assetsChildren.length > 0

      if assetsChildren.length is 1 and assetsChildren[0].id is asset.id
        defer.resolve false

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

        defer.resolve name

      else
        defer.resolve true

    else
      defer.resolve false

    defer.promise

  prepareCreation: (asset, parent, order, rename = false) =>
    defer = @$q.defer()
    defer.reject(asset.name) unless asset.name

    @isDuplicated(asset, rename).then (isDuplicated) =>

      if isDuplicated and _.isBoolean isDuplicated
        defer.resolve('duplicated')

      else

        if _.isString isDuplicated
          asset.name = isDuplicated

        if order
          asset.order = order

        else

          if parent.sortorder is '-order'

            assets = parent.assets
            asset.order = (if assets.length then assets[0].order + 1000 else 1000)

          else

            if parent.assets.length

              orderedList = @reindexAll(parent.assets)
              @reorder orderedList.assets, {save: true, stream: true}
              asset.order = orderedList.assets[0].order + 1000

            else
              asset.order = 1000

            parent.sortorder = '-order'
            @update parent, {save: true}

        asset.parent = parent._id

        defer.resolve asset

    defer.promise
