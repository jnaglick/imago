var Checkout,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Checkout = (function() {
  Checkout.prototype.messages = {
    noshippingrule: 'sorry we don\'t ship to that country'
  };

  function Checkout($scope, $q, $http, $state, imagoSettings, calculation) {
    var promises;
    this.$q = $q;
    this.$http = $http;
    this.$state = $state;
    this.imagoSettings = imagoSettings;
    this.calculation = calculation;
    this.setupStripe = __bind(this.setupStripe, this);
    promises = [];
    promises.push(this.$http.get(this.imagoSettings.host + '/api/carts?cartid=' + this.$state.params.id).then((function(_this) {
      return function(response) {
        _this.calculation.cart = response.data;
        return _this.calculation.currency = response.data.currency;
      };
    })(this)));
    promises.push(this.$http.get(this.imagoSettings.host + '/api/shippingmethods').then((function(_this) {
      return function(response) {
        return _this.calculation.shippingmethods = response.data;
      };
    })(this)));
    promises.push(this.$http.get(this.imagoSettings.host + '/api/taxrates').then((function(_this) {
      return function(response) {
        return _this.calculation.taxes = response.data;
      };
    })(this)));
    promises.push(this.$http.get(this.imagoSettings.host + '/api/settings').then((function(_this) {
      return function(response) {
        var currencies, tax;
        currencies = _.find(response.data, {
          name: 'currencies'
        });
        _this.calculation.currencies = currencies.value;
        _this.setupStripe(response.data);
        tax = _.find(response.data, {
          name: 'taxincluded'
        });
        return _this.calculation.taxincluded = tax.value;
      };
    })(this)));
    this.$q.all(promises).then((function(_this) {
      return function(response) {
        if (_this.calculation.cart._id) {
          _this.ready = true;
          return _this.calculation.calculate();
        } else {
          return 'invalid cart';
        }
      };
    })(this));
    $scope.handleStripe = (function(_this) {
      return function(status, response) {
        console.log('status stripe', status);
        if (response.error) {
          console.log('error stripe', response);
          if (status === 400) {
            return _this.invalidForm = true;
          }
        } else {
          _this.stripe = response.card;
          _this.stripe.token = response.id;
          _this.calculation.process.form.card = _this.stripe;
          return _this.calculation.submit();
        }
      };
    })(this);
  }

  Checkout.prototype.setupStripe = function(data) {
    var key;
    key = _.find(data, {
      name: 'stripe'
    });
    if (!key) {
      return;
    }
    return Stripe.setPublishableKey(key.value);
  };

  return Checkout;

})();

angular.module('imago').controller('checkout', ['$scope', '$q', '$http', '$state', 'imagoSettings', 'calculation', Checkout]);

var Costs;

Costs = (function() {
  function Costs() {
    return {
      scope: {
        costs: '=',
        currency: '='
      },
      controllerAs: 'costs',
      templateUrl: '/imago/costs.html'
    };
  }

  return Costs;

})();

angular.module('imago').directive('costs', [Costs]);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/costs.html","<table><tbody><tr><td>subtotal</td><td><span ng-bind-html=\"currency | currencySymbol\" class=\"currency\"></span>{{ costs.subtotal | price }}</td></tr><tr><td>shipping</td><td><span ng-bind-html=\"currency | currencySymbol\" class=\"currency\"></span>{{ costs.shipping | price }}</td></tr><tr ng-show=\"costs.includedTax\"><td>included tax</td><td><span ng-bind-html=\"currency | currencySymbol\" class=\"currency\"></span>{{ costs.includedTax | price }}</td></tr><tr ng-show=\"!costs.includedTax\"><td>tax</td><td><span ng-bind-html=\"currency | currencySymbol\" class=\"currency\"></span>{{ costs.tax | price }}</td></tr><tr class=\"total\"><td>total</td><td><span ng-bind-html=\"currency | currencySymbol\" class=\"currency\"></span>{{ costs.total | price }}</td></tr></tbody></table>");}]);