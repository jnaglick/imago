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
  function imagoCart($q, $window, $http, imagoUtils, imagoSettings) {
    var local;
    this.$q = $q;
    this.$window = $window;
    this.$http = $http;
    this.imagoUtils = imagoUtils;
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
          console.log('you to enable at least one currency in the settings');
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
    var copy, filter;
    if (!item.qty) {
      return console.log('quantity required');
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

angular.module('imago').service('imagoCart', ['$q', '$window', '$http', 'imagoUtils', 'imagoSettings', imagoCart]);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imago-cart.html","<div class=\"cart\"><div class=\"items\"><div ng-repeat=\"item in cart.utils.cart.items\" class=\"item\"><b>{{ item._id }}</b><div ng-model=\"item.qty\"></div><button ng-click=\"cart.utils.remove(item)\">remove</button></div></div><button type=\"submit\" ng-click=\"cart.utils.checkout()\" class=\"checkout\">checkout</button></div>");}]);