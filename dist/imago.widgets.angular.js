angular.module("ImagoWidgetsTemplates", []).run(["$templateCache", function($templateCache) {$templateCache.put("/imagoWidgets/image-widget.html","<div ng-style=\"elementStyle\" ng-class=\"{loaded: !!imageStyle}\" class=\"imagoimage\"><div ng-style=\"imageStyle\" class=\"image\"></div></div>");
$templateCache.put("/imagoWidgets/slider-widget.html","<div ng-class=\"elementStyle\"><div ng-style=\"sliderStyle\" ng-swipe-left=\"goPrev()\" ng-swipe-right=\"goNext()\" class=\"nexslider\"><div ng-show=\"confSlider.enablearrows &amp;&amp; loadedData\" ng-click=\"goPrev()\" class=\"prev\"></div><div ng-show=\"confSlider.enablearrows &amp;&amp; loadedData\" ng-click=\"goNext()\" class=\"next\"></div><div ng-class=\"{\'active\':isCurrentSlideIndex($index)}\" ng-repeat=\"slide in slideSource\" ng-hide=\"!isCurrentSlideIndex($index)\" class=\"slide\"><div imago-image=\"imago-image\" source=\"slide\" sizemode=\"{{$parent.confSlider.sizemode}}\"></div></div></div></div>");
$templateCache.put("/imagoWidgets/video-widget.html","<div ng-style=\"videoBackground\" ng-click=\"videoActive = true\" class=\"imagovideo imagowrapper {{optionsVideo.align}} {{optionsVideo.size}} {{optionsVideo.sizemode}}\"><a ng-click=\"togglePlay()\" class=\"playbig icon-play\"></a><video ng-style=\"styleFormats\" ng-show=\"videoActive\"><source ng-repeat=\"format in videoFormats\" src=\"{{format.src}}\" data-size=\"{{format.size}}\" data-codec=\"{{format.codec}}\" type=\"{{format.type}}\"/></video><div ng-if=\"controls\" class=\"controls\"><a ng-click=\"play()\" class=\"play icon-play\"></a><a ng-click=\"pause()\" class=\"pause icon-pause\"></a><span class=\"time\">{{time}}</span><span class=\"seekbar\"><input type=\"range\" ng-model=\"seekTime\" ng-change=\"seek(seekTime)\" class=\"seek\"/></span><a ng-click=\"toggleSize()\" class=\"size\">hd</a><span class=\"volume\"><input type=\"range\" ng-model=\"volumeInput\" ng-change=\"onVolumeChange(volumeInput)\"/></span><a ng-click=\"fullScreen()\" class=\"fullscreen icon-resize-full\"></a><a class=\"screen icon-resize-small\"></a></div></div>");}]);
var imagoWidgets;

imagoWidgets = angular.module('imago.widgets.angular', ["ImagoWidgetsTemplates"]);

