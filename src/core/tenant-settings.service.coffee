class TenantSettings extends Service

  data: {}
  loaded: false

  constructor: (@$http, @$rootScope, @imagoSettings) ->
    @get()

  get: ->
    @$http.get("#{@imagoSettings.host}/api/settings").then (response) =>
      @reorder response.data

  reorder: (data) ->
    @data = {}

    for item in data
      @data[item.name] = item.value

    tmp = {}
    for item in @data.settings
      tmp[_.camelCase item.name] = item.value
    @data.settings = tmp

    @$rootScope.tenantSettings = @data
    @loaded = true
    @$rootScope.$emit 'settings:loaded', @data
