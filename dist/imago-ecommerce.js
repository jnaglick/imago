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
  imagoCart.prototype.show = false;

  function imagoCart($q, $window, $http, imagoUtils, imagoModel, imagoSettings) {
    var local, promises;
    this.$q = $q;
    this.$window = $window;
    this.$http = $http;
    this.imagoUtils = imagoUtils;
    this.imagoModel = imagoModel;
    this.imagoSettings = imagoSettings;
    this.remove = __bind(this.remove, this);
    this.update = __bind(this.update, this);
    this.create = __bind(this.create, this);
    this.checkCart = __bind(this.checkCart, this);
    this.checkStatus = __bind(this.checkStatus, this);
    this.checkCurrency = __bind(this.checkCurrency, this);
    this.cart = {
      items: []
    };
    local = localStorage.getItem('imagoCart');
    promises = [];
    if (local) {
      promises.push(this.checkStatus(local));
    }
    promises.push(this.checkCurrency());
    this.$q.all(promises).then((function(_this) {
      return function() {
        if (_this.cart.currency !== _this.currency) {
          _this.cart.currency = angular.copy(_this.currency);
          return _this.update();
        }
      };
    })(this));
  }

  imagoCart.prototype.checkCurrency = function() {
    var defer, promises;
    defer = this.$q.defer();
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
    this.$q.all(promises).then((function(_this) {
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
        return defer.resolve();
      };
    })(this));
    return defer.promise;
  };

  imagoCart.prototype.checkStatus = function(id) {
    var defer;
    defer = this.$q.defer();
    this.$http.get("" + this.imagoSettings.host + "/api/carts?cartid=" + id).then((function(_this) {
      return function(response) {
        console.log('check cart', response.data);
        _.assign(_this.cart, response.data);
        return defer.resolve();
      };
    })(this));
    return defer.promise;
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

  imagoCart.prototype.add = function(item, options) {
    var copy, filter, option, parent, _i, _len;
    if (!item) {
      return console.log('item required');
    }
    if (!item.qty) {
      return console.log('quantity required');
    }
    if (_.isArray(options) && (options != null ? options.length : void 0)) {
      item.options = {};
      for (_i = 0, _len = options.length; _i < _len; _i++) {
        option = options[_i];
        item.options[option] = item.fields[option];
      }
    } else if (_.isPlainObject(options)) {
      item.options = options;
    }
    parent = this.imagoModel.find({
      '_id': item.parent
    });
    if (item.options.name) {
      item.name = item.options.name;
      delete item.options.name;
    }
    if (parent) {
      if (!item.name) {
        item.name = parent.name;
      }
      if (!item.serving_url) {
        item.serving_url = parent.serving_url;
      }
    }
    copy = angular.copy(item);
    filter = _.find(this.cart.items, {
      _id: copy._id
    });
    if (filter) {
      if (!filter.name) {
        filter.name = copy.name;
      }
      filter.qty += copy.qty;
    } else {
      this.cart.items.push(copy);
    }
    this.show = true;
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

var VariantsStorage;

VariantsStorage = (function() {
  VariantsStorage.prototype.data = [];

  function VariantsStorage($http, $q, imagoModel, imagoSettings) {
    this.$http = $http;
    this.$q = $q;
    this.imagoModel = imagoModel;
    this.imagoSettings = imagoSettings;
  }

  VariantsStorage.prototype.search = function(id) {
    return this.$http.get("" + this.imagoSettings.host + "/api/variants/" + id);
  };

  VariantsStorage.prototype.get = function(parent) {
    var asset, data, defer;
    defer = this.$q.defer();
    asset = this.imagoModel.find({
      _id: parent
    });
    data = _.filter(this.data, {
      parent: parent
    });
    if ((asset != null ? asset.variants.length : void 0) === data.length) {
      defer.resolve(data);
    } else {
      this.search(parent).then(function(response) {
        return defer.resolve(response.data);
      });
    }
    return defer.promise;
  };

  return VariantsStorage;

})();

angular.module('imago').service('variantsStorage', ['$http', '$q', 'imagoModel', 'imagoSettings', VariantsStorage]);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imago-cart.html","<div class=\"cart\"><div ng-click=\"cart.utils.show = !cart.utils.show\" class=\"icon\"><div ng-bind=\"cart.utils.cart.items.length\" class=\"counter\"></div></div><div ng-show=\"cart.utils.show\" class=\"box\"><div ng-transclude=\"ng-transclude\"></div><div ng-show=\"cart.utils.cart.items.length\" class=\"itemnumber\">{{cart.utils.cart.items.length}} items</div><div ng-show=\"cart.utils.cart.items.length === 0\" class=\"noitems\">no items in cart</div><button ng-show=\"cart.utils.cart.items.length\" type=\"submit\" ng-click=\"cart.utils.checkout()\" class=\"checkout\">checkout</button></div></div>");}]);