imagoWidgets.directive('imagoImage', function() {
  return {
    replace: true,
    templateUrl: '/imagoWidgets/image-widget.html',
    controller: function($scope, $element, $attrs, $transclude) {},
    compile: function(tElement, tAttrs, transclude) {
      return {
        pre: function(scope, iElement, iAttrs, controller) {
          var assetRatio, backgroundSize, dpr, r, servingSize, wrapperRatio;
          this.defaults = {
            align: 'center center',
            sizemode: 'fit',
            hires: true,
            scale: 1,
            lazy: true,
            maxSize: 2560,
            responsive: true,
            mediasize: false,
            width: '',
            height: ''
          };
          angular.forEach(this.defaults, function(value, key) {
            return this[key] = value;
          });
          angular.forEach(iAttrs, function(value, key) {
            return this[key] = value;
          });
          this.image = angular.copy(scope[this.source]);
          if (!this.image.serving_url) {
            return;
          }
          this.width = this.width || iElement[0].clientWidth;
          this.height = this.height || iElement[0].clientHeight;
          this.sizemode = this.sizemode;
          scope.elementStyle = {};
          if (angular.isString(this.image.resolution)) {
            r = this.image.resolution.split('x');
            this.resolution = {
              width: r[0],
              height: r[1]
            };
          }
          assetRatio = this.resolution.width / this.resolution.height;
          if (this.width === 'auto' || this.height === 'auto') {
            if (angular.isNumber(this.width) && angular.isNumber(this.height)) {

            } else if (this.height === 'auto' && angular.isNumber(this.width)) {
              this.height = this.width / assetRatio;
              scope.elementStyle.height = this.height;
            } else if (this.width === 'auto' && angular.isNumber(this.height)) {
              this.width = this.height * assetRatio;
              scope.elementStyle.width = this.width;
            } else if (this.height === 'auto' && this.width === 'auto') {
              this.width = iElement[0].clientWidth;
              this.height = this.width / assetRatio;
              scope.elementStyle.height = this.height;
            } else {
              this.width = iElement[0].clientWidth;
              this.height = iElement[0].clientHeight;
            }
          }
          wrapperRatio = this.width / this.height;
          dpr = Math.ceil(window.devicePixelRatio) || 1;
          if (sizemode === 'crop') {
            if (assetRatio <= wrapperRatio) {
              servingSize = Math.round(Math.max(this.width, this.width / assetRatio));
            } else {
              servingSize = Math.round(Math.max(this.height, this.height * assetRatio));
            }
          } else {
            if (assetRatio <= wrapperRatio) {
              servingSize = Math.round(Math.max(this.height, this.height * assetRatio));
            } else {
              servingSize = Math.round(Math.max(this.width, this.width / assetRatio));
            }
          }
          servingSize = parseInt(Math.min(servingSize * dpr, this.maxSize));
          this.servingSize = servingSize;
          this.servingUrl = "" + this.image.serving_url + "=s" + (this.servingSize * this.scale);
          if (sizemode === 'crop') {
            backgroundSize = assetRatio < wrapperRatio ? "100% auto" : "auto 100%";
          } else {
            backgroundSize = assetRatio > wrapperRatio ? "100% auto" : "auto 100%";
          }
          return scope.imageStyle = {
            "background-image": "url(" + this.servingUrl + ")",
            "background-size": backgroundSize,
            "background-position": this.align
          };
        },
        post: function(scope, iElement, iAttrs, controller) {}
      };
    },
    link: function(scope, iElement, iAttrs) {}
  };
});

imagoWidgets.directive('imagoSlider', function(imagoUtils) {
  return {
    replace: true,
    templateUrl: '/imagoWidgets/slider-widget.html',
    controller: function($scope, $element, $attrs, $window) {
      var source;
      source = $attrs.source || 'assets';
      $scope.$watch(source, function(assetsData) {
        var item, _i, _len, _ref;
        if (assetsData) {
          $scope.loadedData = true;
          $scope.slideSource = [];
          for (_i = 0, _len = assetsData.length; _i < _len; _i++) {
            item = assetsData[_i];
            if (item.serving_url) {
              $scope.slideSource.push(item);
            }
          }
          if (((_ref = $scope.slideSource) != null ? _ref.length : void 0) <= 1 || !$scope.slideSource) {
            $scope.confSlider.enablearrows = false;
            $scope.confSlider.enablekeys = false;
          }
          return this.id = imagoUtils.uuid();
        }
      });
      $scope.currentIndex = 0;
      $scope.setCurrentSlideIndex = function(index) {
        return $scope.currentIndex = index;
      };
      $scope.isCurrentSlideIndex = function(index) {
        return $scope.currentIndex === index;
      };
      $scope.goPrev = function() {
        return $scope.currentIndex = $scope.currentIndex < $scope.slideSource.length - 1 ? ++$scope.currentIndex : 0;
      };
      $scope.goNext = function() {
        return $scope.currentIndex = $scope.currentIndex > 0 ? --$scope.currentIndex : $scope.slideSource.length - 1;
      };
      return angular.element($window).on('keydown', function(e) {
        if (!$scope.confSlider.enablekeys) {
          return;
        }
        switch (e.keyCode) {
          case 37:
            return $scope.$apply(function() {
              return $scope.goPrev();
            });
          case 39:
            return $scope.$apply(function() {
              return $scope.goNext();
            });
        }
      });
    },
    compile: function(tElement, tAttrs, transclude) {
      return {
        pre: function(scope, iElement, iAttrs, controller) {
          scope.confSlider = {};
          this.defaults = {
            animation: 'fade',
            sizemode: 'fit',
            current: 0,
            enablekeys: true,
            enablearrows: true,
            enablehtml: true,
            subslides: false,
            loop: true,
            noResize: false,
            current: 0,
            lazy: false,
            align: 'center center'
          };
          angular.forEach(this.defaults, function(value, key) {
            return scope.confSlider[key] = value;
          });
          angular.forEach(iAttrs, function(value, key) {
            return scope.confSlider[key] = value;
          });
          return scope.elementStyle = scope.confSlider.animation;
        }
      };
    }
  };
});

