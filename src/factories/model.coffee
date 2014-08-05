class imagoModel extends Service

  constructor: ($q, $rootScope, $filter, imagoRest, imagoUtils) ->

    @list = {}

    @tenant = ''

    @find = (id) =>
      _.find @list.assets, '_id' : id

    @findIdx = (id) =>
      _.findIndex @list.assets, '_id' : id

    @create = (asset) =>
      return unless asset._id
      @list.assets.unshift asset

    @update = (asset) =>
      return unless asset._id

      id =
        _id: asset._id

      filter = $filter('filter')(@list.assets, id)

      return if filter.length is 0
      for result in filter
        order = @list.assets.indexOf result
        @list.assets[order] = asset

    @delete = (id) =>
      return unless id

      id =
        _id: id

      filter = $filter('filter')(@list.assets, id)
      return if filter.length is 0
      for result in filter
        order = @list.assets.indexOf result
        @list.assets.splice order, 1

    @move = (data) =>
      for asset in data.assets
        id =
          _id: asset._id

        filter = $filter('filter')(@list.assets, id)
        if filter.length > 0
          for result in filter
            order = @list.assets.indexOf result
            @list.assets.splice order, 1

    @paste = (assets, checkdups=true) =>
      for asset in assets
        if not checkdups or not @checkDuplicate(asset.name)
          @list.assets.unshift asset
        else
          i = 1
          exists = true
          original_name = asset.name
          while exists
            exists = @checkDuplicate(asset.name)
            asset.name = "#{original_name}_#{i}"
            i++

          @list.assets.unshift asset

    @reindexAll = () =>

      unless @list.sortorder is '-order'
        @list.sortorder = '-order'
        imagoRest.asset.update @list
      else
        return

      newList = []

      count = @list.assets.length

      for asset, key in @list.assets
        asset.order = (count-key) * 1000
        ordered = {
          _id: asset._id
          order: asset.order
        }
        newList.push ordered

      orderedList =
        parent : @list._id
        assets : newList

      imagoRest.asset.batch(orderedList)
        .then (result) ->
          console.log 'result batch updating', result

    @orderChanged = (start, finish, dropped) =>
      if dropped < finish
        finish = finish+1
        prev = if @list.assets[dropped-1] then @list.assets[dropped-1].order else @list.assets[0]+1000
        next = if @list.assets[finish] then @list.assets[finish].order else 0
        assets = @list.assets.slice dropped, finish

      else if dropped > start
        dropped = dropped+1
        prev = if @list.assets[start-1] then @list.assets[start-1].order else @list.assets[0]+1000
        next = if @list.assets[dropped] then @list.assets[dropped].order else 0
        assets = @list.assets.slice start, dropped

      else
        return

      console.log 'prev', prev, 'next', next

      count = prev - 1000

      for asset in assets
        asset.order = count
        count = count-1000
        # console.log 'order', asset.order, 'name', asset.name

      orderedList =
        parent: @list._id
        assets: assets

      console.log assets

      imagoRest.asset.batch(orderedList)
        .then (result) ->
          console.log 'new order saved', result


    @reorder = () =>
      list =
        order : @list.sortorder
        assets: @list.assets

      @worker.postMessage list

    @batchChange = (assets, save = false) =>
      for asset in assets
        idx = @findIdx(asset._id)
        return if idx is -1

        if _.isBoolean(asset.visible)
          @list.assets[idx]['visible'] = asset.visible

        for key of asset.meta
          @list.assets[idx]['meta'] or= {}
          @list.assets[idx]['meta'][key] or= {}
          @list.assets[idx]['meta'][key]['value'] = asset.meta[key]['value']

      if save
        object =
          parent : @list._id
          assets : assets

        imagoRest.asset.batch object


    @checkDuplicate = (name) ->
      return unless name
      nameIfDuplicate = name
      nameIfDuplicate = imagoUtils.normalize nameIfDuplicate

      normalizeList = []

      for asset in @list.assets
        normalizeList.push imagoUtils.normalize asset.name

      if $filter('filter')(normalizeList, nameIfDuplicate, true).length > 1 then return true  else return false

    @prepareCreation = (asset) =>
      return unless asset.name or not @checkDuplicate asset.name

      asset.parent = @list._id
      asset._tenant = @list._tenant
      asset.order = (if @list.assets.length is 0 then 1000 else @list.assets[0].order + 1000)

      return imagoRest.asset.create(asset)

    @workerSort = do () =>
      @worker = new Worker('/sortworker.js')
      @worker.addEventListener 'message', (e) =>
        $rootScope.$apply () =>
          @list.assets = e.data.assets

      , false

    return @
