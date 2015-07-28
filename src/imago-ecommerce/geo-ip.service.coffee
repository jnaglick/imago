class GeoIp extends Service

  data: {}

  constructor: (@$rootScope, @$http) ->
    @get()

  get: ->
    @$http.get('//api.imago.io/geoip').then (response) =>
      @data = response.data
      @$rootScope.$emit 'geoip:loaded', @data
    , (err) =>
      @data = null
      @$rootScope.$emit 'geoip:loaded', @data
