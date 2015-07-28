class FulfillmentsCenter extends Service

  data: []

  selected: {}

  constructor: (@$http, @$rootScope, @geoIp, @imagoSettings) ->
    @get()

  get: ->
    @$http.get(@imagoSettings.host + '/api/fulfillmentcenters').then (response) =>
      @data = response.data
      @getOptions()

  getOptions: ->
    if @data.length is 1
      @selected = @data[0]
      return @$rootScope.$emit 'fulfillments:loaded', @data

    if @geoIp.data is null
      # @checkCurrency()
    else if _.isEmpty(@geoIp.data)
      watcher = @$rootScope.$on 'geoip:loaded', (evt, data) =>
        @geoAvailable()
        watcher()
    else
      @geoAvailable()

  geoAvailable: ->
    @selected = _.find @data, (ffc) => @geoIp.data.country in ffc.countries
    if @selected
      return @$rootScope.$emit('fulfillments:loaded', @data)
    else
      @selected = _.find @data, (ffc) -> !ffc.countries.length
      return @$rootScope.$emit('fulfillments:loaded', @data) if @selected

    console.log '@geoIp.data', @geoIp.data
    console.log '@selected', @selected, @data




