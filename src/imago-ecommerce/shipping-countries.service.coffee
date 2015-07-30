class ShippingCountries extends Service

  data: []
  loaded: false

  constructor: (@$http, @imagoSettings) ->
    @get()

  get: ->
    @$http.get(@imagoSettings.host + '/api/shippingmethods').then (response) =>

      for method in response.data
        for country in method.countries
          @data.push country

      @data = _.compact _.uniq @data
      @loaded = true
