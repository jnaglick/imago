var imagoCart, imagoCartController;

imagoCart = (function() {
  function imagoCart() {
    return {
      replace: true,
      scope: {
        min: '=',
        max: '=',
        ngModel: '='
      },
      transclude: true,
      templateUrl: '/imago/imago-cart.html',
      controller: 'imagoCartController as cart'
    };
  }

  return imagoCart;

})();

imagoCartController = (function() {
  function imagoCartController(imagoCart1) {
    this.imagoCart = imagoCart1;
  }

  return imagoCartController;

})();

angular.module('imago').directive('imagoCart', [imagoCart]).controller('imagoCartController', ['imagoCart', imagoCartController]);

var imagoCart,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

imagoCart = (function() {
  imagoCart.prototype.show = false;

  imagoCart.prototype.itemsLength = 0;

  imagoCart.prototype.settings = [];

  function imagoCart($q, $rootScope, $window, $http, imagoUtils, imagoModel, imagoSettings) {
    this.$q = $q;
    this.$rootScope = $rootScope;
    this.$window = $window;
    this.$http = $http;
    this.imagoUtils = imagoUtils;
    this.imagoModel = imagoModel;
    this.imagoSettings = imagoSettings;
    this.remove = bind(this.remove, this);
    this.update = bind(this.update, this);
    this.create = bind(this.create, this);
    this.checkCart = bind(this.checkCart, this);
    this.checkStatus = bind(this.checkStatus, this);
    this.cart = {
      items: []
    };
    this.$rootScope.$on('settings:loaded', (function(_this) {
      return function(evt, message) {
        var local;
        _this.currencies = _this.$rootScope.tenantSettings.currencies;
        local = _this.imagoUtils.cookie('imagoCart');
        if (local) {
          return _this.checkStatus(local);
        } else {
          if (_this.currencies.length === 1) {
            _this.currency = _this.currencies[0];
          }
          return _this.geoip();
        }
      };
    })(this));
  }

  imagoCart.prototype.geoip = function() {
    return this.$http.get('//api.imago.io/geoip').then((function(_this) {
      return function(response) {
        _this.geo = response.data;
        return _this.checkCurrency();
      };
    })(this), (function(_this) {
      return function(error) {
        return _this.checkCurrency();
      };
    })(this));
  };

  imagoCart.prototype.checkCurrency = function() {
    var currency, ref;
    if (this.geo) {
      currency = this.imagoUtils.CURRENCY_MAPPING[this.geo.country];
    }
    if (currency && this.currencies && indexOf.call(this.currencies, currency) >= 0) {
      this.currency = currency;
    } else if ((ref = this.currencies) != null ? ref.length : void 0) {
      this.currency = this.currencies[0];
    } else {
      console.log('you need to enable at least one currency in the settings');
    }
    if (!this.cart) {
      return;
    }
    if (this.cart.currency !== this.currency) {
      this.cart.currency = angular.copy(this.currency);
      this.update();
    }
    return this.calculate();
  };

  imagoCart.prototype.checkStatus = function(id) {
    return this.$http.get(this.imagoSettings.host + "/api/carts?cartid=" + id).then((function(_this) {
      return function(response) {
        var i, item, len, ref, ref1, ref2;
        console.log('check cart', response.data);
        _.assign(_this.cart, response.data);
        ref = _this.cart.items;
        for (i = 0, len = ref.length; i < len; i++) {
          item = ref[i];
          item.finalsale = (ref1 = item.fields) != null ? (ref2 = ref1['final-sale']) != null ? ref2.value : void 0 : void 0;
        }
        _this.calculate();
        return _this.geoip();
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
          _this.imagoUtils.cookie('imagoCart', response.data._id);
          return defer.resolve('created');
        };
      })(this));
    }
    return defer.promise;
  };

  imagoCart.prototype.create = function(cart) {
    return this.$http.post(this.imagoSettings.host + "/api/carts", cart);
  };

  imagoCart.prototype.add = function(item, options, fields) {
    var copy, field, filter, i, j, len, len1, option, parent, ref, ref1, ref2;
    if (!item) {
      return console.log('item required');
    }
    if (!item.qty) {
      return console.log('quantity required');
    }
    item.finalsale = (ref = item.fields) != null ? (ref1 = ref['final-sale']) != null ? ref1.value : void 0 : void 0;
    if (_.isArray(options) && (options != null ? options.length : void 0)) {
      item.options = {};
      for (i = 0, len = options.length; i < len; i++) {
        option = options[i];
        item.options[option] = item.fields[option];
      }
    } else if (_.isPlainObject(options)) {
      item.options = options;
    }
    if ((ref2 = item.options) != null ? ref2.name : void 0) {
      item.name = item.options.name;
      delete item.options.name;
    }
    parent = this.imagoModel.find({
      '_id': item.parent
    });
    if (parent) {
      if (!item.name) {
        item.name = parent.name;
      }
      if (!item.serving_url) {
        item.serving_url = parent.serving_url;
      }
      if (_.isArray(fields) && fields.length) {
        for (j = 0, len1 = fields.length; j < len1; j++) {
          field = fields[j];
          item.fields[field] = parent.fields[field];
        }
      } else if (_.isPlainObject(fields)) {
        _.assign(item.fields, parent.fields);
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
      _.assign(filter.options, copy.options);
      _.assign(filter.fields, copy.fields);
    } else {
      this.cart.items.push(copy);
    }
    this.show = true;
    this.calculate();
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
    return this.$http.put(this.imagoSettings.host + "/api/carts/" + this.cart._id, this.cart);
  };

  imagoCart.prototype.remove = function(item) {
    _.remove(this.cart.items, {
      '_id': item._id
    });
    this.calculate();
    return this.update();
  };

  imagoCart.prototype.calculate = function() {
    var i, item, len, ref, results;
    this.itemsLength = 0;
    this.subtotal = 0;
    if (!this.cart.items.length) {
      this.subtotal = 0;
      this.itemsLength = 0;
      return;
    }
    ref = this.cart.items;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      item = ref[i];
      this.itemsLength += item.qty;
      if (!(item.qty && item.fields.price.value[this.currency])) {
        continue;
      }
      results.push(this.subtotal += item.qty * item.fields.price.value[this.currency]);
    }
    return results;
  };

  imagoCart.prototype.checkout = function() {
    if (!tenant) {
      return;
    }
    return this.$window.location.href = "https://" + tenant + ".imago.io/account/checkout/" + this.cart._id;
  };

  return imagoCart;

})();

angular.module('imago').service('imagoCart', ['$q', '$rootScope', '$window', '$http', 'imagoUtils', 'imagoModel', 'imagoSettings', imagoCart]);

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
    return this.$http.get(this.imagoSettings.host + "/api/variants/" + id);
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

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imago-cart.html","<div class=\"cart\"><div ng-click=\"cart.imagoCart.show = !cart.imagoCart.show\" class=\"icon\"><div ng-bind=\"cart.imagoCart.itemsLength\" class=\"counter\"></div></div><div ng-show=\"cart.imagoCart.show\" class=\"box\"><div ng-transclude=\"ng-transclude\"></div><div ng-show=\"cart.imagoCart.itemsLength\" class=\"itemnumber\">{{cart.imagoCart.itemsLength}} items</div><div ng-show=\"cart.imagoCart.itemsLength === 0\" class=\"noitems\">cart empty</div><div class=\"subtotal\">subtotal: {{cart.imagoCart.subtotal | price}}</div><button ng-show=\"cart.imagoCart.cart.items.length\" type=\"submit\" ng-click=\"cart.imagoCart.checkout()\" class=\"checkout\">checkout</button></div></div>");}]);