imagoWidgets.directive('imagoVideo', function(imagoUtils) {
  return {
    replace: true,
    scope: true,
    templateUrl: '/imagoWidgets/video-widget.html',
    controller: function($scope, $element, $attrs, $transclude, $window) {
      var compile, detectCodec, pad, renderVideo, resize, updateTime, videoElement;
      $scope.videoWrapper = $element[0].children[1];
      $scope.time = '00:00';
      $scope.seekTime = 0;
      $scope.volumeInput = 100;
      $scope.$watch($attrs['source'], function(video) {
        if (video && video.kind === "Video") {
          return compile(video);
        } else {
          return $scope.videoBackground = {
            "display": "none"
          };
        }
      });
      angular.element($scope.videoWrapper).bind('timeupdate', function(e) {
        return $scope.$apply(function() {
          $scope.seekTime = $scope.videoWrapper.currentTime / $scope.videoWrapper.duration * 100;
          return updateTime($scope.videoWrapper.currentTime);
        });
      });
      angular.element($window).bind('resize', function(e) {
        return $scope.$apply(function() {
          return resize();
        });
      });
      compile = function(video) {
        this.options = {};
        this.defaults = {
          autobuffer: null,
          autoplay: false,
          controls: true,
          preload: 'none',
          size: 'hd',
          align: 'left top',
          sizemode: 'fit',
          lazy: true
        };
        angular.forEach(this.defaults, function(value, key) {
          return this.options[key] = value;
        });
        angular.forEach($attrs, function(value, key) {
          return this.options[key] = value;
        });
        $scope.optionsVideo = this.options;
        if (this.options.controls) {
          $scope.controls = angular.copy($scope.optionsVideo.controls);
        }
        $scope.videoBackground = {
          "background-position": "" + this.options.align
        };
        renderVideo(video);
        videoElement(video);
        return resize();
      };
      renderVideo = function(video) {
        var dpr, height, r, width;
        console.log(video);
        dpr = this.hires ? Math.ceil(window.devicePixelRatio) || 1 : 1;
        width = $scope.optionsVideo.width || $element[0].clientWidth;
        height = $scope.optionsVideo.height || $element[0].clientHeight;
        this.serving_url = video.serving_url;
        this.serving_url += "=s" + (Math.ceil(Math.min(Math.max(width, height) * dpr, 1600)));
        if (angular.isString(video.resolution)) {
          r = video.resolution.split('x');
          $scope.optionsVideo.resolution = {
            width: r[0],
            height: r[1]
          };
        }
        $scope.videoBackground["background-image"] = "url(" + this.serving_url + ")";
        $scope.videoBackground["background-repeat"] = "no-repeat";
        $scope.videoBackground["background-size"] = "auto 100%";
        if (angular.isNumber(width)) {
          $scope.videoBackground["width"] = width;
        }
        if (angular.isNumber(height)) {
          $scope.videoBackground["height"] = height;
        }
        $scope.styleFormats = {
          "autoplay": $scope.optionsVideo["autoplay"],
          "preload": $scope.optionsVideo["preload"],
          "autobuffer": $scope.optionsVideo["autobuffer"],
          "x-webkit-airplay": 'allow',
          "webkitAllowFullscreen": 'true'
        };
        return this.id = imagoUtils.uuid();
      };
      pad = function(num) {
        if (num < 10) {
          return "0" + num;
        }
        return num;
      };
      updateTime = function(sec) {
        var calc, hours, minutes, result, seconds;
        calc = [];
        minutes = Math.floor(sec / 60);
        hours = Math.floor(sec / 3600);
        seconds = (sec === 0 ? 0 : sec % 60);
        seconds = Math.round(seconds);
        if (hours > 0) {
          calc.push(pad(hours));
        }
        calc.push(pad(minutes));
        calc.push(pad(seconds));
        result = calc.join(":");
        return $scope.time = result;
      };
      $scope.play = function() {
        $scope.videoWrapper.play();
        return $scope.optionsVideo.state = 'playing';
      };
      $scope.togglePlay = function() {
        if ($scope.optionsVideo.state === 'playing') {
          return $scope.videoWrapper.pause();
        } else {
          return $scope.videoWrapper.play();
        }
      };
      $scope.pause = function() {
        $scope.videoWrapper.pause();
        return $scope.optionsVideo.state = 'pause';
      };
      ({
        setSize: function(size) {}
      });
      $scope.toggleSize = function() {
        if ($scope.optionsVideo.size === 'hd') {
          return $scope.optionsVideo.size = 'sd';
        } else {
          return $scope.optionsVideo.size = 'hd';
        }
      };
      $scope.seek = function(e) {
        var seek;
        seek = parseFloat(e / 100);
        $scope.seekTime = parseFloat($scope.videoWrapper.duration * seek);
        return $scope.videoWrapper.currentTime = angular.copy($scope.seekTime);
      };
      $scope.onVolumeChange = function(e) {
        return $scope.videoWrapper.volume = parseFloat(e / 100);
      };
      $scope.fullScreen = function() {
        if ($scope.videoWrapper.requestFullscreen) {
          return $scope.videoWrapper.requestFullscreen();
        } else if ($scope.videoWrapper.webkitRequestFullscreen) {
          return $scope.videoWrapper.webkitRequestFullscreen();
        } else if ($scope.videoWrapper.mozRequestFullScreen) {
          return $scope.videoWrapper.mozRequestFullScreen();
        } else if ($scope.videoWrapper.msRequestFullscreen) {
          return $scope.videoWrapper.msRequestFullscreen();
        }
      };
      resize = function() {
        var assetRatio, height, width, wrapperRatio;
        if (!$scope.optionsVideo) {
          return;
        }
        assetRatio = $scope.optionsVideo.resolution.width / $scope.optionsVideo.resolution.height;
        if ($scope.optionsVideo.sizemode === "crop") {
          width = $element[0].clientWidth;
          height = $element[0].clientHeight;
          wrapperRatio = width / height;
          if (assetRatio < wrapperRatio) {
            if (imagoUtils.isiOS()) {
              $scope.styleFormats["width"] = "100%";
              $scope.styleFormats["height"] = "100%";
            }
            if ($scope.optionsVideo.align === "center center") {
              $scope.styleFormats["top"] = "0";
              $scope.styleFormats["left"] = "0";
            } else {
              $scope.styleFormats["width"] = "100%";
              $scope.styleFormats["height"] = "auto";
            }
            if ($scope.optionsVideo.align === "center center") {
              $scope.styleFormats["top"] = "50%";
              $scope.styleFormats["left"] = "auto";
              $scope.styleFormats["margin-top"] = "-" + (width / assetRatio / 2) + "px";
              $scope.styleFormats["margin-left"] = "0px";
            }
            $scope.videoBackground["background-size"] = "100% auto";
            return $scope.videoBackground["background-position"] = $scope.optionsVideo.align;
          } else {
            if (imagoUtils.isiOS()) {
              $scope.styleFormats["width"] = "100%";
              $scope.styleFormats["height"] = "100%";
            }
            if ($scope.optionsVideo.align === "center center") {
              $scope.styleFormats["top"] = "0";
              $scope.styleFormats["left"] = "0";
            } else {
              $scope.styleFormats["width"] = "auto";
              $scope.styleFormats["height"] = "100%";
            }
            if ($scope.optionsVideo.align === "center center") {
              $scope.styleFormats["top"] = "auto";
              $scope.styleFormats["left"] = "50%";
              $scope.styleFormats["margin-top"] = "0px";
              $scope.styleFormats["margin-left"] = "-" + (height * assetRatio / 2) + "px";
            }
            $scope.videoBackground["background-size"] = "auto 100%";
            return $scope.videoBackground["background-position"] = $scope.optionsVideo.align;
          }
        } else {
          width = $element[0].clientWidth;
          height = $element[0].clientHeight;
          wrapperRatio = width / height;
          if (assetRatio > wrapperRatio) {
            $scope.styleFormats["width"] = '100%';
            $scope.styleFormats["height"] = imagoUtils.isiOS() ? '100%' : 'auto';
            $scope.videoBackground["background-size"] = '100% auto';
            $scope.videoBackground["background-position"] = $scope.optionsVideo.align;
            $scope.videoBackground["width"] = "" + width + "px";
            return $scope.videoBackground["height"] = "" + (parseInt(width / assetRatio, 10)) + "px";
          } else {
            $scope.styleFormats["width"] = imagoUtils.isiOS() ? '100%' : 'auto';
            $scope.styleFormats["height"] = '100%';
            $scope.videoBackground["background-size"] = 'auto 100%';
            $scope.videoBackground["background-position"] = $scope.optionsVideo.align;
            $scope.videoBackground["width"] = "" + (parseInt(height * assetRatio, 10)) + "px";
            return $scope.videoBackground["height"] = "" + height + "px";
          }
        }
      };
      videoElement = function(video) {
        var codec, format, i, result, _i, _len, _ref, _results;
        $scope.videoFormats = [];
        this.codecs = ['mp4', 'webm'];
        codec = detectCodec();
        video.formats.sort(function(a, b) {
          return b.height - a.height;
        });
        _ref = video.formats;
        _results = [];
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          format = _ref[i];
          if (codec !== format.codec) {
            continue;
          }
          _results.push($scope.videoFormats.push(result = {
            "src": "http://" + tenant + ".imagoapp.com/assets/api/play_redirect?uuid=" + video.id + "&codec=" + format.codec + "&quality=hd&max_size=" + format.size,
            "size": format.size,
            "codec": format.codec,
            "type": "video/" + codec
          }));
        }
        return _results;
      };
      return detectCodec = function() {
        var codecs, key, tag, value;
        tag = document.createElement('video');
        if (!tag.canPlayType) {
          return;
        }
        codecs = {
          mp4: 'video/mp4; codecs="mp4v.20.8"',
          mp4: 'video/mp4; codecs="avc1.42E01E"',
          mp4: 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"',
          webm: 'video/webm; codecs="vp8, vorbis"',
          ogg: 'video/ogg; codecs="theora"'
        };
        for (key in codecs) {
          value = codecs[key];
          if (tag.canPlayType(value)) {
            return key;
          }
        }
      };
    }
  };
});

