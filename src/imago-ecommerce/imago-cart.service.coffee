class imagoCart extends Service

  show: false

  constructor: (@$q, @$window, @$http, @imagoUtils, @imagoModel, @imagoSettings) ->
    @cart =
      items: []
    local = localStorage.getItem('imagoCart')

    promises = []
    promises.push(@checkStatus(local)) if local
    promises.push(@telize())

    @$q.all(promises).then =>
      @checkCurrency()
    , (reject) =>
      @checkCurrency()

  telize: ->
    return @$http.get("//www.telize.com/geoip", {headers: {NexClient: undefined, NexTenant: undefined}}).then (response) =>
      @telize = response.datah

  checkCurrency: ->
    @$http.get("#{@imagoSettings.host}/api/settings").then (response) =>
      res = _.find(response.data, {name: 'currencies'})
      @currencies = res.value
      currency = @imagoUtils.CURRENCY_MAPPING[@telize.country] if @telize
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
    defer = @$q.defer()
    @$http.get("#{@imagoSettings.host}/api/carts?cartid=#{id}").then (response) =>
      console.log 'check cart', response.data
      _.assign @cart, response.data
      defer.resolve()
    defer.promise

  checkCart: =>
    defer = @$q.defer()
    if @cart._id
      defer.resolve('update')
    else
      @create(@cart).then (response) =>
        _.assign @cart, response.data
        localStorage.setItem('imagoCart', response.data._id)
        defer.resolve('created')
    defer.promise

  create: (cart) =>
    return @$http.post("#{@imagoSettings.host}/api/carts", cart)

  add: (item, options) ->
    return console.log 'item required' unless item
    return console.log 'quantity required' unless item.qty

    if _.isArray(options) and options?.length
      item.options = {}
      for option in options
        item.options[option] = item.fields[option]
    else if _.isPlainObject options
      item.options = options

    parent = @imagoModel.find {'_id' : item.parent}
    if item.options.name
      item.name = item.options.name
      delete item.options.name
    if parent
      item.name = parent.name unless item.name
      item.serving_url = parent.serving_url unless item.serving_url
    copy = angular.copy item
    filter = _.find @cart.items, { _id: copy._id }

    if filter
      filter.name = copy.name unless filter.name
      filter.qty += copy.qty
    else
      @cart.items.push copy

    @show = true
    @updateLenght()

    @checkCart().then (response) =>
      @update() if response is 'update'

  update: =>
    return unless @cart._id
    @$http.put("#{@imagoSettings.host}/api/carts/#{@cart._id}", @cart)

  remove: (item) =>
    console.log 'removed', item
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
