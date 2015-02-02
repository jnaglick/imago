var Calculation,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Calculation = (function() {
  Calculation.prototype.cart = void 0;

  Calculation.prototype.stripe = void 0;

  Calculation.prototype.currency = void 0;

  Calculation.prototype.shippingmethods = void 0;

  Calculation.prototype.taxes = void 0;

  Calculation.prototype.currencies = void 0;

  Calculation.prototype.taxincluded = void 0;

  function Calculation($q, $state, $http, $auth, imagoUtils, imagoSettings, orderStorage) {
    this.$q = $q;
    this.$state = $state;
    this.$http = $http;
    this.$auth = $auth;
    this.imagoUtils = imagoUtils;
    this.imagoSettings = imagoSettings;
    this.orderStorage = orderStorage;
    this.submit = __bind(this.submit, this);
    this.calculate = __bind(this.calculate, this);
    this.calculateTotal = __bind(this.calculateTotal, this);
    this.getZipTax = __bind(this.getZipTax, this);
    this.getTaxRate = __bind(this.getTaxRate, this);
    this.calculateShipping = __bind(this.calculateShipping, this);
    this.changeShipping = __bind(this.changeShipping, this);
    this.findShippingRate = __bind(this.findShippingRate, this);
    this.getShippingRate = __bind(this.getShippingRate, this);
    this.setShippingRates = __bind(this.setShippingRates, this);
    this.setCurrency = __bind(this.setCurrency, this);
    this.applyCoupon = __bind(this.applyCoupon, this);
    this.checkCoupon = __bind(this.checkCoupon, this);
    this.changeAddress = __bind(this.changeAddress, this);
    this.deleteItem = __bind(this.deleteItem, this);
    this.updateCart = __bind(this.updateCart, this);
    this.countries = imagoUtils.COUNTRIES;
  }

  Calculation.prototype.updateCart = function() {
    this.$http.put(this.imagoSettings.host + '/api/carts/' + this.cart._id, this.cart);
    return this.calculate();
  };

  Calculation.prototype.deleteItem = function(item) {
    var idx;
    idx = _.findIndex(this.cart.items, {
      id: item.id
    });
    this.cart.items.splice(idx, 1);
    return this.updateCart();
  };

  Calculation.prototype.changeAddress = function(section, type) {
    var _ref, _ref1, _ref2, _ref3;
    if (((_ref = this.process.form['shipping_address']) != null ? _ref.country : void 0) && type === 'country') {
      this.setCurrency(null, this.process.form['shipping_address'].country);
    } else if (type === 'country') {
      this.setCurrency(null, this.process.form[section].country);
    }
    this[section] || (this[section] = {});
    if ((_ref1 = this.process.form[section].country) === 'United States of America' || _ref1 === 'United States' || _ref1 === 'USA' || _ref1 === 'Canada' || _ref1 === 'Australia') {
      this[section].disablestates = false;
      if ((_ref2 = this.process.form[section].country) === 'United States of America' || _ref2 === 'United States') {
        this[section].states = this.imagoUtils.STATES['USA'];
      } else {
        this[section].states = this.imagoUtils.STATES[this.process.form[section].country.toUpperCase()];
      }
    } else {
      this[section].disablestates = true;
      this[section].states = [];
    }
    this.process.form[section].country_code = this.imagoUtils.CODES[this.process.form[section].country];
    if ((_ref3 = this.process.form['shipping_address']) != null ? _ref3.country : void 0) {
      this.country = this.process.form['shipping_address'].country;
      this.state = this.process.form['shipping_address'].state;
      this.zip = this.process.form['shipping_address'].zip;
    } else {
      this.country = this.process.form[section].country;
      this.state = this.process.form[section].state;
      this.zip = this.process.form[section].zip;
    }
    return this.calculate();
  };

  Calculation.prototype.checkCoupon = function(code) {
    if (!code) {
      this.couponState = '';
      this.calculate();
      return;
    }
    return this.$http.get(this.imagoSettings.host + '/api/coupons?code=' + code).then((function(_this) {
      return function(response) {
        if (response.data.length === 1) {
          _this.coupon = response.data[0];
          _this.couponState = 'valid';
          return _this.calculate();
        } else {
          return _this.couponState = 'invalid';
        }
      };
    })(this));
  };

  Calculation.prototype.applyCoupon = function() {
    var meta, percentvalue, value;
    if (!this.coupon) {
      return;
    }
    meta = this.coupon.meta;
    if (meta.type === 'flat') {
      value = Math.min(this.costs.subtotal, meta.value[this.currency]);
      return this.costs.subtotal = this.costs.subtotal - value;
    } else if (meta.type === 'percent') {
      percentvalue = Number((this.costs.subtotal * meta.value / 10000).toFixed(0));
      return this.costs.subtotal = this.costs.subtotal - percentvalue;
    } else if (meta.type === 'free shipping') {
      return this.costs.shipping = 0;
    }
  };

  Calculation.prototype.setCurrency = function(currency, country) {
    if (country) {
      currency = this.imagoUtils.inUsa(country) ? 'USD' : this.imagoUtils.CURRENCY_MAPPING[country];
    }
    return this.currency = __indexOf.call(this.currencies, currency) >= 0 ? currency : this.currencies[0];
  };

  Calculation.prototype.setShippingRates = function(rates) {
    if (rates != null ? rates.length : void 0) {
      if (_.isPlainObject(rates)) {
        this.shippingRates = [rates];
      } else if (_.isArray(rates)) {
        this.shippingRates = rates;
      }
    } else {
      this.shippingRates = [];
    }
    if (this.shippingRates.length) {
      return this.shipping_options = this.shippingRates[0];
    }
  };

  Calculation.prototype.getShippingRate = function() {
    var deferred, rates;
    deferred = this.$q.defer();
    rates = this.findShippingRate();
    this.setShippingRates(rates);
    deferred.resolve(rates);
    return deferred.promise;
  };

  Calculation.prototype.findShippingRate = function() {
    var rates, rates_by_country, _ref;
    if (!this.country) {
      return;
    }
    if ((_ref = this.country) === 'United States of America' || _ref === 'United States') {
      this.country = 'USA';
    }
    rates_by_country = _.filter(this.shippingmethods, (function(_this) {
      return function(item) {
        var c, _ref1, _ref2;
        return item.active && (_ref1 = (_ref2 = _this.country) != null ? _ref2.toUpperCase() : void 0, __indexOf.call((function() {
          var _i, _len, _ref3, _results;
          _ref3 = item.countries;
          _results = [];
          for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
            c = _ref3[_i];
            _results.push(c.toUpperCase());
          }
          return _results;
        })(), _ref1) >= 0);
      };
    })(this));
    if (this.state) {
      rates = _.filter(rates_by_country, (function(_this) {
        return function(item) {
          var s, _ref1;
          return _ref1 = _this.state.toUpperCase(), __indexOf.call((function() {
            var _i, _len, _ref2, _results;
            _ref2 = item.states;
            _results = [];
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
              s = _ref2[_i];
              _results.push(s.toUpperCase());
            }
            return _results;
          })(), _ref1) >= 0;
        };
      })(this));
      if (rates != null ? rates.length : void 0) {
        return rates;
      }
      rates = _.filter(rates_by_country, (function(_this) {
        return function(item) {
          return item.states.length === 0;
        };
      })(this)) || _.filter(this.shippingmethods, function(item) {
        return !item.countries.length;
      });
      return rates;
    } else {
      return rates_by_country || _.filter(this.shippingmethods, function(item) {
        return !item.countries.length;
      });
    }
  };

  Calculation.prototype.changeShipping = function() {
    this.calcShipping(this.shipping_options, this.$q.defer());
    return this.calculateTotal();
  };

  Calculation.prototype.calculateShipping = function() {
    var deferred;
    deferred = this.$q.defer();
    this.costs.shipping = 0;
    return this.getShippingRate().then((function(_this) {
      return function(rates) {
        if (!(rates != null ? rates.length : void 0)) {
          return deferred.resolve();
        }
        _this.calcShipping(rates[0], deferred);
        return deferred.promise;
      };
    })(this));
  };

  Calculation.prototype.calcShipping = function(rate, deferred) {
    var count, item, range, with_shippingcost, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3;
    count = 0;
    with_shippingcost = [];
    _ref = this.cart.items;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      if (!((_ref1 = item.shipping_cost) != null ? _ref1[this.currency] : void 0)) {
        if (rate.type === 'weight') {
          count += item.weight * item.qty;
        } else {
          count += item.qty;
        }
      } else if ((_ref2 = item.shipping_cost) != null ? _ref2[this.currency] : void 0) {
        with_shippingcost.push(item);
      }
    }
    if (count === 0 && rate.type !== 'weight' && !with_shippingcost.length) {
      return deferred.resolve();
    }
    range = _.find(rate.ranges, function(range) {
      return count <= range.to_unit && count >= range.from_unit;
    });
    if (!range) {
      range = rate.ranges[rate.ranges.length - 1] || 0;
    }
    if (rate.type === 'weight') {
      this.costs.shipping = range.price[this.currency] || 0;
    } else {
      this.costs.shipping = (range.price[this.currency] || 0) * count;
    }
    for (_j = 0, _len1 = with_shippingcost.length; _j < _len1; _j++) {
      item = with_shippingcost[_j];
      this.costs.shipping += (((_ref3 = item.shipping_cost) != null ? _ref3[this.currency] : void 0) || 0) * item.qty;
    }
    return deferred.resolve();
  };

  Calculation.prototype.calculateTax = function() {
    var deferred;
    deferred = this.$q.defer();
    this.getTaxRate().then((function(_this) {
      return function() {
        var item, onepercent, _i, _j, _len, _len1, _ref, _ref1, _results;
        _this.costs.tax = 0;
        if (_this.taxincluded) {
          deferred.resolve();
          return;
        }
        if (_this.imagoUtils.includesTax(_this.currency)) {
          _this.costs.includedTax = 0;
          if (_this.costs.taxRate) {
            _ref = _this.cart.items;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              item = _ref[_i];
              onepercent = item.fields.price.value[_this.currency] / (100 + _this.costs.taxRate) * item.qty;
              _this.costs.includedTax += Math.round(onepercent * _this.costs.taxRate);
              _results.push(deferred.resolve());
            }
            return _results;
          } else {
            return deferred.resolve();
          }
        } else {
          _ref1 = _this.cart.items;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            item = _ref1[_j];
            _this.costs.tax += Math.round(item.fields.price.value[_this.currency] * item.qty * _this.costs.taxRate);
          }
          return deferred.resolve();
        }
      };
    })(this));
    return deferred.promise;
  };

  Calculation.prototype.getTaxRate = function() {
    var deferred, tRate;
    deferred = this.$q.defer();
    this.costs.taxRate = 0;
    if (this.taxincluded) {
      deferred.resolve();
    }
    if (!this.country) {
      deferred.resolve();
    }
    tRate = this.findTaxRate();
    if (tRate.autotax && this.imagoUtils.inUsa(this.country)) {
      return this.getZipTax();
    }
    this.costs.taxRate = tRate.rate / 100;
    deferred.resolve();
    return deferred.promise;
  };

  Calculation.prototype.findTaxRate = function() {
    var rate, rates, rates_by_country, _ref;
    if ((_ref = this.country) === 'United States of America' || _ref === 'United States') {
      this.country = 'USA';
    }
    rates_by_country = _.filter(this.taxes, (function(_this) {
      return function(item) {
        var c, _ref1, _ref2;
        return item.active && (_ref1 = (_ref2 = _this.country) != null ? _ref2.toUpperCase() : void 0, __indexOf.call((function() {
          var _i, _len, _ref3, _results;
          _ref3 = item.countries;
          _results = [];
          for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
            c = _ref3[_i];
            _results.push(c.toUpperCase());
          }
          return _results;
        })(), _ref1) >= 0);
      };
    })(this));
    if (this.state) {
      rate = _.find(rates_by_country, (function(_this) {
        return function(item) {
          var s, _ref1;
          return _ref1 = _this.state.toUpperCase(), __indexOf.call((function() {
            var _i, _len, _ref2, _results;
            _ref2 = item.states;
            _results = [];
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
              s = _ref2[_i];
              _results.push(s.toUpperCase());
            }
            return _results;
          })(), _ref1) >= 0;
        };
      })(this));
      if (rate) {
        return rate;
      }
      rates = _.filter(rates_by_country, function(item) {
        return item.states.length === 0;
      });
      return (rates != null ? rates[0] : void 0) || {
        'rate': 0
      };
    } else {
      return (rates_by_country != null ? rates_by_country[0] : void 0) || {
        'rate': 0
      };
    }
  };

  Calculation.prototype.getZipTax = function() {
    var deferred, _ref;
    deferred = this.$q.defer();
    if (!(this.zip || (((_ref = this.zip) != null ? _ref.length : void 0) > 4))) {
      deferred.resolve();
    } else {
      this.$http.get(("" + this.imagoSettings.host + "/api/ziptax?zipcode=") + this.zip).then((function(_this) {
        return function(response) {
          _this.costs.taxRate = response.data.taxUse;
          return deferred.resolve();
        };
      })(this));
    }
    return deferred.promise;
  };

  Calculation.prototype.calculateTotal = function() {
    this.costs.total = 0;
    if (this.costs.subtotal) {
      this.costs.total += this.costs.subtotal;
    }
    if (this.costs.shipping) {
      this.costs.total += this.costs.shipping;
    }
    if (this.costs.tax && !this.taxincluded) {
      this.costs.total += this.costs.tax;
    }
    return this.costs.total;
  };

  Calculation.prototype.calculate = function() {
    var item, _i, _len, _ref;
    this.costs = {
      subtotal: 0,
      shipping: 0,
      tax: 0,
      includedTax: 0,
      total: 0
    };
    _ref = this.cart.items;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      this.costs.subtotal += item.qty * item.fields.price.value[this.currency];
    }
    this.costs.total = this.costs.subtotal;
    this.applyCoupon();
    return this.$q.all([this.calculateTax(), this.calculateShipping()]).then((function(_this) {
      return function() {
        return _this.calculateTotal();
      };
    })(this));
  };

  Calculation.prototype.submit = function() {
    if (this.processing) {
      return;
    }
    this.processing = true;
    this.process.form.items = angular.copy(this.cart.items);
    this.process.form.costs = angular.copy(this.costs);
    this.process.form.currency = angular.copy(this.currency);
    this.process.form.billing_address.name = angular.copy(this.process.form.card.name);
    if (!this.differentshipping) {
      this.process.form['shipping_address'] = angular.copy(this.process.form['billing_address']);
    }
    return this.$http.post(this.imagoSettings.host + '/api/checkout', this.process.form).then((function(_this) {
      return function(response) {
        var order, _i, _len, _ref;
        console.log('response checkout', response);
        _this.$auth.setToken(response.data.token);
        if (response.data.code === 200) {
          _ref = response.data.message;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            order = _ref[_i];
            console.log('order', order);
            _this.$state.go('order', {
              number: order.number
            });
            break;
          }
        }
        return _this.processing = false;
      };
    })(this));
  };

  return Calculation;

})();