imagoWidgets.factory('imagoPanel', function($http, imagoUtils, $q, $location) {
  return {
    search: function(query) {
      var params;
      params = this.objListToDict(query);
      return $http.post(this.getSearchUrl(), angular.toJson(params));
    },
    getData: function(query) {
      if (!query) {
        query = $location.$$path;
      }
      if (!query) {
        return console.log("Panel: query is empty, aborting " + query);
      }
      this.query = query;
      if (angular.isString(query)) {
        this.query = [
          {
            path: query
          }
        ];
      }
      this.query = imagoUtils.toArray(this.query);
      this.promises = [];
      this.data = [];
      angular.forEach(this.query, (function(_this) {
        return function(value) {
          return _this.promises.push(_this.search(value).success(function(data) {
            var result;
            if (data.length === 1 && data[0].kind === 'Collection') {
              return _this.data.push(data[0]);
            } else {
              result = {
                items: data,
                count: data.length
              };
              return _this.data.push(result);
            }
          }));
        };
      })(this));
      return $q.all(this.promises).then(((function(_this) {
        return function(response) {
          return _this.data;
        };
      })(this)));
    },
    objListToDict: function(obj_or_list) {
      var elem, key, querydict, value, _i, _j, _len, _len1, _ref;
      querydict = {};
      if (angular.isArray(obj_or_list)) {
        for (_i = 0, _len = obj_or_list.length; _i < _len; _i++) {
          elem = obj_or_list[_i];
          for (key in elem) {
            value = elem[key];
            querydict[key] || (querydict[key] = []);
            querydict[key].push(value);
          }
        }
      } else {
        for (key in obj_or_list) {
          value = obj_or_list[key];
          querydict[key] = angular.isArray(value) ? value : [value];
        }
      }
      _ref = ['page', 'pagesize'];
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        key = _ref[_j];
        if (querydict.hasOwnProperty(key)) {
          querydict[key] = querydict[key][0];
        }
      }
      return querydict;
    },
    getMeta: function(field) {},
    getSearchUrl: function() {
      if (data === 'online' && debug) {
        return "http://" + tenant + ".imagoapp.com/api/v3/search";
      } else {
        return "/api/v3/search";
      }
    }
  };
});

