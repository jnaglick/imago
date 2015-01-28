var CurrencySymbol;

CurrencySymbol = (function() {
  function CurrencySymbol(imagoUtils) {
    return function(currency) {
      if (!currency) {
        return;
      }
      return imagoUtils.getCurrencySymbol(currency);
    };
  }

  return CurrencySymbol;

})();

angular.module('imago').filter('currencySymbol', ['imagoUtils', CurrencySymbol]);

var Price;

Price = (function() {
  function Price() {
    return function(price) {
      if (_.isUndefined(price)) {
        return '0.00';
      } else {
        price = parseFloat(price);
        price = (price / 100).toFixed(2);
        return price;
      }
    };
  }

  return Price;

})();

angular.module('imago').filter('price', [Price]);

var tagFilter,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

tagFilter = (function() {
  function tagFilter(imagoUtils) {
    return function(input, tag) {
      var asset, filtered, _i, _len;
      filtered = [];
      if (!input) {
        return;
      }
      for (_i = 0, _len = input.length; _i < _len; _i++) {
        asset = input[_i];
        if (tag) {
          if (__indexOf.call(imagoUtils.getMeta(asset, 'tags'), tag) >= 0) {
            filtered.push(asset);
          }
        } else {
          filtered.push(asset);
        }
      }
      return filtered;
    };
  }

  return tagFilter;

})();

angular.module('imago').filter('tagFilter', ['imagoUtils', tagFilter]);
