class imagoModel extends Service

  constructor: (@$rootScope, @$http, @$location, @$document, @$q, @imagoUtils, @imagoWorker, @imagoSettings) ->

    @assets =
      get: (id) =>
        @$http.get "#{@imagoSettings.host}/api/v1/assets/#{id}"

      create: (assets) =>
        @$http.post "#{@imagoSettings.host}/api/v1/assets", assets # TODO undocument/not supported

      update: (item) =>
        @$http.put "#{@imagoSettings.host}/api/v1/assets/#{item._id}", item # TODO undocument/not supported

      delete: (id) =>
        @$http.delete "#{@imagoSettings.host}/api/v1/assets/#{id}" # TODO undocument/not supported

      trash: (assets) =>
        @$http.post "#{@imagoSettings.host}/api/v1/assets/trash", assets # TODO undocument/not supported

      move: (items, src, dest) =>
        data =
          src   : src
          dest  : dest
          items : items

        @$http.post "#{@imagoSettings.host}/api/v1/assets/move", data # TODO undocument/not supported

      copy: (items, src, dest) =>
        data =
          src   : src
          dest  : dest
          items : items

        @$http.post "#{@imagoSettings.host}/api/v1/assets/copy", data # TODO undocument/not supported

      batch: (list) =>
        defer = @$q.defer()
        promises = []
        list = _.chunk(list, 100)
        for request in list
          promises.push @$http.put "#{@imagoSettings.host}/api/v1/assets/update", {assets: request} # TODO undocument/not supported
        @$q.all(promises).then =>
          defer.resolve()
        defer.promise

      download: (ids, res) =>
        @$http.post "#{@imagoSettings.host}/api/v1/assets/download", {assets: ids, resolution: res} # TODO undocument/not supported

      repair: (id) =>
        @$http.put "#{@imagoSettings.host}/api/v1/assets/repairorder", {_id: id} # TODO undocument/not supported

  data: []

  currentCollection: undefined

  search: (query) ->
    # console.log 'search...', query
    params = _.map query, @formatQuery
    # console.log 'params', params
    unless params.length
      defer = @$q.defer()
      defer.resolve()
      return defer.promise
    return @$http.post("#{@imagoSettings.host}/api/v1/search", angular.toJson(params))

  getLocalData: (query, options = {}) =>
    defer = @$q.defer()

    for key, value of options
      if key is 'localData' and value is false
        # console.log 'localdata false', query
        defer.reject query

    for key, value of query

      if key is 'fts'
        # console.log 'fts'
        defer.reject query

      else if key is 'collection'
        query = @imagoUtils.renameKey('collection', 'path', query)
        path = value

      else if key is 'kind'
        query = @imagoUtils.renameKey('kind', 'type', query)

      else if key is 'metakind'
        query = @imagoUtils.renameKey('metakind', 'type', query)

      else if key is 'path'
        path = value

    if path?.slice(-1) is '/'
      path = path.substring(0, path.length - 1)
      query.path = path

    if path

      localQuery =
        'path' : if _.isString path then path else _.first(path)

      asset = @find(localQuery)

      if asset

        asset.assets = @findChildren(asset)

        if (asset.count or asset.assets.length) or asset.count is 0

          if asset.assets.length isnt asset.count or asset.count is 0
            # console.log "count not same as assets.length - go to server", asset.count, asset.assets.length
            defer.reject query

          else
            asset.assets = @filterAssets(asset.assets, query)
            defer.resolve asset

        else
          # console.log 'asset found asset has no children', asset
          defer.resolve asset

      else
        # console.log 'couldnt find asset'
        defer.reject query

    else
      # console.log 'no path'
      defer.reject query

    defer.promise

  getData: (query, options = {}) =>
    defer = @$q.defer()
    query = angular.copy query

    query = @$location.path() unless query
    if _.isString query
      query =
        [path: query]

    query = @imagoUtils.toArray query

    promises = []
    fetches = []
    data = []
    rejected = []

    resolve = =>
      fetches.push @search(rejected).then (response) =>
        console.log('not in the model. fetching...', rejected) if rejected?.length
        return unless response?.data
        for res in response.data
          data.push @create res

      @$q.all(fetches).then (resolve) =>

        if options.title
          @$document.prop 'title', options.title
        else if data.length is 1 and data[0].fields?.title?.value
          @$document.prop 'title', data[0].fields.title.value
        else if data.length is 1 and data[0].name
          @$document.prop 'title', data[0].name

        defer.resolve data

    _.forEach query, (value) =>
      promises.push @getLocalData(value, options).then (result) =>

        if result.assets
          worker =
            assets :  result.assets
            order  :  result.sortorder
            path   :  @imagoSettings.sort_worker

          fetches.push @imagoWorker.work(worker).then (response) =>
              result.assets = response.assets
              data.push result
              data = _.flatten data

        else
          data.push result
          data = _.flatten data

      , (reject) =>
        rejected.push reject

    @$q.all(promises).then (response) ->
      resolve()

    defer.promise

  formatQuery: (query) ->
    querydict = {}
    if _.isArray query
      for elem in query
        for key of elem
          value = elem[key]
          querydict[key] or= []
          querydict[key].push(value)
    else if _.isPlainObject query
      for key of query
        value = query[key]
        querydict[key] = if angular.isArray(value) then value else [value]

    else if _.isString query
      querydict['path'] = [query]

    for key in ['page', 'pagesize']
      if querydict.hasOwnProperty(key)
        querydict[key] = querydict[key][0]
    querydict

  addAsset: (asset) =>
    if @imagoUtils.isBaseString(asset.serving_url)
      asset.base64 = true
    else
      asset.base64 = false
    @data.push(asset) unless @find('_id': asset._id)
    @populateData asset.assets


  populateData: (assets) =>
    return if !_.isArray(assets)
    @addAsset asset for asset in assets

  getById: (id) ->
    defer = @$q.defer()

    asset = @find({'_id': id})
    if asset
      asset.assets = @findChildren(asset)
      defer.resolve(asset)
    else
      @assets.get(id).then (response) ->
        console.log 'getById:', response.data
        defer.resolve(response.data)

    defer.promise

  create: (data) =>
    collection = data
    @populateData data.assets

    unless @find('_id' : collection._id)
      collection = _.omit collection, 'assets' if collection.type is 'collection'
      @data.push collection

    return data

  findChildren: (asset) =>
    _.filter @data, {parent: asset._id}

  findParent: (asset) =>
    _.find @data, {'_id': asset.parent}

  findByAttr: (options = {}) =>
    _.filter @data, options

  find: (options = {}) =>
    _.find @data, options

  findIdx: (options = {}) =>
    _.findIndex @data, options

  filterAssets: (assets, query) =>
    # delete query.path if query.path
    query = _.omit query, 'path'
    if _.keys(query).length
      for key, value of query
        for params in value
          if key isnt 'path'
            assets = _.filter assets, (asset) ->
              # console.log 'asset', asset[key], params
              if asset.fields?.hasOwnProperty key
                value = asset.fields[key]['value']

                return true if value.match new RegExp params, 'i' if _.isString value
                return true if ParseFloat value == ParseFloat params if _.isNumber value
                if _.isArray value
                  for elem in value
                    return true if elem.match new RegExp params, 'i'
                return false

              else if asset[key]
                value = asset[key]
                return true if value.match new RegExp params, 'i' if _.isString value
                return true if ParseFloat value == ParseFloat params if _.isNumber value
                return false

    return assets

  updateCount: (parent, number) =>
    parent.count = parent.count + number
    @update parent, {stream: false}

  add: (assets, options = {}) =>
    defer = @$q.defer()
    options.stream = true if _.isUndefined options.stream
    options.push = true if _.isUndefined options.push

    if options.save
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

    else
      if options.push
        for asset in assets
          if @imagoUtils.isBaseString(asset.serving_url)
            asset.base64 = true
          else
            asset.base64 = false
          @data.push(asset)

        defer.resolve()

      @$rootScope.$emit('assets:add', assets) if options.stream

    defer.promise

  update: (data, options = {}) =>
    defer = @$q.defer()
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
        @assets.update(copy).then ->
          defer.resolve()

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

      if options.save
        @assets.batch(copy).then ->
          defer.resolve()
      else
        defer.resolve()

    @$rootScope.$emit('assets:update', copy) if options.stream
    defer.promise

  delete: (assets, options = {}) =>
    return unless assets
    defer = @$q.defer()
    options.stream = true if _.isUndefined options.stream

    for asset in assets
      _.remove @data, {'_id': asset._id}
      @assets.delete(asset._id) if options.save

    defer.resolve(assets)

    @$rootScope.$emit('assets:delete', assets) if options.stream
    defer.promise

  trash: (assets) =>
    request = []
    for asset in assets
      newAsset =
        '_id'   : asset._id
        'name'  : asset.name

      request.push newAsset

    @assets.trash(request)
    @delete(assets)

  copy: (assets, sourceId, parentId) =>
    defer = @$q.defer()
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
            @update(result.data).then ->
              defer.resolve()
          else
            @update(result.data, {stream: false})
            @reSort(@currentCollection).then ->
              defer.resolve()

    defer.promise

  move: (assets, sourceId, parentId) =>
    defer = @$q.defer()
    @paste(assets).then (pasted) =>

      if @currentCollection.sortorder is '-order'
        @update(pasted).then ->
          defer.resolve()
      else
        @update(pasted, {stream: false})
        @reSort(@currentCollection).then ->
          defer.resolve()

      request = []

      for asset in pasted
        formatted =
          '_id'    : asset._id
          'order' : asset.order
          'name'  : asset.name

        request.push formatted

      @assets.move(request, sourceId, parentId)

    defer.promise

  paste: (assets, options={}) =>
    defer = @$q.defer()
    options.checkdups = true if _.isUndefined options.checkdups
    assetsChildren = @findChildren(@currentCollection)

    checkAsset = (asset) =>
      deferAsset = @$q.defer()

      if not options.checkdups or _.filter(assetsChildren, {name: asset.name}).length is 0
        deferAsset.resolve asset

      else
        i = 1
        exists = true
        original_name = asset.name
        while exists
          asset.name = "#{original_name}_#{i}"
          i++
          exists = (if _.filter(assetsChildren, {name: asset.name}).length then true else false)

        deferAsset.resolve asset

      deferAsset.promise

    queue = []

    for asset in assets
      queue.push checkAsset(asset)

    @$q.all(queue).then (result) =>
      defer.resolve(result)

    defer.promise

  reSort: (collection) =>
    defer = @$q.defer()
    return if not collection.assets or collection.sortorder is '-order'

    orderedList = @reindexAll(collection.assets)
    @update orderedList, {stream: false, save: true}

    collection.sortorder = '-order'
    @update(collection, {save : true}).then ->
      defer.resolve()
    defer.promise

  reindexAll:  (list) =>
    newList = []

    count = list.length

    for asset, key in list
      asset.order = (count-key) * @imagoSettings.index
      ordered =
        '_id'   : asset._id
        'order' : asset.order

      newList.push ordered

    return newList

  reorder:  (dropped, list, selection, options = {}) =>
    options.process = true if _.isUndefined options.process

    if options.reverse
      count = dropped - selection.length
      idxOne = list[count]
      idxTwo = if list[dropped+1] then list[dropped+1] else {order: 0}
      selection = selection.reverse()
    else if options.process is false
      idxOne = list[dropped-1]
      idxTwo = if list[dropped] then list[dropped] else {order: 0}
    else
      count = dropped + selection.length
      idxOne = if list[dropped-1] then list[dropped-1]
      idxTwo = list[count]

    if not idxOne
      minusOrder = @imagoSettings.index
    else
      minusOrder = (idxOne.order-idxTwo.order) / (selection.length+1)
      repair = true if minusOrder <= 0.05

    data =
      minus  : minusOrder
      order  : idxTwo.order + minusOrder
      repair : repair

    return data

  batchAddTag: (assets) =>
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
            copy['fields'][key] or= []
            if copy['fields'][key].value.indexOf(toedit.fields[key]) is -1
              copy['fields'][key].value.push(toedit.fields[key])

        else
          copy[key] = toedit[key]

      assets[idx] = copy

    @update assets, {save: true}

  batchChange: (assets) =>
    for asset, idx in assets
      original = @find('_id' : asset._id)

      continue unless original

      copy =
        fields : original.fields
        parent : original.parent

      toedit = angular.copy asset

      for key of toedit
        if key is 'fields'
          for key of toedit.fields
            copy['fields'] or= {}
            copy['fields'][key] = toedit.fields[key]

        else
          copy[key] = toedit[key]

      delete copy.fields if _.isEmpty copy.fields

      assets[idx] = copy

    @update assets, {save: true}

  isDuplicated: (asset, assets, options={}) =>
    options.rename = false if _.isUndefined options.rename

    defer = @$q.defer()
    defer.reject(asset.name) unless asset.name

    name = _.kebabCase(asset.name)
    result = undefined

    assetsChildren = _.filter assets, (chr) =>
      return false unless chr.name
      return name is _.kebabCase(chr.name)

    if assetsChildren.length

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
            return name is _.kebabCase(chr.name)
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
            asset.order = (if assets.length then assets[0].order + @imagoSettings.index else @imagoSettings.index)

          else
            if parent.assets.length
              orderedList = @reindexAll(parent.assets)
              @update orderedList, {save: true}
              asset.order = orderedList[0].order + @imagoSettings.index

            else
              asset.order = @imagoSettings.index

            parent.sortorder = '-order'
            @update parent, {save: true}

        asset.parent = parent._id
        defer.resolve asset

    defer.promise
