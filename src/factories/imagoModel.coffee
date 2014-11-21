class imagoModel extends Service

  constructor: (@$rootScope, @$http, @$location, @$q, @imagoUtils, @imagoWorker, @sortWorker) ->
    if (data is 'online' and debug)
      @host = window.location.protocol + "//api.2.imagoapp.com"
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

      batch: (list) =>
        $http.put "#{@host}/api/assets/update", {assets: list}

  data: []

  currentCollection: undefined

  getSearchUrl: ->
    if (data is 'online' and debug)
      return "#{window.location.protocol}//api.2.imagoapp.com/api/search"
    else
      return "http://localhost:8000/api/search"

  search: (query) ->
    # console.log 'search...', query
    params = @formatQuery query
    # console.log 'params', params
    return @$http.post(@getSearchUrl(), angular.toJson(params))

  getLocalData: (query, opts = {}) =>

    defer = @$q.defer()

    for key, value of opts
      if key is 'localData' and value is false
        defer.reject query

    for key, value of query

      if key is 'fts'
        console.log 'reject if fts', query
        defer.reject query

      else if key is 'collection'
        query = @imagoUtils.renameKey('collection', 'path', query)
        path = value

      else if key is 'kind'
        query = @imagoUtils.renameKey('kind', 'metakind', query)

      else if key is 'path'
        path = value

    if path

      if _.isString path
        asset = @find('path' : path)

      else if _.isArray path
        asset = @find('path' : path[0])

      if asset

        asset.assets = @findChildren(asset)


        if asset.count or asset.assets.length

          if asset.assets.length isnt asset.count
            # console.log "count not same as assets.length - go to server", asset.count, asset.assets.length
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

  getData: (query , opts = {}) =>

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
      promises.push @getLocalData(value, opts).then (result) =>

        if result.assets
          worker =
            assets :  result.assets
            order  :  result.sortorder
            path   :  @sortWorker

          fetches.push @imagoWorker.work(worker).then (response) =>
            result.assets = response.assets
            data.push result
            data = _.flatten data

        else
          data.push result
          data = _.flatten data

      , (reject) =>
        console.log 'rejected query', reject
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
    if data.assets
      for asset in data.assets
        if @imagoUtils.isBaseString(asset.serving_url)
          asset.base64 = true
        else
          asset.base64 = false

        @data.push(asset) unless @find('_id': asset._id)

    unless @find('_id' : collection._id)
      collection = _.omit collection, 'assets' if collection.kind is 'Collection'
      @data.push collection

    return data

  findChildren: (asset) =>
    _.where @data, {parent: asset._id}

  findParent: (asset) =>
    _.find @data, {'_id': asset.parent}

  findByAttr: (options = {}) =>
    _.where @data, options

  find: (options = {}) =>
    _.find @data, options

  findIdx: (options = {}) =>
    _.findIndex @data, options

  filterAssets: (assets, query) =>
    delete query.path if query.path
    if _.keys(query).length > 0
      for key, value of query
        for params in value
          if key isnt 'path'
            assets = _.filter assets, (asset) ->
              if asset.fields?.hasOwnProperty key
                return asset if asset.fields[key]['value'] is params

              else if asset[key] is params
                return asset

    return assets

  updateCount: (parent, number) =>
    parent.count = parent.count + number
    @update parent, {stream: false}

  add: (assets, options = {}) =>
    options.stream = true if _.isUndefined options.stream
    options.push = true if _.isUndefined options.push

    if options.save
      defer = @$q.defer()

      @assets.create(assets).then (result) =>

        if options.push

          for asset in result.data.data
            if @imagoUtils.isBaseString(asset.serving_url)
              asset.base64 = true
            else
              asset.base64 = false

            @data.push(asset)

        defer.resolve result.data.data
        @$rootScope.$emit('assets:add', result.data.data) if options.stream

      defer.promise

    else

      if options.push
        for asset in assets
          if @imagoUtils.isBaseString(asset.serving_url)
            asset.base64 = true
          else
            asset.base64 = false
          @data.push(asset)

      @$rootScope.$emit('assets:add', assets) if options.stream

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
      if idx isnt -1
        @data[idx] = _.assign(@data[idx], copy)

      else
        @data.push copy

      if options.save
        delete copy.serving_url if copy.status is 'processing'
        @assets.update(copy)

    else if _.isArray(copy)
      for asset in copy
        query = {}
        query[attribute] = asset[attribute]
        delete asset.assets if asset.assets
        idx = @findIdx(query)
        if idx isnt -1
          _.assign(@data[idx], asset)

        else
          @data.push asset

        delete asset.serving_url if asset.status is 'processing'

      @assets.batch(copy) if options.save

    @$rootScope.$emit('assets:update', copy) if options.stream

  delete: (assets, options = {}) =>
    return unless assets
    defer = @$q.defer()
    options.stream = true if _.isUndefined options.stream

    for asset in assets
      @data = _.reject(@data, {'_id': asset._id })
      @assets.delete(asset._id) if options.save

    defer.resolve(assets)

    @$rootScope.$emit('assets:delete', assets) if options.stream
    defer.promise

  trash: (assets) =>
    request = []
    for asset in assets
      newAsset =
        '_id' : asset._id

      request.push newAsset

    @assets.trash(request)
    @delete(assets)

  copy: (assets, sourceId, parentId) =>

    @paste(assets).then (pasted) =>

      request = []

      for asset in pasted
        newAsset =
          '_id'   : asset._id
          'order' : asset.order
          'name'  : asset.name

        request.push(newAsset)

      @assets.copy(request, sourceId, parentId)
        .then (result) =>
          if @currentCollection.sortorder is '-order'
            @update(result.data)

          else
            @update(result.data, {stream: false})
            @reSort(@currentCollection)

  move: (assets, sourceId, parentId) =>
    @paste(assets).then (pasted) =>

      request = []

      for asset in pasted
        formatted =
          '_id'    : asset._id
          'order' : asset.order
          'name'  : asset.name

        request.push formatted

      if @currentCollection.sortorder is '-order'
        @update(pasted)

      else
        @update(pasted, {stream: false})
        @reSort(@currentCollection)

      @assets.move(request, sourceId, parentId)

  paste: (assets, options={}) =>
    options.checkdups = true if _.isUndefined options.checkdups

    defer = @$q.defer()

    assetsChildren = @findChildren(@currentCollection)

    checkAsset = (asset) =>
      deferAsset = @$q.defer()

      if not options.checkdups or _.where(assetsChildren, {name: asset.name}).length is 0
        deferAsset.resolve asset

      else
        i = 1
        exists = true
        original_name = asset.name
        while exists
          asset.name = "#{original_name}_#{i}"
          i++
          exists = (if _.where(assetsChildren, {name: asset.name}).length > 0 then true else false)

        deferAsset.resolve asset

      deferAsset.promise

    queue = []

    for asset in assets
      queue.push checkAsset(asset)

    @$q.all(queue).then (result) =>
      defer.resolve(result)

    defer.promise

  reSort: (collection) =>
    return if not collection.assets or collection.sortorder is '-order'

    orderedList = @reindexAll(collection.assets)
    @update orderedList, {stream: false, save: true}

    collection.sortorder = '-order'
    @update collection, {save : true}

  reindexAll:  (list) =>
    newList = []

    count = list.length

    for asset, key in list
      asset.order = (count-key) * 1000
      ordered =
        '_id'   : asset._id
        'order' : asset.order

      newList.push ordered

    return newList

  orderChanged:  (start, finish, dropped, list) =>
    if dropped < finish
      finish = finish+1
      prev = if list[dropped-1] then list[dropped-1].order else list[list.length-1].order+1000
      next = if list[finish] then list[finish].order else 0
      assets = list.slice dropped, finish

    else if dropped > start
      dropped = dropped+1
      prev = if list[start-1] then list[start-1].order else list[list.length-1].order+1000
      next = if list[dropped] then list[dropped].order else 0
      assets = list.slice(start, dropped)

    else
      return

    count = prev-1000

    for asset in assets
      asset.order = count
      count = count-1000

    return assets

  batchChange: (assets) =>
    for asset, idx in assets
      original = @find('_id' : asset._id)

      return unless original

      copy =
        fields : original.fields
        parent : original.parent

      toedit = angular.copy asset

      for key, value of toedit
        if key is 'fields'

          for key of toedit.fields
            copy['fields'] or= {}
            copy['fields'][key] = toedit.fields[key]

        else
          copy[key] = toedit[key]

      assets[idx] = copy

    @update assets, {save: true}

  isDuplicated: (asset, assets, options={}) =>
    options.rename = false if _.isUndefined options.rename

    defer = @$q.defer()
    defer.reject(asset.name) unless asset.name

    name = @imagoUtils.normalize(asset.name)
    result = undefined

    assetsChildren = _.where assets, (chr) =>
      return false if not chr.name
      normalizeName = angular.copy(@imagoUtils.normalize(chr.name))
      return normalizeName is name

    if assetsChildren.length > 0

      if assetsChildren.length is 1 and assetsChildren[0]._id is asset._id
        defer.resolve false

      if options.rename
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

    @isDuplicated(asset, parent.assets, {rename: rename}).then (isDuplicated) =>

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
              @update orderedList, {save: true}
              asset.order = orderedList[0].order + 1000

            else
              asset.order = 1000

            parent.sortorder = '-order'
            @update parent, {save: true}

        asset.parent = parent._id
        defer.resolve asset

    defer.promise
