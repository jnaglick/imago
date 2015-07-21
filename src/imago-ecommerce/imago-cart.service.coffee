class imagoCart extends Service

  show: false
  itemsLength: 0
  settings: []

  constructor: (@$q, @$window, @$http, @imagoUtils, @imagoModel, @imagoSettings) ->
    @cart =
      items: []

    local = @imagoUtils.cookie('imagoCart')
    @checkStatus(local) if local

  geoip: ->
    @$http.get("//api.imago.io/geoip", {headers: {NexClient: undefined, NexTenant: undefined}}).then (response) =>
      @geo = response.data
      @checkCurrency()
    , (error) =>
      @checkCurrency()

  checkCurrency: ->
    @$http.get("#{@imagoSettings.host}/api/settings").then (response) =>
      @settings = response.data
      res = _.find(response.data, {name: 'currencies'})
      @currencies = res.value
      currency = @imagoUtils.CURRENCY_MAPPING[@geo.country] if @geo
      if currency and @currencies and currency in @currencies
        @currency = currency
      else if @currencies?.length
        @currency = @currencies[0]
      else
        console.log 'you need to enable at least one currency in the settings'

      if @cart.currency isnt @currency
        @cart.currency = angular.copy @currency
        @update()
      @updateLenght()

  checkStatus: (id) =>
    @$http.get("#{@imagoSettings.host}/api/carts?cartid=#{id}").then (response) =>
      console.log 'check cart', response.data
      _.assign @cart, response.data
      for item in @cart.items
        item.finalsale = item.fields?['final-sale']?.value
      @updateLenght()
      @geoip()

  checkCart: =>
    defer = @$q.defer()
    if @cart._id
      defer.resolve('update')
    else
      @create(@cart).then (response) =>
        _.assign @cart, response.data
        @imagoUtils.cookie('imagoCart', response.data._id)
        # localStorage.setItem('imagoCart', response.data._id)
        defer.resolve('created')
    defer.promise

  create: (cart) =>
    return @$http.post("#{@imagoSettings.host}/api/carts", cart)

  add: (item, options, fields) ->
    return console.log 'item required' unless item
    return console.log 'quantity required' unless item.qty

    item.finalsale = item.fields?['final-sale']?.value

    if _.isArray(options) and options?.length
      item.options = {}
      for option in options
        item.options[option] = item.fields[option]
    else if _.isPlainObject options
      item.options = options

    if item.options?.name
      item.name = item.options.name
      delete item.options.name

    parent = @imagoModel.find {'_id' : item.parent}

    if parent
      item.name = parent.name unless item.name
      item.serving_url = parent.serving_url unless item.serving_url
      if _.isArray(fields) and fields.length
        for field in fields
          item.fields[field] = parent.fields[field]
      else if _.isPlainObject fields
        _.assign item.fields, parent.fields

    copy = angular.copy item
    filter = _.find @cart.items, { _id: copy._id }

    if filter
      filter.name = copy.name unless filter.name
      filter.qty += copy.qty
      _.assign filter.options, copy.options
      _.assign filter.fields, copy.fields
    else
      @cart.items.push copy

    @show = true
    @updateLenght()

    # console.log '@cart', @cart

    @checkCart().then (response) =>
      @update() if response is 'update'

  update: =>
    return unless @cart._id
    @$http.put("#{@imagoSettings.host}/api/carts/#{@cart._id}", @cart)

  remove: (item) =>
    idx = _.findIndex @cart.items, { _id: item._id }
    @cart.items.splice idx, 1
    @updateLenght()
    @update()

  updateLenght: ->
    @itemsLength = 0

    return @itemsLength = 0 unless @cart.items.length

    for item in @cart.items
      @itemsLength += item.qty

  checkout: ->
    return unless tenant
    @$window.location.href = "https://#{tenant}.imago.io/account/checkout/#{@cart._id}"
