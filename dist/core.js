var App;

App = (function() {
  function App() {
    return ['lodash'];
  }

  return App;

})();

angular.module('imago', new App());

var lodash;

lodash = angular.module('lodash', []);

lodash.factory('_', function() {
  return window._();
});

var Assets,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Assets = (function() {
  function Assets($rootScope, $scope, $timeout, $state, hotkeys, imagoModel, imagoSettings, facetsStorage, selection, ngProgressLite) {
    var split;
    this.$rootScope = $rootScope;
    this.$scope = $scope;
    this.$timeout = $timeout;
    this.$state = $state;
    this.imagoModel = imagoModel;
    this.imagoSettings = imagoSettings;
    this.facetsStorage = facetsStorage;
    this.selection = selection;
    this.ngProgressLite = ngProgressLite;
    this.checkCount = bind(this.checkCount, this);
    this.refreshAssets = bind(this.refreshAssets, this);
    this.checkAssetsInView = bind(this.checkAssetsInView, this);
    this.saveMarkup = bind(this.saveMarkup, this);
    this.reorder = bind(this.reorder, this);
    this.cleanUp = bind(this.cleanUp, this);
    this.startWatcher = bind(this.startWatcher, this);
    this.serverRequest = bind(this.serverRequest, this);
    this.ngProgressLite.start();
    if (this.$state.params.path) {
      split = this.$state.params.path.split('+');
      if (this.$state.params.path.indexOf('collection:/trash') !== -1) {
        this.trash = true;
      }
    } else {
      split = {
        collection: ['/']
      };
    }
    this.serverRequest(split, this.$state);
    this.addFacets(split);
    this.startWatcher();
    this.saveMarkup();
    this.$scope.$on('$destroy', (function(_this) {
      return function() {
        return _this.cleanUp();
      };
    })(this));
    this.$scope.deselectAll = (function(_this) {
      return function(ev) {
        if (ev.shiftKey || ev.metaKey) {
          return;
        }
        return _this.selection.selected = [];
      };
    })(this);
    this.$scope.destroyPreview = (function(_this) {
      return function(ev) {
        ev.stopPropagation();
        _this.$scope.previewKind = '';
        _this.$scope.previewAsset = false;
        return _this.$rootScope.scroll = false;
      };
    })(this);
    this.shortcuts = {
      "delete": (function(_this) {
        return function() {
          if (!(_this.selection.selected && _.isArray(_this.selection.selected))) {
            return;
          }
          if (_this.trash) {
            _this.numberTrash = angular.copy(_this.selection.selected.length);
            _this.promptTrash = true;
          } else {
            _this.imagoModel.updateCount(_this.collection, -_this.selection.selected.length);
            _this.imagoModel.trash(_this.selection.selected);
          }
          return _this.refreshInView();
        };
      })(this),
      copy: (function(_this) {
        return function() {
          return _this.selection.copy(_this.collection._id);
        };
      })(this),
      cut: (function(_this) {
        return function() {
          return _this.selection.move(_this.collection._id);
        };
      })(this),
      paste: (function(_this) {
        return function() {
          return _this.selection.paste(_this.collection);
        };
      })(this),
      selectAll: (function(_this) {
        return function() {
          return _this.selection.addAll(_this.assets);
        };
      })(this),
      moveUp: (function(_this) {
        return function() {
          var asset, copy, i, idx, key, len, order;
          if (!_this.selection.selected.length || angular.equals(_this.selection.selected[0], _this.assets[0]) || _this.selection.selected.length === _this.assets.length) {
            return;
          }
          order = _this.assets[0].order + _this.imagoSettings.index;
          if (_this.selection.selected.length > 1) {
            _this.selection.selected = _.sortBy(_this.selection.selected, 'order');
          }
          copy = angular.copy(_this.selection.selected);
          for (key = i = 0, len = copy.length; i < len; key = ++i) {
            asset = copy[key];
            idx = _.findIndex(_this.assets, {
              '_id': asset._id
            });
            asset.order = order;
            _this.assets.splice(idx, 1);
            _this.assets.unshift(asset);
            order = order + ((key + 1) * _this.imagoSettings.index);
          }
          if (_this.collection.sortorder === '-order') {
            _this.imagoModel.update(copy, {
              save: true,
              stream: false
            });
            return _this.refreshInView();
          } else {
            return _this.imagoModel.reSort(_this.collection);
          }
        };
      })(this),
      moveDown: (function(_this) {
        return function() {
          var asset, copy, i, idx, key, len, minusOrder, order;
          if (!_this.selection.selected.length || _this.selection.selected.length === _this.assets.length) {
            return;
          }
          if (_this.selection.selected.length > 1) {
            _this.selection.selected = _.sortBy(_this.selection.selected, 'order');
          }
          copy = angular.copy(_this.selection.selected);
          copy = copy.reverse();
          minusOrder = _this.assets[_this.assets.length - 1].order / (_this.selection.selected.length + 1);
          order = _this.assets[_this.assets.length - 1].order - minusOrder;
          order = parseInt(order);
          for (key = i = 0, len = copy.length; i < len; key = ++i) {
            asset = copy[key];
            idx = _.findIndex(_this.assets, {
              '_id': asset._id
            });
            asset.order = order;
            _this.assets.splice(idx, 1);
            _this.assets.push(asset);
            order = parseInt(order - minusOrder);
          }
          if (_this.collection.sortorder === '-order') {
            _this.imagoModel.update(copy, {
              save: true,
              stream: false
            });
            return _this.refreshInView();
          } else {
            return _this.imagoModel.reSort(_this.collection);
          }
        };
      })(this),
      create: (function(_this) {
        return function() {
          if (!_this.trash && _this.collectionBase) {
            return _this.showFormAsset = true;
          }
        };
      })(this),
      escape: (function(_this) {
        return function() {
          _this.showFormAsset = false;
          _this.$scope.previewAsset = null;
          return _this.$rootScope.scroll = false;
        };
      })(this),
      download: (function(_this) {
        return function() {
          var asset, i, ids, len, ref;
          ids = [];
          ref = _this.selection.selected;
          for (i = 0, len = ref.length; i < len; i++) {
            asset = ref[i];
            ids.push(asset._id);
          }
          _this.toDownload = {
            assets: ids
          };
          return _this.promptResolution = true;
        };
      })(this),
      preview: (function(_this) {
        return function(ev) {
          var asset, data, i, idx, j, len, len1, ref, ref1;
          if (ev) {
            ev.preventDefault();
          }
          if (!_this.$scope.previewAsset) {
            _this.$scope.previewAsset = [];
            if (_this.selection.selected.length === 1 && _this.selection.selected[0].serving_url) {
              ref = _this.assets;
              for (i = 0, len = ref.length; i < len; i++) {
                asset = ref[i];
                if (asset.serving_url) {
                  _this.$scope.previewAsset.push(asset);
                }
              }
              idx = _.findIndex(_this.$scope.previewAsset, {
                '_id': _this.selection.selected[0]._id
              });
              _this.$timeout(function() {
                return _this.$rootScope.$emit('slider:change', idx);
              });
            } else if (_this.selection.selected.length > 1) {
              ref1 = _this.selection.selected;
              for (j = 0, len1 = ref1.length; j < len1; j++) {
                data = ref1[j];
                if (data.serving_url) {
                  _this.$scope.previewAsset.push(data);
                }
              }
              _this.$timeout(function() {
                return _this.$rootScope.$emit('slider:change', 0);
              });
            }
            if (!_this.$scope.previewAsset.length) {
              return _this.$scope.previewAsset = null;
            } else {
              return _this.$rootScope.scroll = true;
            }
          } else {
            _this.$scope.previewAsset = null;
            return _this.$rootScope.scroll = false;
          }
        };
      })(this)
    };
    hotkeys.bindTo(this.$scope).add({
      combo: 'mod+backspace',
      callback: (function(_this) {
        return function() {
          return _this.shortcuts["delete"]();
        };
      })(this)
    }).add({
      combo: 'mod+c',
      callback: (function(_this) {
        return function() {
          return _this.shortcuts.copy();
        };
      })(this)
    }).add({
      combo: 'mod+x',
      callback: (function(_this) {
        return function() {
          return _this.shortcuts.cut();
        };
      })(this)
    }).add({
      combo: 'mod+v',
      callback: (function(_this) {
        return function() {
          return _this.shortcuts.paste();
        };
      })(this)
    }).add({
      combo: 'mod+a',
      callback: (function(_this) {
        return function(ev) {
          ev.preventDefault();
          return _this.shortcuts.selectAll();
        };
      })(this)
    }).add({
      combo: 'option+mod+v',
      callback: (function(_this) {
        return function() {
          _this.selection.action = 'move';
          return _this.shortcuts.paste();
        };
      })(this)
    }).add({
      combo: 'option+mod+up',
      callback: (function(_this) {
        return function() {
          return _this.shortcuts.moveUp();
        };
      })(this)
    }).add({
      combo: 'option+mod+down',
      callback: (function(_this) {
        return function() {
          return _this.shortcuts.moveDown();
        };
      })(this)
    }).add({
      combo: 'n',
      callback: (function(_this) {
        return function() {
          return _this.shortcuts.create();
        };
      })(this)
    }).add({
      combo: 'esc',
      callback: (function(_this) {
        return function() {
          return _this.shortcuts.escape();
        };
      })(this)
    }).add({
      combo: 'space',
      callback: (function(_this) {
        return function(ev) {
          return _this.shortcuts.preview(ev);
        };
      })(this)
    });
  }

  Assets.prototype.serverRequest = function(split, state) {
    var base, element, i, len, name, splitElement;
    if (state.params.path) {
      this.search = {};
      for (i = 0, len = split.length; i < len; i++) {
        element = split[i];
        splitElement = element.split(':');
        (base = this.search)[name = splitElement[0]] || (base[name] = []);
        this.search[splitElement[0]].push(splitElement[1]);
      }
    } else {
      this.search = split;
    }
    return this.imagoModel.getData(this.search).then((function(_this) {
      return function(response) {
        var j, len1, results, search;
        results = [];
        for (j = 0, len1 = response.length; j < len1; j++) {
          search = response[j];
          _this.collection = angular.copy(search);
          _this.imagoModel.currentCollection = _this.collection;
          _this.assets = angular.copy(search.assets);
          _this.imagoModel.currentCollection.assets = _this.assets;
          _this.collection.assets = _this.assets;
          if (search._id) {
            _this.collectionBase = true;
            _this.$scope.footer.changeSort(search.sortorder, {
              save: false,
              worker: false
            });
          } else if (search.assets.length) {
            _this.$scope.noOpacity = true;
            _this.collectionBase = false;
            _this.$scope.footer.changeSort(null, {
              save: false,
              worker: false
            });
          } else {
            _this.collectionBase = false;
          }
          _this.checkCount();
          _this.ngProgressLite.done();
          break;
        }
        return results;
      };
    })(this));
  };

  Assets.prototype.addFacets = function(split) {
    var division, i, len, result, results;
    if (this.facetsStorage.items.length) {
      this.facetsStorage.items = [];
    }
    results = [];
    for (i = 0, len = split.length; i < len; i++) {
      result = split[i];
      division = result.split(':');
      this.facetsStorage.add({
        key: division[0]
      });
      results.push(this.facetsStorage.add({
        value: division[1]
      }));
    }
    return results;
  };

  Assets.prototype.downloadAssets = function() {
    this.promptResolution = false;
    return this.imagoModel.assets.download(this.toDownload.assets, this.toDownload.resolution);
  };

  Assets.prototype.cancelTrash = function() {
    return this.promptTrash = false;
  };

  Assets.prototype.confirmTrash = function() {
    this.imagoModel["delete"](this.selection.selected, {
      save: true
    });
    this.promptTrash = false;
    return this.refreshInView();
  };

  Assets.prototype.startWatcher = function() {
    this.watcher = {};
    this.watcher.reorder = this.$rootScope.$on('sort:changed', (function(_this) {
      return function(ev, changes) {
        _this.imagoModel.currentCollection.assets = changes;
        _this.assets = changes;
        return _this.refreshInView();
      };
    })(this));
    this.watcher.add = this.$rootScope.$on('assets:add', (function(_this) {
      return function(ev, changes) {
        var asset, i, len, ref, results;
        results = [];
        for (i = 0, len = changes.length; i < len; i++) {
          asset = changes[i];
          if (((ref = _this.collection) != null ? ref._id : void 0) === asset.parent) {
            _this.refreshAssets();
            break;
          } else {
            results.push(void 0);
          }
        }
        return results;
      };
    })(this));
    this.watcher.update = this.$rootScope.$on('assets:update', (function(_this) {
      return function(ev, changes) {
        return _this.checkAssetsInView(changes);
      };
    })(this));
    this.watcher["delete"] = this.$rootScope.$on('assets:delete', (function(_this) {
      return function(ev, changes) {
        var asset, i, idx, len;
        for (i = 0, len = changes.length; i < len; i++) {
          asset = changes[i];
          idx = _.findIndex(_this.assets, {
            '_id': asset._id
          });
          if (idx !== -1) {
            _this.assets.splice(idx, 1);
          }
        }
        return _this.checkCount();
      };
    })(this));
    return this.$scope.$on('fullscreen', (function(_this) {
      return function(ev, changes) {
        var result;
        _this.fullscreen = changes.fullscreen;
        _this.$rootScope.navigation = changes.fullscreen;
        if (changes.source) {
          _this.$scope.sourceMarkup = changes.source;
        }
        if (changes.input) {
          _this.$scope.valueMarkup = changes.input;
        }
        _this.oldSourceField = _this.sourceField;
        _this.oldSyntaxField = _this.syntaxField;
        _this.sourceField = changes.source._id;
        _this.syntaxField = changes.source.fields[changes.input.name].syntax;
        if (_this.sourceField === _this.oldSourceField && _this.syntaxField !== _this.oldSyntaxField) {
          result = {
            '_id': _this.sourceField,
            'syntax': _this.syntaxField
          };
          return _this.$scope.$broadcast('syntaxChange', result);
        }
      };
    })(this));
  };

  Assets.prototype.cleanUp = function() {
    var key, results;
    results = [];
    for (key in this.watcher) {
      results.push(this.watcher[key]());
    }
    return results;
  };

  Assets.prototype.reorder = function(options) {
    var asset, i, idx, j, len, len1, minusOrder, obj, order, orderedList, reverse, selected;
    selected = angular.copy(this.selection.selected);
    selected = _.sortBy(selected, 'order');
    if (options.dropIndex > options.initialIndex) {
      selected.reverse();
    }
    for (i = 0, len = selected.length; i < len; i++) {
      asset = selected[i];
      idx = _.findIndex(options.collection, {
        '_id': asset._id
      });
      obj = options.collection.splice(idx, 1)[0];
      options.collection.splice(options.dropIndex, 0, obj);
    }
    if (this.collection.sortorder === '-order') {
      reverse = options.initialIndex < options.dropIndex;
      orderedList = this.imagoModel.reorder(options.dropIndex, options.store.store.reorder.collection, selected, {
        reverse: reverse
      });
      if (orderedList.repair) {
        return this.imagoModel.assets.repair(this.collection._id);
      } else {
        order = orderedList.order;
        minusOrder = orderedList.minus;
        for (j = 0, len1 = selected.length; j < len1; j++) {
          asset = selected[j];
          asset.order = order;
          idx = _.findIndex(options.collection, {
            '_id': asset._id
          });
          options.collection[idx].order = asset.order;
          order = order + minusOrder;
        }
        return this.imagoModel.update(selected, {
          stream: false,
          save: true
        });
      }
    } else {
      return this.imagoModel.reSort(this.collection);
    }
  };

  Assets.prototype.saveMarkup = function() {
    if (!this.$scope.sourceMarkup) {
      return;
    }
    return this.imagoModel.update(this.$scope.sourceMarkup, {
      stream: false,
      save: true
    });
  };

  Assets.prototype.checkAssetsInView = function(changes) {
    var asset, i, idx, key, len, ref, ref1, ref2, ref3, update;
    update = {};
    if (_.isArray(changes)) {
      for (key = i = 0, len = changes.length; i < len; key = ++i) {
        asset = changes[key];
        if (((ref = this.collection) != null ? ref._id : void 0) === asset._id) {
          if (asset.sortorder && !angular.equals(asset.sortorder, this.collection.sortorder)) {
            this.$scope.footer.changeSort(asset.sortorder, {
              save: false
            });
          } else if (!asset.kind) {
            this.$state.go('home');
          }
        } else if (((ref1 = this.collection) != null ? ref1._id : void 0) === asset.parent) {
          idx = _.findIndex(this.assets, {
            '_id': asset._id
          });
          if ((!asset.order && idx !== -1) || (asset.order && angular.equals((ref2 = this.assets[idx]) != null ? ref2.order : void 0, asset.order))) {
            _.assign(this.assets[idx], asset);
            update.quick = true;
          } else {
            update.status = true;
            break;
          }
        } else if (!((ref3 = this.collection) != null ? ref3._id : void 0) && _.find(this.assets, {
          '_id': asset._id
        })) {
          idx = _.findIndex(this.assets, {
            '_id': asset._id
          });
          _.assign(this.assets[idx], asset);
          update.quick = true;
        } else if (_.findIndex(this.assets, {
          '_id': asset._id
        }) >= 0 && this.collection._id && asset.parent !== this.collection._id) {
          idx = _.findIndex(this.assets, {
            '_id': asset._id
          });
          this.assets.splice(idx, 1);
          update.quick = true;
        }
      }
    } else if (_.isPlainObject(changes)) {
      if (this.collection && changes.parent === this.collection._id) {
        idx = _.findIndex(this.assets, {
          '_id': changes._id
        });
        _.assign(this.assets[idx], changes);
        update.quick = true;
      } else if (this.collection && changes._id === this.collection._id) {
        update.status = true;
        this.$scope.footer.changeSort(changes.sortorder, {
          save: false,
          worker: false
        });
      }
    }
    if (update.status) {
      return this.refreshAssets();
    } else if (update.quick) {
      return this.checkCount();
    }
  };

  Assets.prototype.refreshAssets = function() {
    console.log('refreshing children of current collection');
    return this.imagoModel.getData(this.search).then((function(_this) {
      return function(response) {
        var i, len, search;
        for (i = 0, len = response.length; i < len; i++) {
          search = response[i];
          _this.collection = angular.copy(search);
          _this.imagoModel.currentCollection = _this.collection;
          _this.assets = angular.copy(search.assets);
          _this.imagoModel.currentCollection.assets = _this.assets;
          _this.collection.assets = _this.assets;
          break;
        }
        _this.checkCount();
        return _this.refreshInView();
      };
    })(this));
  };

  Assets.prototype.refreshInView = function() {
    var event;
    if (document.createEvent) {
      event = new Event('checkInView');
      return window.dispatchEvent(event);
    } else {
      event = document.createEventObject();
      event.eventType = 'checkInView';
      event.eventName = 'checkInView';
      return window.fireEvent('on' + event.eventType, event);
    }
  };

  Assets.prototype.checkCount = function() {
    var ref;
    if ((ref = this.assets) != null ? ref.length : void 0) {
      return this.$scope.noresult = false;
    } else {
      return this.$scope.noresult = true;
    }
  };

  return Assets;

})();

