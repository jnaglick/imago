var FulfillmentsCenter,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

FulfillmentsCenter = (function() {
  FulfillmentsCenter.prototype.data = [];

  FulfillmentsCenter.prototype.loaded = false;

  FulfillmentsCenter.prototype.selected = {};

  function FulfillmentsCenter($http, $rootScope, geoIp, imagoSettings, imagoUtils) {
    this.$http = $http;
    this.$rootScope = $rootScope;
    this.geoIp = geoIp;
    this.imagoSettings = imagoSettings;
    this.imagoUtils = imagoUtils;
    this.get();
  }

  FulfillmentsCenter.prototype.get = function() {
    return this.$http.get(this.imagoSettings.host + '/api/fulfillmentcenters').then((function(_this) {
      return function(response) {
        _this.data = response.data;
        return _this.getOptions();
      };
    })(this));
  };

  FulfillmentsCenter.prototype.getOptions = function() {
    var watcher;
    if (this.data.length === 1) {
      this.selected = this.data[0];
      this.loaded = true;
      return this.$rootScope.$emit('fulfillments:loaded', this.data);
    }
    if (this.geoIp.data.country) {
      return this.geoValid();
    } else if (this.geoIp.data === null) {
      return this.getGeneric();
    } else if (!this.geoIp.loaded) {
      return watcher = this.$rootScope.$on('geoip:loaded', (function(_this) {
        return function(evt, data) {
          watcher();
          if (_this.geoIp.data.country) {
            return _this.geoValid();
          } else {
            return _this.getGeneric();
          }
        };
      })(this));
    }
  };

  FulfillmentsCenter.prototype.getGeneric = function() {
    this.selected = _.find(this.data, function(ffc) {
      return !ffc.countries.length;
    });
    this.$rootScope.$emit('fulfillments:loaded', this.data);
    return this.loaded = true;
  };

  FulfillmentsCenter.prototype.geoValid = function() {
    this.selected = _.find(this.data, (function(_this) {
      return function(ffc) {
        var ref;
        return ref = _this.geoIp.data.country, indexOf.call(ffc.countries, ref) >= 0;
      };
    })(this));
    if (this.selected) {
      this.$rootScope.$emit('fulfillments:loaded', this.data);
      this.loaded = true;
    } else {
      return this.getGeneric();
    }
  };

  return FulfillmentsCenter;

})();

angular.module('imago').service('fulfillmentsCenter', ['$http', '$rootScope', 'geoIp', 'imagoSettings', 'imagoUtils', FulfillmentsCenter]);

var GeoIp;

GeoIp = (function() {
  GeoIp.prototype.data = {};

  GeoIp.prototype.loaded = false;

  function GeoIp($rootScope, $http, imagoUtils) {
    this.$rootScope = $rootScope;
    this.$http = $http;
    this.imagoUtils = imagoUtils;
    this.get();
  }

  GeoIp.prototype.get = function() {
    if (this.imagoUtils.cookie('countryGeo')) {
      this.data.country = this.imagoUtils.getCountryByCode(this.imagoUtils.cookie('countryGeo'));
      this.$rootScope.$emit('geoip:loaded', this.data);
      this.loaded = true;
      return;
    }
    return this.$http.get('//api.imago.io/geoip').then((function(_this) {
      return function(response) {
        var code;
        code = _this.imagoUtils.getCountryByCode(response.data.country_code);
        _this.imagoUtils.cookie('countryGeo', response.data.country_code);
        _this.data = code;
        _this.$rootScope.$emit('geoip:loaded', _this.data);
        return _this.loaded = true;
      };
    })(this), (function(_this) {
      return function(err) {
        _this.data = null;
        _this.$rootScope.$emit('geoip:loaded', _this.data);
        return _this.loaded = true;
      };
    })(this));
  };

  return GeoIp;

})();

angular.module('imago').service('geoIp', ['$rootScope', '$http', 'imagoUtils', GeoIp]);

var ImagoCartMessages;

ImagoCartMessages = (function() {
  function ImagoCartMessages() {
    return {
      scope: {
        item: '=imagoCartMessages'
      },
      templateUrl: '/imago/imago-cart-messages.html'
    };
  }

  return ImagoCartMessages;

})();

