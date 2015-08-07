class GeoIp extends Service

  data: {}
  loaded: false

  constructor: (@$rootScope, @$http, @imagoUtils) ->
    @get()

  get: ->
    if @imagoUtils.cookie('countryGeo')
      @data.country = @imagoUtils.getCountryByCode(@imagoUtils.cookie('countryGeo'))
      @$rootScope.$emit 'geoip:loaded', @data
      @loaded = true
      return
    @$http.get('//api.imago.io/geoip').then (response) =>
      code = @imagoUtils.getCountryByCode(response.data.country_code)
      @imagoUtils.cookie 'countryGeo', response.data.country_code
      @data.country = code
      @$rootScope.$emit 'geoip:loaded', @data
      @loaded = true
    , (err) =>
      @data = null
      @$rootScope.$emit 'geoip:loaded', @data
      @loaded = true