angular.module('imago').service('calculation', ['$q', '$state', '$http', '$auth', 'imagoUtils', 'imagoSettings', 'orderStorage', Calculation]);

var imagoCart;

imagoCart = (function() {
  function imagoCart(imagoCart) {
    return {
      replace: true,
      scope: {
        min: '=',
        max: '=',
        ngModel: '='
      },
      transclude: true,
      controllerAs: 'cart',
      templateUrl: '/imago/imago-cart.html',
      controller: function($scope) {
        return this.utils = imagoCart;
      }
    };
  }

  return imagoCart;

})();

angular.module('imago').directive('imagoCart', ['imagoCart', imagoCart]);

var imagoCart,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

imagoCart = (function() {
  function imagoCart($q, $window, $http, imagoUtils, imagoModel, imagoSettings) {
    var local;
    this.$q = $q;
    this.$window = $window;
    this.$http = $http;
    this.imagoUtils = imagoUtils;
    this.imagoModel = imagoModel;
    this.imagoSettings = imagoSettings;
    this.remove = __bind(this.remove, this);
    this.update = __bind(this.update, this);
    this.add = __bind(this.add, this);
    this.create = __bind(this.create, this);
    this.checkCart = __bind(this.checkCart, this);
    this.checkStatus = __bind(this.checkStatus, this);
    this.checkCurrency = __bind(this.checkCurrency, this);
    this.cart = {
      items: []
    };
    local = localStorage.getItem('imagoCart');
    if (local) {
      this.checkStatus(local);
    }
    this.checkCurrency();
  }

  imagoCart.prototype.checkCurrency = function() {
    var promises;
    promises = [];
    promises.push(this.$http.get("//www.telize.com/geoip", {
      headers: {
        NexClient: void 0,
        NexTenant: void 0
      }
    }).then((function(_this) {
      return function(response) {
        return _this.telize = response.data;
      };
    })(this)));
    promises.push(this.$http.get("" + this.imagoSettings.host + "/api/settings").then((function(_this) {
      return function(response) {
        var res;
        res = _.find(response.data, {
          name: 'currencies'
        });
        return _this.currencies = res.value;
      };
    })(this)));
    return this.$q.all(promises).then((function(_this) {
      return function() {
        var currency;
        currency = _this.imagoUtils.CURRENCY_MAPPING[_this.telize.country];
        if (__indexOf.call(_this.currencies, currency) >= 0) {
          _this.currency = currency;
        } else if (_this.currencies.length) {
          _this.currency = _this.currencies[0];
        } else {
          console.log('you need to enable at least one currency in the settings');
        }
        if (_this.currency) {
          return _this.cart.currency = _this.currency;
        }
      };
    })(this));
  };

  imagoCart.prototype.checkStatus = function(id) {
    return this.$http.get("" + this.imagoSettings.host + "/api/carts?cartid=" + id).then((function(_this) {
      return function(response) {
        console.log('check status', response);
        return _.assign(_this.cart, response.data);
      };
    })(this));
  };

  imagoCart.prototype.checkCart = function() {
    var defer;
    defer = this.$q.defer();
    if (this.cart._id) {
      defer.resolve('update');
    } else {
      this.create(this.cart).then((function(_this) {
        return function(response) {
          _.assign(_this.cart, response.data);
          localStorage.setItem('imagoCart', response.data._id);
          return defer.resolve('created');
        };
      })(this));
    }
    return defer.promise;
  };

  imagoCart.prototype.create = function(cart) {
    return this.$http.post("" + this.imagoSettings.host + "/api/carts", cart);
  };

  imagoCart.prototype.add = function(item) {
    var copy, filter, parent;
    if (!item.qty) {
      return console.log('quantity required');
    }
    if (!item.serving_url) {
      parent = this.imagoModel.find({
        '_id': item.parent
      });
      if (parent) {
        item.serving_url = parent.serving_url;
      }
    }
    copy = angular.copy(item);
    filter = _.find(this.cart.items, {
      _id: copy._id
    });
    if (filter) {
      filter.qty += copy.qty;
    } else {
      this.cart.items.push(copy);
    }
    return this.checkCart().then((function(_this) {
      return function(response) {
        if (response === 'update') {
          return _this.update();
        }
      };
    })(this));
  };

  imagoCart.prototype.update = function() {
    if (!this.cart._id) {
      return;
    }
    return this.$http.put("" + this.imagoSettings.host + "/api/carts/" + this.cart._id, this.cart);
  };

  imagoCart.prototype.remove = function(item) {
    var idx;
    idx = _.findIndex(this.cart.items, {
      _id: item._id
    });
    this.cart.items.splice(idx, 1);
    return this.update();
  };

  imagoCart.prototype.checkout = function() {
    if (!tenant) {
      return;
    }
    return this.$window.location.href = "https://" + tenant + ".2.imagoapp.com/account/checkout/" + this.cart._id;
  };

  return imagoCart;

})();

angular.module('imago').service('imagoCart', ['$q', '$window', '$http', 'imagoUtils', 'imagoModel', 'imagoSettings', imagoCart]);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imago-cart.html","<div class=\"cart\"><div class=\"items\"><div ng-repeat=\"item in cart.utils.cart.items\" class=\"item\"><b>{{ item._id }}</b><div ng-model=\"item.qty\"></div><button ng-click=\"cart.utils.remove(item)\">remove</button></div></div><button type=\"submit\" ng-click=\"cart.utils.checkout()\" ng-disabled=\"!cart.utils.cart.items.length\" class=\"checkout\">checkout</button></div>");}]);