imagoWidgets.factory('imagoUtils', function() {
  var CURRENCY_MAPPING, KEYS, SYMBOLS, alphanum;
  KEYS = {
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
  };
  SYMBOLS = {
    EUR: '&#128;',
    USD: '&#36;',
    SEK: 'SEK',
    YEN: '&#165;',
    GBP: '&#163;',
    GENERIC: '&#164;'
  };
  CURRENCY_MAPPING = {
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
  };
  return {
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
      var cookie, _i, _len, _ref;
      if (!value) {
        _ref = document.cookie.split(';');
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          cookie = _ref[_i];
          if (cookie.indexOf(name) === 1) {
            return cookie.split('=')[1];
          }
        }
        return false;
      }
      return document.cookie = "" + name + "=" + value + "; path=/";
    },
    sha: function() {
      var i, possible, text, _i;
      text = '';
      possible = 'abcdefghijklmnopqrstuvwxyz0123456789';
      for (i = _i = 0; _i <= 56; i = ++_i) {
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
      var facet, filter, key, query, value, _i, _len, _ref;
      query = [];
      _ref = url.split('+');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        filter = _ref[_i];
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
    isOpera: function() {
      return !!navigator.userAgent.match(/Presto/i);
    },
    isSafari: function() {
      return !!navigator.userAgent.match(/Safari/i) && !this.isChrome();
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
      return "" + ints + "." + floats;
    },
    toPrice: function(value, currency) {
      var price, symbol;
      price = this.toFloat(value).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
      symbol = this.getCurrencySymbol(currency);
      return "" + symbol + " " + price;
    },
    isEmail: function(value) {
      var pattern;
      pattern = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return !!value.match(pattern);
    },
    getAssetKind: function(id) {
      var kind;
      if (id.indexOf('Collection-') === 0) {
        kind = 'Collection';
      } else if (id.indexOf('Proxy-') === 0) {
        kind = 'Proxy';
      } else if (id.indexOf('Order-') === 0) {
        kind = 'Order';
      } else if (id.indexOf('Generic') === 0) {
        kind = 'Generic';
      } else if (id.match(/[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}/)) {
        kind = 'Image';
      } else if (id.match(/[0-9a-z]{56}/)) {
        kind = 'Video';
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
      var _ref;
      return (_ref = value != null ? value.toLowerCase() : void 0) === 'usa' || _ref === 'united states' || _ref === 'united states of america';
    },
    getCurrencySymbol: function(currency) {
      return SYMBOLS[currency] || SYMBOLS.GENERIC;
    },
    getCurrency: function(country) {
      return CURRENCY_MAPPING[country];
    },
    toArray: function(elem) {
      if (angular.isArray(elem)) {
        return elem;
      } else {
        return [elem];
      }
    }
  };
});

imagoWidgets.filter("meta", function() {
  return function(input) {
    var resources;
    if (!input) {
      return;
    }
    resources = input.split('.');
    if (resources.length !== 2) {
      console.log('Not enough data for meta');
      return;
    }
    if (!this[resources[0]]) {
      return;
    }
    if (this[resources[0]].meta[resources[1]].value.type) {
      return this[resources[0]].meta[resources[1]].value.value;
    } else {
      return this[resources[0]].meta[resources[1]].value;
    }
  };
});