angular.module('imago').controller('assets', ['$rootScope', '$scope', '$timeout', '$state', 'hotkeys', 'imagoModel', 'imagoSettings', 'facetsStorage', 'selection', 'ngProgressLite', Assets]);

var imagoUtils;

imagoUtils = (function() {
  function imagoUtils() {
    var alphanum;
    return {
      KEYS: {
        '16': 'onShift',
        '18': 'onAlt',
        '17': 'onCommand',
        '91': 'onCommand',
        '93': 'onCommand',
        '224': 'onCommand',
        '13': 'onEnter',
        '32': 'onSpace',
        '37': 'onLeft',
        '38': 'onUp',
        '39': 'onRight',
        '40': 'onDown',
        '46': 'onDelete',
        '8': 'onBackspace',
        '9': 'onTab',
        '188': 'onComma',
        '190': 'onPeriod',
        '27': 'onEsc',
        '186': 'onColon',
        '65': 'onA',
        '67': 'onC',
        '86': 'onV',
        '88': 'onX',
        '68': 'onD',
        '187': 'onEqual',
        '189': 'onMinus'
      },
      SYMBOLS: {
        EUR: '&euro;',
        USD: '$',
        SEK: 'SEK',
        YEN: '&yen;',
        GBP: '&pound;',
        GENERIC: '&curren;'
      },
      CURRENCY_MAPPING: {
        "United Arab Emirates": "AED",
        "Afghanistan": "AFN",
        "Albania": "ALL",
        "Armenia": "AMD",
        "Angola": "AOA",
        "Argentina": "ARS",
        "Australia": "AUD",
        "Aruba": "AWG",
        "Azerbaijan": "AZN",
        "Bosnia and Herzegovina": "BAM",
        "Barbados": "BBD",
        "Bangladesh": "BDT",
        "Bulgaria": "BGN",
        "Bahrain": "BHD",
        "Burundi": "BIF",
        "Bermuda": "BMD",
        "Brunei": "BND",
        "Bolivia": "BOB",
        "Brazil": "BRL",
        "Bahamas": "BSD",
        "Bhutan": "BTN",
        "Botswana": "BWP",
        "Belarus": "BYR",
        "Belize": "BZD",
        "Canada": "CAD",
        "Switzerland Franc": "CHF",
        "Chile": "CLP",
        "China": "CNY",
        "Colombia": "COP",
        "Costa Rica": "CRC",
        "Cuba Convertible": "CUC",
        "Cuba Peso": "CUP",
        "Cape Verde": "CVE",
        "Czech Republic": "CZK",
        "Djibouti": "DJF",
        "Denmark": "DKK",
        "Dominican Republic": "DOP",
        "Algeria": "DZD",
        "Egypt": "EGP",
        "Eritrea": "ERN",
        "Ethiopia": "ETB",
        "Autria": "EUR",
        "Fiji": "FJD",
        "United Kingdom": "GBP",
        "Georgia": "GEL",
        "Guernsey": "GGP",
        "Ghana": "GHS",
        "Gibraltar": "GIP",
        "Gambia": "GMD",
        "Guinea": "GNF",
        "Guatemala": "GTQ",
        "Guyana": "GYD",
        "Hong Kong": "HKD",
        "Honduras": "HNL",
        "Croatia": "HRK",
        "Haiti": "HTG",
        "Hungary": "HUF",
        "Indonesia": "IDR",
        "Israel": "ILS",
        "Isle of Man": "IMP",
        "India": "INR",
        "Iraq": "IQD",
        "Iran": "IRR",
        "Iceland": "ISK",
        "Jersey": "JEP",
        "Jamaica": "JMD",
        "Jordan": "JOD",
        "Japan": "JPY",
        "Kenya": "KES",
        "Kyrgyzstan": "KGS",
        "Cambodia": "KHR",
        "Comoros": "KMF",
        "North Korea": "KPW",
        "South Korea": "KRW",
        "Kuwait": "KWD",
        "Cayman Islands": "KYD",
        "Kazakhstan": "KZT",
        "Laos": "LAK",
        "Lebanon": "LBP",
        "Sri Lanka": "LKR",
        "Liberia": "LRD",
        "Lesotho": "LSL",
        "Lithuania": "LTL",
        "Latvia": "LVL",
        "Libya": "LYD",
        "Morocco": "MAD",
        "Moldova": "MDL",
        "Madagascar": "MGA",
        "Macedonia": "MKD",
        "Mongolia": "MNT",
        "Macau": "MOP",
        "Mauritania": "MRO",
        "Mauritius": "MUR",
        "Malawi": "MWK",
        "Mexico": "MXN",
        "Malaysia": "MYR",
        "Mozambique": "MZN",
        "Namibia": "NAD",
        "Nigeria": "NGN",
        "Nicaragua": "NIO",
        "Norway": "NOK",
        "Nepal": "NPR",
        "New Zealand": "NZD",
        "Oman": "OMR",
        "Panama": "PAB",
        "Peru": "PEN",
        "Papua New Guinea": "PGK",
        "Philippines": "PHP",
        "Pakistan": "PKR",
        "Poland": "PLN",
        "Paraguay": "PYG",
        "Qatar": "QAR",
        "Romania": "RON",
        "Serbia": "RSD",
        "Russia": "RUB",
        "Rwanda": "RWF",
        "Saudi Arabia": "SAR",
        "Solomon Islands": "SBD",
        "Seychelles": "SCR",
        "Sudan": "SDG",
        "Sweden": "SEK",
        "Singapore": "SGD",
        "Saint Helena": "SHP",
        "Suriname": "SRD",
        "El Salvador": "SVC",
        "Syria": "SYP",
        "Swaziland": "SZL",
        "Thailand": "THB",
        "Tajikistan": "TJS",
        "Turkmenistan": "TMT",
        "Tunisia": "TND",
        "Tonga": "TOP",
        "Turkey": "TRY",
        "Trinidad and Tobago": "TTD",
        "Tuvalu": "TVD",
        "Taiwan": "TWD",
        "Tanzania": "TZS",
        "Ukraine": "UAH",
        "Uganda": "UGX",
        "United States": "USD",
        "Uruguay": "UYU",
        "Uzbekistan": "UZS",
        "Venezuela": "VEF",
        "Vietnam": "VND",
        "Vanuatu": "VUV",
        "Samoa": "WST",
        "Yemen": "YER",
        "South Africa": "ZAR",
        "Zambia": "ZMW",
        "Zimbabwe": "ZWD",
        "Austria": "EUR",
        "Belgium": "EUR",
        "Bulgaria": "EUR",
        "Croatia": "EUR",
        "Cyprus": "EUR",
        "Czech Republic": "EUR",
        "Denmark": "EUR",
        "Estonia": "EUR",
        "Finland": "EUR",
        "France": "EUR",
        "Germany": "EUR",
        "Greece": "EUR",
        "Hungary": "EUR",
        "Ireland": "EUR",
        "Italy": "EUR",
        "Latvia": "EUR",
        "Lithuania": "EUR",
        "Luxembourg": "EUR",
        "Malta": "EUR",
        "Netherlands": "EUR",
        "Poland": "EUR",
        "Portugal": "EUR",
        "Romania": "EUR",
        "Slovakia": "EUR",
        "Slovenia": "EUR",
        "Spain": "EUR"
      },
      CODES: {
        'Andorra': 'AD',
        'United Arab Emirates': 'AE',
        'Afghanistan': 'AF',
        'Antigua and Barbuda': 'AG',
        'Anguilla': 'AI',
        'Albania': 'AL',
        'Armenia': 'AM',
        'Angola': 'AO',
        'Antarctica': 'AQ',
        'Argentina': 'AR',
        'American Samoa': 'AS',
        'Austria': 'AT',
        'Australia': 'AU',
        'Aruba': 'AW',
        'Aland Islands': 'AX',
        'Azerbaijan': 'AZ',
        'Bosnia and Herzegovina': 'BA',
        'Barbados': 'BB',
        'Bangladesh': 'BD',
        'Belgium': 'BE',
        'Burkina Faso': 'BF',
        'Bulgaria': 'BG',
        'Bahrain': 'BH',
        'Burundi': 'BI',
        'Benin': 'BJ',
        'Saint Barthelemy': 'BL',
        'Bermuda': 'BM',
        'Brunei': 'BN',
        'Bolivia': 'BO',
        'Bonaire': 'BQ',
        'Brazil': 'BR',
        'Bahamas': 'BS',
        'Bhutan': 'BT',
        'Bouvet': 'BV',
        'Botswana': 'BW',
        'Belarus': 'BY',
        'Belize': 'BZ',
        'Canada': 'CA',
        'Cocos Islands': 'CC',
        'Democratic Republic of the Congo': 'CD',
        'Central African Republic': 'CF',
        'Republic of the Congo': 'CG',
        'Switzerland': 'CH',
        'Ivory Coast': 'CI',
        'Cook Islands': 'CK',
        'Chile': 'CL',
        'Cameroon': 'CM',
        'China': 'CN',
        'Colombia': 'CO',
        'Costa Rica': 'CR',
        'Cuba': 'CU',
        'Cape Verde': 'CV',
        'Curacao': 'CW',
        'Christmas Island': 'CX',
        'Cyprus': 'CY',
        'Czech Republic': 'CZ',
        'Germany': 'DE',
        'Djibouti': 'DJ',
        'Denmark': 'DK',
        'Dominica': 'DM',
        'Dominican Republic': 'DO',
        'Algeria': 'DZ',
        'Ecuador': 'EC',
        'Estonia': 'EE',
        'Egypt': 'EG',
        'Western Sahara': 'EH',
        'Eritrea': 'ER',
        'Spain': 'ES',
        'Ethiopia': 'ET',
        'Finland': 'FI',
        'Fiji': 'FJ',
        'Falkland Islands': 'FK',
        'Micronesia': 'FM',
        'Faroe Islands': 'FO',
        'France': 'FR',
        'Gabon': 'GA',
        'United Kingdom': 'GB',
        'Great Britain': 'GB',
        'Grenada': 'GD',
        'Georgia': 'GE',
        'French Guiana': 'GF',
        'Guernsey': 'GG',
        'Ghana': 'GH',
        'Gibraltar': 'GI',
        'Greenland': 'GL',
        'Gambia': 'GM',
        'Guinea': 'GN',
        'Guadeloupe': 'GP',
        'Equatorial Guinea': 'GQ',
        'Greece': 'GR',
        'South Georgia and the South Sandwich Islands': 'GS',
        'Guatemala': 'GT',
        'Guam': 'GU',
        'Guinea-Bissau': 'GW',
        'Guyana': 'GY',
        'Hong Kong': 'HK',
        'Heard Island and McDonald Islands': 'HM',
        'Honduras': 'HN',
        'Croatia': 'HR',
        'Haiti': 'HT',
        'Hungary': 'HU',
        'Indonesia': 'ID',
        'Ireland': 'IE',
        'Israel': 'IL',
        'Isle of Man': 'IM',
        'India': 'IN',
        'British Indian Ocean Territory': 'IO',
        'Iraq': 'IQ',
        'Iran': 'IR',
        'Iceland': 'IS',
        'Italy': 'IT',
        'Jersey': 'JE',
        'Jamaica': 'JM',
        'Jordan': 'JO',
        'Japan': 'JP',
        'Kenya': 'KE',
        'Kyrgyzstan': 'KG',
        'Cambodia': 'KH',
        'Kiribati': 'KI',
        'Comoros': 'KM',
        'Saint Kitts and Nevis': 'KN',
        'North Korea': 'KP',
        'South Korea': 'KR',
        'Kosovo': 'XK',
        'Kuwait': 'KW',
        'Cayman Islands': 'KY',
        'Kazakhstan': 'KZ',
        'Laos': 'LA',
        'Lebanon': 'LB',
        'Saint Lucia': 'LC',
        'Liechtenstein': 'LI',
        'Sri Lanka': 'LK',
        'Liberia': 'LR',
        'Lesotho': 'LS',
        'Lithuania': 'LT',
        'Luxembourg': 'LU',
        'Latvia': 'LV',
        'Libya': 'LY',
        'Morocco': 'MA',
        'Monaco': 'MC',
        'Moldova': 'MD',
        'Montenegro': 'ME',
        'Saint Martin': 'MF',
        'Madagascar': 'MG',
        'Marshall Islands': 'MH',
        'Macedonia': 'MK',
        'Mali': 'ML',
        'Myanmar': 'MM',
        'Mongolia': 'MN',
        'Macao': 'MO',
        'Northern Mariana Islands': 'MP',
        'Martinique': 'MQ',
        'Mauritania': 'MR',
        'Montserrat': 'MS',
        'Malta': 'MT',
        'Mauritius': 'MU',
        'Maldives': 'MV',
        'Malawi': 'MW',
        'Mexico': 'MX',
        'Malaysia': 'MY',
        'Mozambique': 'MZ',
        'Namibia': 'NA',
        'New Caledonia': 'NC',
        'Niger': 'NE',
        'Norfolk Island': 'NF',
        'Nigeria': 'NG',
        'Nicaragua': 'NI',
        'Netherlands': 'NL',
        'Norway': 'NO',
        'Nepal': 'NP',
        'Nauru': 'NR',
        'Niue': 'NU',
        'New Zealand': 'NZ',
        'Oman': 'OM',
        'Panama': 'PA',
        'Peru': 'PE',
        'French Polynesia': 'PF',
        'Papua New Guinea': 'PG',
        'Philippines': 'PH',
        'Pakistan': 'PK',
        'Poland': 'PL',
        'Saint Pierre and Miquelon': 'PM',
        'Pitcairn': 'PN',
        'Puerto Rico': 'PR',
        'Palestinian Territory': 'PS',
        'Portugal': 'PT',
        'Palau': 'PW',
        'Paraguay': 'PY',
        'Qatar': 'QA',
        'Reunion': 'RE',
        'Romania': 'RO',
        'Serbia': 'RS',
        'Russia': 'RU',
        'Rwanda': 'RW',
        'Saudi Arabia': 'SA',
        'Solomon Islands': 'SB',
        'Seychelles': 'SC',
        'Sudan': 'SD',
        'South Sudan': 'SS',
        'Sweden': 'SE',
        'Singapore': 'SG',
        'Saint Helena': 'SH',
        'Slovenia': 'SI',
        'Svalbard': 'SJ',
        'Slovakia': 'SK',
        'Sierra Leone': 'SL',
        'San Marino': 'SM',
        'Senegal': 'SN',
        'Somalia': 'SO',
        'Suriname': 'SR',
        'Sao Tome and Principe': 'ST',
        'El Salvador': 'SV',
        'Sint Maarten': 'SX',
        'Damascus': 'SY',
        'Swaziland': 'SZ',
        'Turks and Caicos Islands': 'TC',
        'Chad': 'TD',
        'French Southern Territories': 'TF',
        'Togo': 'TG',
        'Thailand': 'TH',
        'Tajikistan': 'TJ',
        'Tokelau': 'TK',
        'East Timor': 'TL',
        'Turkmenistan': 'TM',
        'Tunisia': 'TN',
        'Tonga': 'TO',
        'Turkey': 'TR',
        'Trinidad and Tobago': 'TT',
        'Tuvalu': 'TV',
        'Taiwan': 'TW',
        'Tanzania': 'TZ',
        'Ukraine': 'UA',
        'Uganda': 'UG',
        'United States Minor Outlying Islands': 'UM',
        'United States': 'US',
        'USA': 'US',
        'United States of America': 'US',
        'Uruguay': 'UY',
        'Uzbekistan': 'UZ',
        'Vatican': 'VA',
        'Saint Vincent and the Grenadines': 'VC',
        'Venezuela': 'VE',
        'British Virgin Islands': 'VG',
        'U.S. Virgin Islands': 'VI',
        'Vietnam': 'VN',
        'Vanuatu': 'VU',
        'Wallis and Futuna': 'WF',
        'Samoa': 'WS',
        'Yemen': 'YE',
        'Mayotte': 'YT',
        'South Africa': 'ZA',
        'Zambia': 'ZM',
        'Zimbabwe': 'ZW',
        'Serbia and Montenegro': 'CS'
      },
      COUNTRIES: ["Afghanistan", "Aland Islands", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Anguilla", "Antarctica", "Antigua and Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bonaire", "Bosnia and Herzegovina", "Botswana", "Bouvet", "Brazil", "British Indian Ocean Territory", "British Virgin Islands", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Central African Republic", "Chad", "Chile", "China", "Christmas Island", "Cocos Islands", "Colombia", "Comoros", "Cook Islands", "Costa Rica", "Croatia", "Cuba", "Curacao", "Cyprus", "Czech Republic", "Damascus", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Falkland Islands", "Faroe Islands", "Fiji", "Finland", "France", "French Guiana", "French Polynesia", "French Southern Territories", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Great Britain", "Greece", "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Heard Island and McDonald Islands", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Isle of Man", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macao", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Martinique", "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Norfolk Island", "North Korea", "Northern Ireland", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Palestinian Territory", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Pitcairn", "Poland", "Portugal", "Puerto Rico", "Qatar", "Republic of the Congo", "Reunion", "Romania", "Russia", "Rwanda", "Saint Barthelemy", "Saint Helena", "Saint Kitts and Nevis", "Saint Lucia", "Saint Martin", "Saint Pierre and Miquelon", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Serbia and Montenegro", "Seychelles", "Sierra Leone", "Singapore", "Sint Maarten", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Georgia and the South Sandwich Islands", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Svalbard", "Swaziland", "Sweden", "Switzerland", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tokelau", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks and Caicos Islands", "Tuvalu", "U.S. Virgin Islands", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "United States Minor Outlying Islands", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican", "Venezuela", "Vietnam", "Wallis and Futuna", "Western Sahara", "Yemen", "Zambia", "Zimbabwe"],
      STATES: {
        AUSTRALIA: ['ACT', 'NSW', 'NT', 'SA', 'TAS', 'QLD', 'VIC', 'WA'],
        CANADA: ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'ON', 'PE', 'QC', 'SK'],
        USA: ['AL', 'AK', 'AS', 'AZ', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL', 'AR', 'GA', 'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MH', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'MP', 'OH', 'OK', 'OR', 'PW', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY']
      },
      CURRENCIES: ['AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN', 'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BOV', 'BRL', 'BSD', 'BTN', 'BWP', 'BYR', 'BZD', 'CAD', 'CDF', 'CHE', 'CHF', 'CHW', 'CLF', 'CLP', 'CNY', 'COP', 'COU', 'CRC', 'CUC', 'CUP', 'CVE', 'CZK', 'DJF', 'DKK', 'DOP', 'DZD', 'EGP', 'ERN', 'ETB', 'EUR', 'FJD', 'FKP', 'GBP', 'GEL', 'GHS', 'GIP', 'GMD', 'GNF', 'GTQ', 'GYD', 'HKD', 'HNL', 'HRK', 'HTG', 'HUF', 'IDR', 'ILS', 'INR', 'IQD', 'IRR', 'ISK', 'JMD', 'JOD', 'JPY', 'KES', 'KGS', 'KHR', 'KMF', 'KPW', 'KRW', 'KWD', 'KYD', 'KZT', 'LAK', 'LBP', 'LKR', 'LRD', 'LSL', 'LTL', 'LYD', 'MAD', 'MDL', 'MGA', 'MKD', 'MMK', 'MNT', 'MOP', 'MRO', 'MUR', 'MVR', 'MWK', 'MXN', 'MXV', 'MYR', 'MZN', 'NAD', 'NGN', 'NIO', 'NOK', 'NPR', 'NZD', 'OMR', 'PAB', 'PEN', 'PGK', 'PHP', 'PKR', 'PLN', 'PYG', 'QAR', 'RON', 'RSD', 'RUB', 'RWF', 'SAR', 'SBD', 'SCR', 'SDG', 'SEK', 'SGD', 'SHP', 'SLL', 'SOS', 'SRD', 'SSP', 'STD', 'SVC', 'SYP', 'SZL', 'THB', 'TJS', 'TMT', 'TND', 'TOP', 'TRY', 'TTD', 'TWD', 'TZS', 'UAH', 'UGX', 'USD', 'USN', 'USS', 'UYI', 'UYU', 'UZS', 'VEF', 'VND', 'VUV', 'WST', 'XAF', 'XAG', 'XAU', 'XBA', 'XBB', 'XBC', 'XBD', 'XCD', 'XDR', 'XOF', 'XPD', 'XPF', 'XPT', 'XSU', 'XTS', 'XUA', 'XXX', 'YER', 'ZAR', 'ZMW', 'ZWL'],
      toType: function(obj) {
        return {}.toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
      },
      requestAnimationFrame: (function() {
        var request;
        request = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
          return window.setTimeout(callback, 1000 / 60);
        };
        return function(callback) {
          return request.call(window, callback);
        };
      })(),
      cookie: function(name, value) {
        var cookie, k, len, ref;
        if (!value) {
          ref = document.cookie.split(';');
          for (k = 0, len = ref.length; k < len; k++) {
            cookie = ref[k];
            if (cookie.indexOf(name) === 1) {
              return cookie.split('=')[1];
            }
          }
          return false;
        }
        return document.cookie = name + "=" + value + "; path=/";
      },
      sha: function() {
        var i, k, possible, text;
        text = '';
        possible = 'abcdefghijklmnopqrstuvwxyz0123456789';
        for (i = k = 0; k <= 56; i = ++k) {
          text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
      },
      uuid: function() {
        var S4;
        S4 = function() {
          return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
      },
      urlify: function(query) {
        return console.log('urlify');
      },
      queryfy: function(url) {
        var facet, filter, k, key, len, query, ref, value;
        query = [];
        ref = url.split('+');
        for (k = 0, len = ref.length; k < len; k++) {
          filter = ref[k];
          filter || (filter = 'collection:/');
          facet = filter.split(':');
          key = facet[0].toLowerCase();
          value = decodeURIComponent(facet[1] || '');
          facet = {};
          facet[key] = value;
          query.push(facet);
        }
        return query;
      },
      pluralize: function(str) {
        return str + 's';
      },
      singularize: function(str) {
        return str.replace(/s$/, '');
      },
      titleCase: function(str) {
        if (typeof str !== 'string') {
          return str;
        }
        return str.charAt(0).toUpperCase() + str.slice(1);
      },
      normalize: function(s) {
        var mapping, r, str;
        mapping = {
          'ä': 'ae',
          'ö': 'oe',
          'ü': 'ue',
          '&': 'and',
          'é': 'e',
          'ë': 'e',
          'ï': 'i',
          'è': 'e',
          'à': 'a',
          'ù': 'u',
          'ç': 'c',
          'ø': 'o'
        };
        s = s.toLowerCase();
        r = new RegExp(Object.keys(mapping).join('|'), 'g');
        str = s.trim().replace(r, function(s) {
          return mapping[s];
        }).toLowerCase();
        return str.replace(/[',:;#]/g, '').replace(/[^\/\w]+/g, '-').replace(/\W?\/\W?/g, '\/').replace(/^-|-$/g, '');
      },
      alphaNumSort: alphanum = function(a, b) {
        var aa, bb, c, chunkify, d, x;
        chunkify = function(t) {
          var i, j, m, n, tz, x, y;
          tz = [];
          x = 0;
          y = -1;
          n = 0;
          i = void 0;
          j = void 0;
          while (i = (j = t.charAt(x++)).charCodeAt(0)) {
            m = i === 46 || (i >= 48 && i <= 57);
            if (m !== n) {
              tz[++y] = "";
              n = m;
            }
            tz[y] += j;
          }
          return tz;
        };
        aa = chunkify(a);
        bb = chunkify(b);
        x = 0;
        while (aa[x] && bb[x]) {
          if (aa[x] !== bb[x]) {
            c = Number(aa[x]);
            d = Number(bb[x]);
            if (c === aa[x] && d === bb[x]) {
              return c - d;
            } else {
              return (aa[x] > bb[x] ? 1 : -1);
            }
          }
          x++;
        }
        return aa.length - bb.length;
      },
      isiOS: function() {
        return !!navigator.userAgent.match(/iPad|iPhone|iPod/i);
      },
      isiPad: function() {
        return !!navigator.userAgent.match(/iPad/i);
      },
      isiPhone: function() {
        return !!navigator.userAgent.match(/iPhone/i);
      },
      isiPod: function() {
        return !!navigator.userAgent.match(/iPod/i);
      },
      isChrome: function() {
        return !!navigator.userAgent.match(/Chrome/i);
      },
      isIE: function() {
        return !!navigator.userAgent.match(/MSIE/i);
      },
      isFirefox: function() {
        return !!navigator.userAgent.match(/Firefox/i);
      },
      isSafari: function() {
        return !!navigator.userAgent.match(/Safari/i) && !this.isChrome();
      },
      isMobile: function() {
        return !!navigator.userAgent.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i);
      },
      isEven: function(n) {
        return this.isNumber(n) && (n % 2 === 0);
      },
      isOdd: function(n) {
        return this.isNumber(n) && (n % 2 === 1);
      },
      isNumber: function(n) {
        return n === parseFloat(n);
      },
      toFloat: function(value, decimal) {
        var floats, ints;
        if (decimal == null) {
          decimal = 2;
        }
        if (!decimal) {
          return value;
        }
        value = String(value).replace(/\D/g, '');
        floats = value.slice(value.length - decimal);
        while (floats.length < decimal) {
          floats = '0' + floats;
        }
        ints = value.slice(0, value.length - decimal) || '0';
        return ints + "." + floats;
      },
      toPrice: function(value, currency) {
        var price, symbol;
        price = this.toFloat(value).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
        symbol = this.getCurrencySymbol(currency);
        return symbol + " " + price;
      },
      isEmail: function(value) {
        var pattern;
        pattern = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return !!value.match(pattern);
      },
      getAssetKind: function(id) {
        var kind;
        if (id.indexOf('Collection-') === 0) {
          kind = 'collection';
        } else if (id.indexOf('Proxy-') === 0) {
          kind = 'Proxy';
        } else if (id.indexOf('Order-') === 0) {
          kind = 'Order';
        } else if (id.indexOf('Generic') === 0) {
          kind = 'Generic';
        } else if (id.match(/[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}/)) {
          kind = 'image';
        } else if (id.match(/[0-9a-z]{56}/)) {
          kind = 'video';
        }
        return kind;
      },
      getKeyName: function(e) {
        return KEYS[e.which];
      },
      getURLParameter: function(name) {
        var regex, results;
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
        results = regex.exec(location.search);
        if (results == null) {
          return "";
        } else {
          return decodeURIComponent(results[1].replace(/\+/g, " "));
        }
      },
      inUsa: function(value) {
        var ref;
        return (ref = value != null ? value.toLowerCase() : void 0) === 'usa' || ref === 'united states' || ref === 'united states of america';
      },
      replaceNewLines: function(msg) {
        return msg.replace(/(\r\n\r\n|\r\n|\n|\r)/gm, "<br>");
      },
      getCurrencySymbol: function(currency) {
        return this.SYMBOLS[currency] || this.SYMBOLS.GENERIC;
      },
      getCurrency: function(country) {
        return CURRENCY_MAPPING[country];
      },
      includesTax: function(currency) {
        var TAXINCLUDED;
        TAXINCLUDED = {
          'USD': false
        };
        if (TAXINCLUDED[currency] !== void 0) {
          return false;
        }
        return true;
      },
      toArray: function(elem) {
        if (angular.isArray(elem)) {
          return elem;
        } else {
          return [elem];
        }
      },
      getMeta: function(asset, attribute) {
        if (!asset.fields[attribute]) {
          return console.log("This asset does not contain a " + attribute + " attribute");
        }
        return asset.fields[attribute].value;
      },
      isBaseString: function(string) {
        if (string == null) {
          string = '';
        }
        return !!string.match(this.isBaseRegex);
      },
      isBaseRegex: /^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i,
      renameKey: function(oldName, newName, object) {
        object[newName] = object[oldName];
        delete object[oldName];
        return object;
      }
    };
  }

  return imagoUtils;

})();

angular.module('imago').factory('imagoUtils', [imagoUtils]);

var imagoWorker,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

imagoWorker = (function() {
  function imagoWorker($q) {
    this.$q = $q;
    this.work = bind(this.work, this);
    this.create = bind(this.create, this);
  }

  imagoWorker.prototype.create = function(path) {
    return new Worker(path);
  };

  imagoWorker.prototype.work = function(data) {
    var defer, worker;
    defer = this.$q.defer();
    if (!(data && data.path)) {
      defer.reject('nodata');
    }
    worker = this.create(data.path);
    worker.addEventListener('message', (function(_this) {
      return function(e) {
        defer.resolve(e.data);
        return worker.terminate();
      };
    })(this));
    worker.postMessage(data);
    return defer.promise;
  };

  return imagoWorker;

})();

angular.module('imago').service('imagoWorker', ['$q', imagoWorker]);

var Meta;

Meta = (function() {
  function Meta() {
    return function(input, value) {
      if (!(input && value && input.fields[value])) {
        return;
      }
      if (input.fields[value].kind === 'file') {
        return input.fields[value].download_url;
      } else if (input.fields[value].kind === 'markup') {
        return input.fields[value].value.value;
      } else {
        return input.fields[value].value;
      }
    };
  }

  return Meta;

})();

angular.module('imago').filter('meta', [Meta]);

var imagoPage;

imagoPage = (function() {
  function imagoPage($scope, $state, imagoModel) {
    var path;
    path = '/';
    imagoModel.getData(path).then(function(response) {
      $scope.collection = response[0];
      return $scope.assets = imagoModel.getChildren(response[0]);
    });
  }

  return imagoPage;

})();

angular.module('imago').controller('imagoPage', ['$scope', '$state', 'imagoModel', imagoPage]);
