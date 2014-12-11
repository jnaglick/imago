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
