class GeoIp extends Service

  data: {}

  constructor: (@$rootScope, @$http, @imagoUtils) ->
    @get()

  get: ->
    if @imagoUtils.cookie('countryGeo')
      @data.country = @imagoUtils.cookie('countryGeo')
      @$rootScope.$emit 'geoip:loaded', @data
      return
    @$http.get('//api.imago.io/geoip').then (response) =>
      @data = response.data
      @imagoUtils.cookie 'countryGeo', @data.country
      @$rootScope.$emit 'geoip:loaded', @data
    , (err) =>
      @data = null
      @$rootScope.$emit 'geoip:loaded', @data