angular.module('imago').directive('imagoCartMessages', [ImagoCartMessages]);

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
    this.clickOut = function(evt, className) {
      if (evt.target.tagName === 'BUTTON' && evt.target.className.indexOf(className) !== -1) {
        return;
      }
      return this.imagoCart.show = false;
    };
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

  function imagoCart($q, $rootScope, $window, $http, imagoUtils, imagoModel, fulfillmentsCenter, geoIp, imagoSettings, tenantSettings) {
    this.$q = $q;
    this.$rootScope = $rootScope;
    this.$window = $window;
    this.$http = $http;
    this.imagoUtils = imagoUtils;
    this.imagoModel = imagoModel;
    this.fulfillmentsCenter = fulfillmentsCenter;
    this.geoIp = geoIp;
    this.imagoSettings = imagoSettings;
    this.remove = bind(this.remove, this);
    this.update = bind(this.update, this);
    this.create = bind(this.create, this);
    this.checkCart = bind(this.checkCart, this);
    this.checkStatus = bind(this.checkStatus, this);
    this.cart = {
      items: []
    };
    if (tenantSettings.loaded) {
      this.onSettings();
    } else {
      this.$rootScope.$on('settings:loaded', (function(_this) {
        return function(evt, message) {
          return _this.onSettings();
        };
      })(this));
    }
  }

  imagoCart.prototype.onSettings = function() {
    var local;
    this.currencies = this.$rootScope.tenantSettings.currencies;
    local = this.imagoUtils.cookie('imagoCart');
    if (local) {
      return this.checkStatus(local);
    } else {
      if (this.currencies.length === 1) {
        this.currency = this.currencies[0];
      }
      return this.checkGeoIp();
    }
  };

  imagoCart.prototype.checkGeoIp = function() {
    var watcher;
    if (this.geoIp.data === null) {
      return this.checkCurrency();
    } else if (_.isEmpty(this.geoIp.data)) {
      return watcher = this.$rootScope.$on('geoip:loaded', (function(_this) {
        return function(evt, data) {
          _this.geo = _this.geoIp.data;
          _this.checkCurrency();
          return watcher();
        };
      })(this));
    } else {
      this.geo = this.geoIp.data;
      return this.checkCurrency();
    }
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
        var watcher;
        console.log('check cart', response.data);
        _.assign(_this.cart, response.data);
        if (!_this.fulfillmentsCenter.loaded) {
          return watcher = _this.$rootScope.$on('fulfillments:loaded', function(evt, data) {
            _this.statusLoaded();
            return watcher();
          });
        } else {
          return _this.statusLoaded();
        }
      };
    })(this));
  };

  imagoCart.prototype.statusLoaded = function() {
    var i, item, len, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, update;
    update = false;
    ref = this.cart.items;
    for (i = 0, len = ref.length; i < len; i++) {
      item = ref[i];
      item.finalsale = (ref1 = item.fields) != null ? (ref2 = ref1.finalSale) != null ? ref2.value : void 0 : void 0;
      item.stock = Number((ref3 = item.fields) != null ? (ref4 = ref3.stock) != null ? (ref5 = ref4.value) != null ? ref5[this.fulfillmentsCenter.selected._id] : void 0 : void 0 : void 0);
      item.updates = [];
      if (!item.changed.length) {
        continue;
      }
      if (item.qty > item.stock) {
        item.qty = item.stock;
        item.updates.push('quantity');
      }
      if (indexOf.call(item.changed, 'price') >= 0) {
        item.price = (ref6 = item.fields) != null ? (ref7 = ref6.price) != null ? ref7.value : void 0 : void 0;
        item.updates.push('price');
      }
      if (indexOf.call(item.changed, 'discountedPrice') >= 0) {
        item.discountedPrice = (ref8 = item.fields) != null ? (ref9 = ref8.discountedPrice) != null ? ref9.value : void 0 : void 0;
        if (indexOf.call(item.updates, 'price') < 0) {
          item.updates.push('price');
        }
      }
      if (item.updates.length) {
        this.newmessages = true;
        update = true;
      }
    }
    if (!this.currency) {
      this.currency = angular.copy(this.cart.currency);
    }
    if (update) {
      this.update();
    }
    this.calculate();
    return this.checkGeoIp();
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
    item.finalsale = (ref = item.fields) != null ? (ref1 = ref.finalSale) != null ? ref1.value : void 0 : void 0;
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
      if (filter.qty !== filter.stock) {
        filter.qty += copy.qty;
      }
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

angular.module('imago').service('imagoCart', ['$q', '$rootScope', '$window', '$http', 'imagoUtils', 'imagoModel', 'fulfillmentsCenter', 'geoIp', 'imagoSettings', 'tenantSettings', imagoCart]);

var ShippingCountries;

ShippingCountries = (function() {
  ShippingCountries.prototype.data = [];

  ShippingCountries.prototype.loaded = false;

  function ShippingCountries($http, imagoSettings) {
    this.$http = $http;
    this.imagoSettings = imagoSettings;
    this.get();
  }

  ShippingCountries.prototype.get = function() {
    return this.$http.get(this.imagoSettings.host + '/api/shippingmethods').then((function(_this) {
      return function(response) {
        var country, i, j, len, len1, method, ref, ref1;
        ref = response.data;
        for (i = 0, len = ref.length; i < len; i++) {
          method = ref[i];
          ref1 = method.countries;
          for (j = 0, len1 = ref1.length; j < len1; j++) {
            country = ref1[j];
            _this.data.push(country);
          }
        }
        _this.data = _.sortBy(_.compact(_.uniq(_this.data)));
        return _this.loaded = true;
      };
    })(this));
  };

  return ShippingCountries;

})();

angular.module('imago').service('shippingCountries', ['$http', 'imagoSettings', ShippingCountries]);

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

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imago-cart-messages.html","<div class=\"messages\"><div ng-repeat=\"key in item.updates\" ng-swich=\"key\" class=\"message\"><p ng-swich-wen=\"price\">price has changed.</p><p ng-swich-wen=\"quantity\">quantity has been updated.</p></div></div>");
$templateCache.put("/imago/imago-cart.html","<div class=\"cart\"><div ng-click=\"cart.imagoCart.show = !cart.imagoCart.show\" ng-class=\"{\'message\': cart.imagoCart.newmessages}\" class=\"icon\"><div ng-bind=\"cart.imagoCart.itemsLength\" class=\"counter\"></div></div><div ng-show=\"cart.imagoCart.show\" class=\"box\"><div ng-transclude=\"ng-transclude\"></div><div ng-show=\"cart.imagoCart.itemsLength\" class=\"itemnumber\">{{cart.imagoCart.itemsLength}} items</div><div ng-show=\"cart.imagoCart.itemsLength === 0\" class=\"noitems\">cart empty</div><div ng-show=\"cart.imagoCart.itemsLength\" class=\"subtotal\">subtotal: {{cart.imagoCart.subtotal | price:0}}</div><button ng-show=\"cart.imagoCart.cart.items.length\" type=\"submit\" ng-click=\"cart.imagoCart.checkout()\" class=\"checkout\">checkout</button></div></div>");}]);