class Calculation extends Service

  cart            : undefined
  stripe          : undefined
  currency        : undefined
  shippingmethods : undefined
  taxes           : undefined
  currencies      : undefined
  taxincluded     : undefined
  error           : {}

  constructor: (@$q, @$state, @$http, @$auth, @imagoUtils, @imagoSettings) ->
    @countries = @imagoUtils.COUNTRIES

  updateCart: =>
    @$http.put(@imagoSettings.host + '/api/carts/' + @cart._id, @cart)
    @calculate()

  deleteItem: (item) =>
    idx = _.findIndex @cart.items, {id: item.id}
    @cart.items.splice idx, 1
    @updateCart()

  changeAddress: (section, type) =>
    if @process.form['shipping_address']?.country and type is 'country'
      @setCurrency(null, @process.form['shipping_address'].country)
    else if type is 'country'
      @setCurrency(null, @process.form[section].country)
    @[section] or= {}
    if @process.form[section].country in ['United States of America', 'United States', 'USA', 'Canada', 'Australia']
      @[section].disablestates = false
      if @process.form[section].country in ['United States of America', 'United States', 'USA']
        @[section].states = @imagoUtils.STATES['USA']
      else
        @[section].states = @imagoUtils.STATES[@process.form[section].country.toUpperCase()]
    else
      @[section].disablestates = true
      @[section].states = []
    @process.form[section].country_code = @imagoUtils.CODES[@process.form[section].country]

    if @process.form['shipping_address']?.country
      @country = @process.form['shipping_address'].country
      @state   = @process.form['shipping_address'].state
      @zip     = @process.form['shipping_address'].zip
    else
      @country = @process.form[section].country
      @state   = @process.form[section].state
      @zip     = @process.form[section].zip

    @calculate()

  checkCoupon: (code) =>
    unless code
      @couponState = ''
      @calculate()
      return

    @$http.get(@imagoSettings.host + '/api/coupons?code=' + code).then (response) =>
      if response.data.length is 1
        @coupon = response.data[0]
        @couponState = 'valid'
        @calculate()

      else
        @couponState = 'invalid'

  applyCoupon: (coupon, costs) =>
    return unless coupon
    meta = coupon.meta

    if meta.type is 'flat'
      value = Math.min(costs.subtotal, meta.value[@currency])
      costs.subtotal = costs.subtotal - value
    else if meta.type is 'percent'
      percentvalue = Number((costs.subtotal * meta.value / 10000).toFixed(0))
      costs.subtotal = costs.subtotal - percentvalue
    else if meta.type is 'free shipping'
      costs.shipping = 0

  setCurrency: (currency, country) =>
    if country
      currency = if @imagoUtils.inUsa(country) then 'USD' else \
                    @imagoUtils.CURRENCY_MAPPING[country]
    @currency = if currency in @currencies then currency else @currencies[0]

  setShippingRates: (rates) =>
    if rates?.length
      if _.isPlainObject rates
        @shippingRates = [rates]
      else if _.isArray rates
        @shippingRates = rates
    else
      @shippingRates = []

    if @shippingRates.length
      @shipping_options = @shippingRates[0]

  getShippingRate: =>
    deferred = @$q.defer()
    rates = @findShippingRate()
    @setShippingRates(rates)
    deferred.resolve(rates)
    return deferred.promise

  findShippingRate: =>
    return unless @country

    if @country in ['United States of America', 'USA']
      @country = 'United States'

    # get all rates for this country
    rates_by_country = _.filter @shippingmethods, (item) =>
      item.active and @country?.toUpperCase() in (c.toUpperCase() for c in item.countries)

    if @state
      # check if there is a rate specific for this state
      rates = _.filter rates_by_country, (item) => @state.toUpperCase() in (s.toUpperCase() for s in item.states)
      return rates if rates?.length
      # console.log 'rates after first loop...', rates
      # if we didnt find any rates yet check if there is a less specific rate.
      rates = _.filter(rates_by_country, (item) => item.states.length is 0) or \
             _.filter(@shippingmethods, (item) -> !item.countries.length)
      return rates
    else
      return rates_by_country or _.filter @shippingmethods, (item) -> !item.countries.length

  changeShipping: =>
    @calcShipping(@shipping_options, @$q.defer())
    @calculateTotal()

  calculateShipping: =>
    deferred = @$q.defer()

    @costs.shipping = 0

    @getShippingRate().then (rates) =>
      unless rates?.length
        @error.noshippingrule = true if @country
        return deferred.resolve()
      @error.noshippingrule = false
      @calcShipping(rates[0], deferred)

    return deferred.promise

  calcShipping: (rate, deferred) ->
    count = 0
    with_shippingcost = []
    for item in @cart.items
      # continue unless item.shipping
      if not item.shipping_cost?[@currency]
        if rate.type is 'weight'
          count += item.weight * item.qty
        else
          count += item.qty
      else if item.shipping_cost?[@currency]
        with_shippingcost.push(item)

    if count is 0 and rate.type isnt 'weight' and not with_shippingcost.length
      # @costs.shipping = 0
      return deferred.resolve()

    range = _.find rate.ranges, (range) -> count <= range.to_unit and count >= range.from_unit
    range = rate.ranges[rate.ranges.length - 1] or 0 if not range
    # console.log 'rage is', range, 'rate', rate
    if rate.type is 'weight'
      @costs.shipping = range.price[@currency] or 0
    else
      @costs.shipping = (range.price[@currency] or 0) * count

    for item in with_shippingcost
      @costs.shipping += (item.shipping_cost?[@currency] or 0) * item.qty
    return deferred.resolve()


  calculateTax: ->
    deferred = @$q.defer()

    @getTaxRate().then =>
      @costs.tax = 0
      if @taxincluded
        deferred.resolve()
        return
      # console.log 'currency', @currency, 'includestax', @imagoUtils.includesTax(@currency)
      if @imagoUtils.includesTax(@currency)
        @costs.includedTax = 0
        if @costs.taxRate
          for item in @cart.items
            onepercent = item.fields.price.value[@currency]/(100+@costs.taxRate) * item.qty
            @costs.includedTax += Math.round(onepercent * @costs.taxRate)*100
          deferred.resolve()
        else
          deferred.resolve()
      else
        for item in @cart.items
          if item.fields.price.value[@currency]
            @costs.tax += Math.round(item.fields.price.value[@currency] * item.qty * @costs.taxRate)
        deferred.resolve()
    return deferred.promise

  getTaxRate: =>
    deferred = @$q.defer()

    @costs.taxRate = 0
    deferred.resolve() if @taxincluded
    deferred.resolve() if not @country

    tRate = @findTaxRate()
    # console.log 'tRate', tRate
    return @getZipTax() if tRate.autotax and @imagoUtils.inUsa(@country)
    @costs.taxRate = tRate.rate / 100

    deferred.resolve()
    return deferred.promise

  findTaxRate: ->
    if @country in ['United States of America', 'USA']
      @country = 'United States'

    rates_by_country = _.filter(@taxes, (item) => item.active and \
                                @country?.toUpperCase() in (c.toUpperCase() for c in item.countries))
    if @state
      rate = _.find rates_by_country, (item) =>
          @state.toUpperCase() in (s.toUpperCase() for s in item.states)
      return rate if rate
      # if we didnt find any rates yet check if there is a less specific rate.
      rates = _.filter rates_by_country, (item) -> item.states.length is 0
      return rates?[0] or {'rate': 0}
    else
      return rates_by_country?[0] or {'rate': 0}

  getZipTax: =>
    deferred = @$q.defer()
    if not (@zip or (@zip?.length > 4))
      deferred.resolve()
    else
      @$http.get("#{@imagoSettings.host}/api/ziptax?zipcode="+@zip)
        .then (response) =>
          @costs.taxRate = response.data.taxUse
          deferred.resolve()
    return deferred.promise

  calculateTotal: =>
    @costs.total = 0
    @costs.total += @costs.subtotal if @costs.subtotal
    @costs.total += @costs.shipping if @costs.shipping
    @costs.total += @costs.tax if @costs.tax and !@taxincluded
    @costs.total

  calculate: =>
    @costs =
      subtotal    : 0
      shipping    : 0
      tax         : 0
      includedTax : 0
      total       : 0

    for item in @cart.items
      if item.fields.price.value[@currency] and item.qty
        @costs.subtotal += item.qty * item.fields.price.value[@currency]
    @costs.total = @costs.subtotal

    @applyCoupon(@coupon, @costs) if @coupon

    @$q.all([@calculateTax(), @calculateShipping()]).then =>
      @calculateTotal()

  submit: =>
    return if @processing
    @processing = true
    @process.form.items    = angular.copy @cart.items
    @process.form.costs    = angular.copy @costs
    @process.form.currency = angular.copy @currency
    @process.form.billing_address.name = angular.copy @process.form.card.name
    @process.form.costs.shipping_options = angular.copy(@shipping_options)
    @process.form.costs.coupon = angular.copy(@coupon)
    @process.form.cartId = angular.copy @cart._id

    if not @differentshipping
      @process.form['shipping_address'] = angular.copy @process.form['billing_address']
    @$http.post(@imagoSettings.host + '/api/checkout', @process.form).then (response) =>
      # console.log 'response checkout', response
      @$auth.setToken(response.data.token)
      if response.data.code is 200
        for order in response.data.result
          @$state.go('order', {number: order.number})
          break

      @processing = false