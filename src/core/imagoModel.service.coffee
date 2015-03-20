class Assets extends Controller

  constructor: (@$rootScope, @$scope, @$timeout, @$state, hotkeys, @imagoModel, @imagoSettings, @facetsStorage, @selection, @ngProgressLite) ->
    @ngProgressLite.start()

    if @$state.params.path
      split = @$state.params.path.split '+'
      @trash = true if @$state.params.path.indexOf('collection:/trash') isnt -1
    else
      split = collection: ['/']

    @serverRequest(split, @$state)
    @addFacets(split)
    @startWatcher()
    @saveMarkup()

    @$scope.$on '$destroy', => @cleanUp()

    @$scope.deselectAll = (ev) =>
      return if ev.shiftKey or ev.metaKey
      @selection.selected = []

    @$scope.destroyPreview = (ev) =>
      ev.stopPropagation()
      @$scope.previewKind  = ''
      @$scope.previewAsset = false
      @$rootScope.scroll   = false

    @shortcuts =

      delete: =>
        return unless @selection.selected and _.isArray @selection.selected

        if @trash
          @numberTrash = angular.copy @selection.selected.length
          @promptTrash = true
        else
          @imagoModel.updateCount(@collection, -@selection.selected.length)
          @imagoModel.trash(@selection.selected)

        @refreshInView()

      copy: =>
        @selection.copy(@collection._id)

      cut: =>
        @selection.move(@collection._id)

      paste: =>
        @selection.paste(@collection)

      selectAll: =>
        @selection.addAll(@assets)

      moveUp: =>
        return if not @selection.selected.length or angular.equals(@selection.selected[0], @assets[0]) or @selection.selected.length is @assets.length

        order = @assets[0].order + @imagoSettings.index

        if @selection.selected.length > 1
          @selection.selected = _.sortBy @selection.selected, 'order'

        copy = angular.copy @selection.selected

        for asset, key in copy
          idx = _.findIndex @assets, {'_id': asset._id}
          asset.order = order
          @assets.splice idx, 1
          @assets.unshift asset
          order = order + ((key+1)*@imagoSettings.index)

        if @collection.sortorder is '-order'
          @imagoModel.update copy, {save: true, stream: false}
          @refreshInView()
        else
          @imagoModel.reSort(@collection)

      moveDown: =>
        return if not @selection.selected.length or @selection.selected.length is @assets.length
        if @selection.selected.length > 1
          @selection.selected = _.sortBy @selection.selected, 'order'

        copy = angular.copy @selection.selected
        copy = copy.reverse()

        minusOrder = @assets[@assets.length-1].order / (@selection.selected.length+1)
        order = @assets[@assets.length-1].order - minusOrder
        order = parseInt order

        for asset, key in copy
          idx = _.findIndex @assets, {'_id': asset._id}
          asset.order = order
          @assets.splice idx, 1
          @assets.push asset
          order = parseInt(order - minusOrder)

        if @collection.sortorder is '-order'
          @imagoModel.update copy, {save: true, stream: false}
          @refreshInView()
        else
          @imagoModel.reSort(@collection)

      create: =>
        @showFormAsset = true if not @trash and @collectionBase

      escape: =>
        @showFormAsset = false
        @$scope.previewAsset = null
        @$rootScope.scroll = false

      download: =>
        ids = []
        for asset in @selection.selected
          ids.push asset._id

        @toDownload =
          assets : ids

        @promptResolution = true

      preview: (ev) =>
        ev.preventDefault() if ev
        unless @$scope.previewAsset
          @$scope.previewAsset = []

          if @selection.selected.length is 1 and @selection.selected[0].serving_url
            for asset in @assets
              @$scope.previewAsset.push(asset) if asset.serving_url

            idx = _.findIndex @$scope.previewAsset, {'_id': @selection.selected[0]._id}
            @$timeout => @$rootScope.$emit('slider:change', idx)

          else if @selection.selected.length > 1
            for data in @selection.selected
              @$scope.previewAsset.push(data) if data.serving_url
            @$timeout => @$rootScope.$emit('slider:change', 0)

          unless @$scope.previewAsset.length
            @$scope.previewAsset = null
          else
            @$rootScope.scroll = true

        else
          @$scope.previewAsset = null
          @$rootScope.scroll = false

    hotkeys.bindTo(@$scope)
      .add
        combo: 'mod+backspace',
        callback: =>
          @shortcuts.delete()

      .add
        combo: 'mod+c',
        callback: =>
          @shortcuts.copy()

      .add
        combo: 'mod+x',
        callback: =>
          @shortcuts.cut()

      .add
        combo: 'mod+v',
        callback: =>
          @shortcuts.paste()

      .add
        combo: 'mod+a',
        callback: (ev) =>
          ev.preventDefault()
          @shortcuts.selectAll()

      .add
        combo: 'option+mod+v',
        callback: =>
          @selection.action = 'move'
          @shortcuts.paste()

      .add
        combo: 'option+mod+up',
        callback: =>
          @shortcuts.moveUp()

      .add
        combo: 'option+mod+down',
        callback: =>
          @shortcuts.moveDown()

      .add
        combo: 'n',
        callback: =>
          @shortcuts.create()

      .add
        combo: 'esc',
        callback: =>
          @shortcuts.escape()

      .add
        combo: 'space',
        callback: (ev) =>
          @shortcuts.preview(ev)


  serverRequest: (split, state) =>
    if state.params.path
      @search = {}

      for element in split
        splitElement = element.split(':')

        @search[splitElement[0]] or= []
        @search[splitElement[0]].push splitElement[1]

    else
      @search = split

    @imagoModel.getData(@search).then (response) =>

      for search in response
        @collection = angular.copy search
        @imagoModel.currentCollection = @collection

        @assets = angular.copy search.assets
        @imagoModel.currentCollection.assets = @assets
        @collection.assets = @assets

        if search._id
          @collectionBase = true
          @$scope.footer.changeSort search.sortorder, {save: false, worker: false}
        else if search.assets.length
          @$scope.noOpacity = true
          @collectionBase = false
          @$scope.footer.changeSort null, {save: false, worker: false}
        else
          @collectionBase = false

        @checkCount()
        @ngProgressLite.done()

        break

  addFacets: (split) ->
    if @facetsStorage.items.length
      @facetsStorage.items = []

    for result in split
      division = result.split(':')
      @facetsStorage.add(key: division[0])
      @facetsStorage.add(value: division[1])

  downloadAssets: ->
    @promptResolution = false
    @imagoModel.assets.download(@toDownload.assets, @toDownload.resolution)

  cancelTrash: ->
    @promptTrash = false

  confirmTrash: ->
    @imagoModel.delete @selection.selected, {save: true}
    @promptTrash = false
    @refreshInView()

  startWatcher: =>
    @watcher = {}

    @watcher.reorder = @$rootScope.$on 'sort:changed', (ev, changes) =>
      @imagoModel.currentCollection.assets = changes
      @assets = changes

      @refreshInView()

    @watcher.add = @$rootScope.$on 'assets:add', (ev, changes) =>
      for asset in changes
        if @collection?._id is asset.parent
          @refreshAssets()
          break

    @watcher.update = @$rootScope.$on 'assets:update', (ev, changes) =>
      @checkAssetsInView(changes)

    @watcher.delete = @$rootScope.$on 'assets:delete', (ev, changes) =>
      for asset in changes
        idx = _.findIndex @assets, {'_id' : asset._id}

        if idx isnt -1
          @assets.splice(idx, 1)

      @checkCount()

    @$scope.$on 'fullscreen', (ev, changes) =>
      @fullscreen = changes.fullscreen
      # @$rootScope.scroll   = changes.fullscreen
      @$rootScope.navigation  = changes.fullscreen

      @$scope.sourceMarkup = changes.source if changes.source
      @$scope.valueMarkup  = changes.input if changes.input

      @oldSourceField = @sourceField
      @oldSyntaxField = @syntaxField

      @sourceField = changes.source._id
      @syntaxField = changes.source.fields[changes.input.name].syntax

      if @sourceField is @oldSourceField and @syntaxField isnt @oldSyntaxField
        result =
          '_id'     : @sourceField
          'syntax'  : @syntaxField

        @$scope.$broadcast 'syntaxChange', result

  cleanUp: =>
    for key of @watcher
      @watcher[key]()

  reorder: (options) =>
    # return console.log 'options', options.store.store

    selected = angular.copy @selection.selected

    selected = _.sortBy selected, 'order'
    selected.reverse() if options.dropIndex > options.initialIndex

    # TODO: Find a better way to avoid looping twice

    for asset in selected
      idx = _.findIndex options.collection, {'_id': asset._id}
      obj = options.collection.splice(idx, 1)[0]
      options.collection.splice(options.dropIndex, 0, obj)

    if @collection.sortorder is '-order'
      reverse = options.initialIndex < options.dropIndex
      orderedList = @imagoModel.reorder(options.dropIndex, options.store.store.reorder.collection, selected, {reverse: reverse})

      if orderedList.repair
        @imagoModel.assets.repair(@collection._id)
      else
        order = orderedList.order
        minusOrder = orderedList.minus

        for asset in selected
          asset.order = order
          idx = _.findIndex options.collection, {'_id': asset._id}
          options.collection[idx].order = asset.order
          order = order + minusOrder

        @imagoModel.update selected, {stream: false, save: true}

    else
      @imagoModel.reSort(@collection)

  saveMarkup: =>
    return unless @$scope.sourceMarkup
    @imagoModel.update @$scope.sourceMarkup, {stream: false, save: true}

  checkAssetsInView: (changes) =>
    update = {}

    # console.log 'changes', changes, @collection

    if _.isArray changes

      for asset, key in changes
        if @collection?._id is asset._id
          if asset.sortorder and not angular.equals(asset.sortorder, @collection.sortorder)
            @$scope.footer.changeSort asset.sortorder, {save: false}
          else if not asset.kind
            @$state.go('home')

        else if @collection?._id is asset.parent
          idx = _.findIndex(@assets, {'_id' : asset._id})

          if (not asset.order and idx isnt -1) or (asset.order and angular.equals(@assets[idx]?.order, asset.order))
            _.assign @assets[idx], asset
            update.quick = true
          else
            update.status = true
            break

        else if not @collection?._id and _.find @assets, {'_id' : asset._id}
          idx = _.findIndex(@assets, {'_id' : asset._id})
          _.assign @assets[idx], asset
          update.quick = true

        else if _.findIndex(@assets, {'_id' : asset._id}) >= 0 and @collection._id and asset.parent isnt @collection._id
          idx = _.findIndex(@assets, {'_id' : asset._id})
          @assets.splice idx, 1
          update.quick = true

    else if _.isPlainObject changes

      if @collection and changes.parent is @collection._id
        idx = _.findIndex(@assets, {'_id' : changes._id})
        _.assign @assets[idx], changes
        update.quick = true
      else if @collection and changes._id is @collection._id
        update.status = true
        @$scope.footer.changeSort changes.sortorder, {save: false, worker: false}

    if update.status
      @refreshAssets()
    else if update.quick
      @checkCount()

  refreshAssets: =>
    console.log 'refreshing children of current collection'
    @imagoModel.getData(@search).then (response) =>

      for search in response
        @collection = angular.copy(search)
        @imagoModel.currentCollection = @collection
        @assets = angular.copy(search.assets)
        @imagoModel.currentCollection.assets = @assets
        @collection.assets = @assets
        break

      @checkCount()
      @refreshInView()

  refreshInView: ->
    if document.createEvent
      event = new Event('checkInView')
      window.dispatchEvent(event)
    else
      #IE
      event = document.createEventObject()
      event.eventType = 'checkInView'
      event.eventName = 'checkInView'
      window.fireEvent('on' + event.eventType, event)

  checkCount: =>
    if @assets?.length
      @$scope.noresult = false
    else
      @$scope.noresult = true
