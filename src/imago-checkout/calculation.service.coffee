class Checkout extends Controller

  messages:
    noshippingrule: 'sorry we don\'t ship to that country'

  constructor: ($scope, @$q, @$http, @$state, @imagoSettings, @calculation) ->

    promises = []

    promises.push @$http.get(@imagoSettings.host + '/api/carts?cartid=' + @$state.params.id).then (response) =>
      @calculation.cart = response.data
      @calculation.currency = response.data.currency
      # console.log '@cart', @calculation.cart

    promises.push @$http.get(@imagoSettings.host + '/api/shippingmethods').then (response) =>
      @calculation.shippingmethods = response.data

    promises.push @$http.get(@imagoSettings.host + '/api/taxrates').then (response) =>
      @calculation.taxes = response.data

    promises.push @$http.get(@imagoSettings.host + '/api/settings').then (response) =>
      currencies = _.find response.data, {name: 'currencies'}
      @calculation.currencies = currencies.value
      @setupStripe(response.data)

      tax = _.find response.data, name: 'taxincluded'
      @calculation.taxincluded = tax.value

    @$q.all(promises).then (response) =>
      if @calculation.cart._id
        @ready = true
        @calculation.calculate()
      else
        return 'invalid cart'

    $scope.handleStripe = (status, response) =>
      console.log 'status stripe', status
      if response.error
        console.log 'error stripe', response
        if status is 400
          @invalidForm = true
      else
        @stripe = response.card
        @stripe.token = response.id
        @calculation.process.form.card = @stripe
        @calculation.submit()

  setupStripe: (data) =>
    key = _.find data, {name: 'stripe'}
    return unless key
    Stripe.setPublishableKey(key.value)

