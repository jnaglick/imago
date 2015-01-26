class imagoCart extends Service

  constructor: (@$q, @$window, @$http, @imagoUtils, @imagoModel, @imagoSettings) ->
    @cart =
      items: []
    local = localStorage.getItem('imagoCart')
    @checkStatus(local) if local
    @checkCurrency()

  checkCurrency: =>
    promises = []
    promises.push @$http.get("//www.telize.com/geoip", {headers: {NexClient: undefined, NexTenant: undefined}}).then (response) =>
      @telize = response.data
    promises.push @$http.get("#{@imagoSettings.host}/api/settings").then (response) =>
      res = _.find(response.data, { name: 'currencies'})
      @currencies = res.value

    @$q.all(promises).then =>
      currency = @imagoUtils.CURRENCY_MAPPING[@telize.country]
      if currency in @currencies
        @currency = currency
      else if @currencies.length
        @currency = @currencies[0]
      else
        console.log 'you need to enable at least one currency in the settings'

      @cart.currency = @currency if @currency

  checkStatus: (id) =>
    @$http.get("#{@imagoSettings.host}/api/carts?cartid=#{id}").then (response) =>
      console.log 'check status', response
      _.assign @cart, response.data

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

  add: (item) =>
    return console.log 'quantity required' unless item.qty
    unless item.serving_url
      parent = @imagoModel.find {'_id' : item.parent}
      item.serving_url = parent.serving_url if parent
    copy = angular.copy item
    filter = _.find @cart.items, { _id: copy._id }

    if filter
      filter.qty += copy.qty
    else
      @cart.items.push copy

    @checkCart().then (response) =>
      @update() if response is 'update'

  update: =>
    return unless @cart._id
    @$http.put("#{@imagoSettings.host}/api/carts/#{@cart._id}", @cart)

  remove: (item) =>
    idx = _.findIndex @cart.items, { _id: item._id }
    @cart.items.splice idx, 1
    @update()

  checkout: ->
    return unless tenant
    @$window.location.href = "https://#{tenant}.2.imagoapp.com/account/checkout/#{@cart._id}"
