class FulfillmentsCenter extends Service

  data: []

  selected: {}

  constructor: (@$http, @$rootScope, @geoIp, @imagoSettings, @imagoUtils) ->
    @get()

  get: ->
    @$http.get(@imagoSettings.host + '/api/fulfillmentcenters').then (response) =>
      @data = response.data
      @getOptions()

  getOptions: ->
    if @data.length is 1
      @selected = @data[0]
      return @$rootScope.$emit 'fulfillments:loaded', @data

    if @geoIp.data.country
      @geoValid()
    else if @geoIp.data is null
      @getGeneric()
    else if _.isEmpty(@geoIp.data)
      watcher = @$rootScope.$on 'geoip:loaded', (evt, data) =>
        watcher()
        if @geoIp.data.country
          @geoValid()
        else
          @getGeneric()

  getGeneric: ->
    @selected = _.find @data, (ffc) -> !ffc.countries.length
    @$rootScope.$emit('fulfillments:loaded', @data)

  geoValid: ->
    @selected = _.find @data, (ffc) => @geoIp.data.country in ffc.countries
    if @selected
      return @$rootScope.$emit('fulfillments:loaded', @data)
    else
      @getGeneric()
