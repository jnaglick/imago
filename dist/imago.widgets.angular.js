angular.module("ImagoWidgetsTemplates", []).run(["$templateCache", function($templateCache) {$templateCache.put("/imagoWidgets/image-widget.html","<div ng-style=\"elementStyle\" ng-class=\"status\" class=\"imagoimage imagowrapper\"><div ng-style=\"imageStyle\" class=\"image\"></div><div ng-hide=\"status === \'loaded\'\" class=\"loading\"><div class=\"spin\"></div><div class=\"spin2\"></div></div></div>");
$templateCache.put("/imagoWidgets/slider-widget.html","<div ng-class=\"elementStyle\"><div ng-transclude=\"ng-transclude\"></div><div ng-style=\"sliderStyle\" ng-swipe-left=\"goPrev()\" ng-swipe-right=\"goNext()\" class=\"nexslider\"><div ng-show=\"confSlider.enablearrows &amp;&amp; loadedData\" ng-click=\"goPrev()\" class=\"prev\"></div><div ng-show=\"confSlider.enablearrows &amp;&amp; loadedData\" ng-click=\"goNext()\" class=\"next\"></div><div ng-class=\"{\'active\':isCurrentSlideIndex($index)}\" ng-repeat=\"slide in slideSource\" ng-hide=\"!isCurrentSlideIndex($index)\" class=\"slide\"><div imago-image=\"imago-image\" source=\"slide\" sizemode=\"{{$parent.confSlider.sizemode}}\"></div></div></div></div>");
$templateCache.put("/imagoWidgets/video-widget.html","<div ng-style=\"wrapperStyle\" ng-click=\"videoActive = true\" class=\"imagovideo imagowrapper {{optionsVideo.align}} {{optionsVideo.size}} {{optionsVideo.sizemode}}\"><a ng-click=\"togglePlay()\" ng-hide=\"optionsVideo.playing\" class=\"playbig fa fa-play\"></a><video ng-style=\"videoStyle\" ng-show=\"videoActive\"><source ng-repeat=\"format in videoFormats\" src=\"{{format.src}}\" data-size=\"{{format.size}}\" data-codec=\"{{format.codec}}\" type=\"{{format.type}}\"/></video><div ng-if=\"controls\" class=\"controls\"><a ng-click=\"play()\" ng-hide=\"optionsVideo.playing\" class=\"play fa fa-play\"></a><a ng-click=\"pause()\" ng-show=\"optionsVideo.playing\" class=\"pause fa fa-pause\"></a><span class=\"time\">{{time}}</span><span class=\"seekbar\"><input type=\"range\" ng-model=\"seekTime\" ng-change=\"seek(seekTime)\" class=\"seek\"/></span><a ng-click=\"toggleSize()\" class=\"size\">hd</a><span class=\"volume\"><span ng-click=\"volumeUp()\" class=\"fa fa-volume-up icon-volume-up\"></span><input type=\"range\" ng-model=\"volumeInput\" ng-change=\"onVolumeChange(volumeInput)\"/><span ng-click=\"volumeDown()\" class=\"fa fa-volume-down icon-volume-down\"></span></span><a ng-click=\"fullScreen()\" class=\"fullscreen fa fa-expand\"></a><a class=\"screen fa fa-compress\"></a></div></div>");}]);
var App;

App = (function() {
  function App() {
    return ['ImagoWidgetsTemplates'];
  }

  return App;

})();

angular.module('imago.widgets.angular', App());

var imagoImage;

imagoImage = (function() {
  function imagoImage() {
    return {
      replace: true,
      scope: true,
      templateUrl: '/imagoWidgets/image-widget.html',
      controller: function($scope, $element, $attrs, $transclude, $window, $log, $q, $timeout) {
        var render;
        this.defaults = {
          align: 'center center',
          sizemode: 'fit',
          hires: true,
          scale: 1,
          lazy: true,
          maxsize: 2560,
          mediasize: false,
          width: '',
          height: '',
          responsive: true
        };
        angular.forEach(this.defaults, (function(_this) {
          return function(value, key) {
            return _this[key] = value;
          };
        })(this));
        angular.forEach($attrs, (function(_this) {
          return function(value, key) {
            return _this[key] = value;
          };
        })(this));
        if ($attrs['no-resize']) {
          $log.log('@noResize depricated will be removed soon, use responsive: false');
          this.responsive = false;
        }
        $scope.$watch($attrs['source'], (function(_this) {
          return function(data) {
            if (!data) {
              return;
            }
            _this.data = data;
            return render(_this.data);
          };
        })(this));
        render = (function(_this) {
          return function(data) {
            var dpr, img, r, servingSize, servingUrl, wrapperRatio;
            if (!data.serving_url) {
              return;
            }
            if (!$scope.elementStyle) {
              $scope.elementStyle = {};
            }
            if (angular.isString(data.resolution)) {
              r = data.resolution.split('x');
              _this.resolution = {
                width: r[0],
                height: r[1]
              };
              _this.assetRatio = r[0] / r[1];
            }
            console.log('@assetRatio', _this.assetRatio);
            if (angular.isNumber(_this.width) && angular.isNumber(_this.height)) {

            } else if (_this.height === 'auto' && angular.isNumber(_this.width)) {
              _this.height = _this.width / _this.assetRatio;
              $scope.elementStyle.height = parseInt(_this.height);
            } else if (_this.width === 'auto' && angular.isNumber(_this.height)) {
              _this.width = _this.height * _this.assetRatio;
              $scope.elementStyle.width = parseInt(_this.width);
            } else if (_this.width === 'auto' && _this.height === 'auto') {
              _this.width = $element[0].clientWidth;
              _this.height = _this.width / _this.assetRatio;
              $scope.elementStyle.height = parseInt(_this.height);
            } else {
              _this.width = $element[0].clientWidth;
              _this.height = $element[0].clientHeight;
            }
            $scope.status = 'preloading';
            wrapperRatio = _this.width / _this.height;
            dpr = _this.hires ? Math.ceil(window.devicePixelRatio) || 1 : 1;
            if (_this.sizemode === 'crop') {
              if (_this.assetRatio <= wrapperRatio) {
                servingSize = Math.round(Math.max(_this.width, _this.width / _this.assetRatio));
              } else {
                servingSize = Math.round(Math.max(_this.height, _this.height * _this.assetRatio));
              }
            } else {
              if (_this.assetRatio <= wrapperRatio) {
                servingSize = Math.round(Math.max(_this.height, _this.height * _this.assetRatio));
              } else {
                servingSize = Math.round(Math.max(_this.width, _this.width / _this.assetRatio));
              }
            }
            servingSize = parseInt(Math.min(servingSize * dpr, _this.maxsize), 10);
            if (servingSize === _this.servingSize) {
              console.log('same size exit');
              $scope.status = 'loaded';
              return;
            }
            servingUrl = "" + data.serving_url + "=s" + (servingSize * _this.scale);
            _this.servingSize = servingSize;
            $scope.imageStyle = {};
            if (!_this.responsive) {
              $scope.imageStyle['width'] = "" + (parseInt(_this.width, 10)) + "px";
              $scope.imageStyle['height'] = "" + (parseInt(_this.height, 10)) + "px";
            }
            img = angular.element('<img>');
            img.on('load', function(e) {
              $scope.imageStyle['background-image'] = "url(" + servingUrl + ")";
              $scope.imageStyle['background-size'] = $scope.calcMediaSize();
              $scope.imageStyle['background-position'] = _this.align;
              $scope.imageStyle['display'] = 'inline-block';
              $scope.status = 'loaded';
              return $scope.$apply();
            });
            return img[0].src = servingUrl;
          };
        })(this);
        $scope.onResize = (function(_this) {
          return function() {
            return $scope.imageStyle['background-size'] = $scope.calcMediaSize();
          };
        })(this);
        $scope.calcMediaSize = (function(_this) {
          return function() {
            var wrapperRatio;
            _this.width = $element[0].clientWidth || _this.width;
            _this.height = $element[0].clientHeight || _this.height;
            if (!(_this.width && _this.height)) {
              return;
            }
            wrapperRatio = _this.width / _this.height;
            if (_this.sizemode === 'crop') {
              $log.log('@sizemode crop', _this.assetRatio, wrapperRatio);
              if (_this.assetRatio < wrapperRatio) {
                return "100% auto";
              } else {
                return "auto 100%";
              }
            } else {
              $log.log('@sizemode fit', _this.assetRatio, wrapperRatio);
              if (_this.assetRatio > wrapperRatio) {
                return "100% auto";
              } else {
                return "auto 100%";
              }
            }
          };
        })(this);
        $scope.$on('resizelimit', (function(_this) {
          return function() {
            if (_this.responsive) {
              return $scope.onResize;
            }
          };
        })(this));
        $scope.$on('resizestop', (function(_this) {
          return function() {
            if (_this.responsive) {
              return render(_this.data);
            }
          };
        })(this));
        return $scope.$on('scrollstop', (function(_this) {
          return function() {
            if (_this.lazy) {
              return render(_this.data);
            }
          };
        })(this));
      }
    };
  }

  return imagoImage;

})();

angular.module('imago.widgets.angular').directive('imagoImage', [imagoImage]);

var imagoSlider;

imagoSlider = (function() {
  function imagoSlider() {
    return {
      replace: true,
      scope: true,
      transclude: true,
      templateUrl: '/imagoWidgets/slider-widget.html',
      controller: function($scope, $element, $attrs, $window, imagoPanel) {
        var prepareSlides, source;
        source = $attrs.source || 'assets';
        console.log('is it an array: ', angular.isArray(source));
        $scope.$watch(source, function(assetsData) {
          if (assetsData) {
            if (!angular.isArray(assetsData)) {
              return imagoPanel.getData(assetsData.path).then(function(response) {
                assetsData = response[0].items;
                return prepareSlides(assetsData);
              });
            } else {
              return prepareSlides(assetsData);
            }
          }
        });
        prepareSlides = function(assetsData) {
          var item, _i, _len, _ref;
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
          this.id = imagoUtils.uuid();
          return $scope.currentIndex = 0;
        };
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
        $scope.getLast = function() {
          return $scope.slideSource.length - 1;
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
  }

  return imagoSlider;

})();

angular.module('imago.widgets.angular').directive('imagoSlider', [imagoSlider]);

var imagoVideo;

imagoVideo = (function() {
  function imagoVideo() {
    return {
      replace: true,
      scope: true,
      templateUrl: '/imagoWidgets/video-widget.html',
      controller: function($scope, $element, $attrs, $transclude, $window) {
        var detectCodec, loadSources, pad, render, renderVideo, resize, setSize, updateTime;
        this.defaults = {
          autobuffer: null,
          autoplay: false,
          controls: true,
          preload: 'none',
          size: 'hd',
          align: 'left top',
          sizemode: 'fit',
          lazy: true,
          width: '',
          height: ''
        };
        angular.forEach(this.defaults, (function(_this) {
          return function(value, key) {
            return _this[key] = value;
          };
        })(this));
        angular.forEach($attrs, (function(_this) {
          return function(value, key) {
            return _this[key] = value;
          };
        })(this));
        this.videoEl = $element[0].children[1];
        $scope.time = '00:00';
        $scope.seekTime = 0;
        $scope.volumeInput = 100;
        $scope.$watch($attrs['source'], function(data) {
          if (!data) {
            return;
          }
          this.data = data;
          return render(this.data);
        });
        angular.element(this.videoEl).bind('timeupdate', (function(_this) {
          return function(e) {
            $scope.seekTime = _this.videoEl.currentTime / _this.videoEl.duration * 100;
            updateTime(_this.videoEl.currentTime);
            return $scope.$apply();
          };
        })(this));
        angular.element(this.videoEl).bind('ended', (function(_this) {
          return function(e) {
            $scope.optionsVideo.playing = false;
            return $scope.$apply();
          };
        })(this));
        render = (function(_this) {
          return function(data) {
            var r;
            if (!$scope.wrapperStyle) {
              $scope.wrapperStyle = {};
            }
            if (angular.isString(data.resolution)) {
              r = data.resolution.split('x');
              _this.resolution = {
                width: r[0],
                height: r[1]
              };
              _this.assetRatio = r[0] / r[1];
            }
            if (_this.controls) {
              $scope.controls = angular.copy(_this.controls);
            }
            if (angular.isNumber(_this.width) && angular.isNumber(_this.height)) {

            } else if (_this.height === 'auto' && angular.isNumber(_this.width)) {
              _this.height = _this.width / _this.assetRatio;
              $scope.wrapperStyle.height = parseInt(_this.height);
            } else if (_this.width === 'auto' && angular.isNumber(_this.height)) {
              _this.width = _this.height * _this.assetRatio;
              $scope.wrapperStyle.width = parseInt(_this.width);
            } else if (_this.width === 'auto' && _this.height === 'auto') {
              _this.width = $element[0].clientWidth;
              _this.height = _this.width / _this.assetRatio;
              $scope.wrapperStyle.height = parseInt(_this.height);
            } else {
              _this.width = $element[0].clientWidth;
              _this.height = $element[0].clientHeight;
            }
            $scope.wrapperStyle['background-position'] = "" + _this.align;
            $scope.optionsVideo = _this;
            renderVideo(data);
            loadSources(data);
            return resize();
          };
        })(this);
        renderVideo = (function(_this) {
          return function(data) {
            var dpr;
            dpr = _this.hires ? Math.ceil(window.devicePixelRatio) || 1 : 1;
            _this.serving_url = data.serving_url;
            _this.serving_url += "=s" + (Math.ceil(Math.min(Math.max(_this.width, _this.height) * dpr, 1600)));
            $scope.wrapperStyle["background-image"] = "url(" + _this.serving_url + ")";
            $scope.wrapperStyle["background-repeat"] = "no-repeat";
            $scope.wrapperStyle["background-size"] = "auto 100%";
            if (angular.isNumber(_this.width)) {
              $scope.wrapperStyle["width"] = parseInt(_this.width);
            }
            if (angular.isNumber(_this.width)) {
              $scope.wrapperStyle["height"] = parseInt(_this.height);
            }
            return $scope.videoStyle = {
              "autoplay": $scope.optionsVideo["autoplay"],
              "preload": $scope.optionsVideo["preload"],
              "autobuffer": $scope.optionsVideo["autobuffer"],
              "x-webkit-airplay": 'allow',
              "webkitAllowFullscreen": 'true'
            };
          };
        })(this);
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
        $scope.play = (function(_this) {
          return function() {
            _this.videoEl.play();
            return $scope.optionsVideo.playing = true;
          };
        })(this);
        $scope.togglePlay = (function(_this) {
          return function() {
            if (!_this.videoEl.paused) {
              return $scope.pause();
            } else {
              return $scope.play();
            }
          };
        })(this);
        $scope.pause = (function(_this) {
          return function() {
            _this.videoEl.pause();
            return $scope.optionsVideo.playing = false;
          };
        })(this);
        setSize = function(size) {};
        $scope.toggleSize = function() {
          if ($scope.optionsVideo.size === 'hd') {
            $scope.optionsVideo.size = 'sd';
          } else {
            $scope.optionsVideo.size = 'hd';
          }
          return $scope.videoFormats.reverse();
        };
        $scope.seek = (function(_this) {
          return function(e) {
            var seek;
            seek = parseFloat(e / 100);
            $scope.seekTime = parseFloat(_this.videoEl.duration * seek);
            return _this.videoEl.currentTime = angular.copy($scope.seekTime);
          };
        })(this);
        $scope.onVolumeChange = (function(_this) {
          return function(e) {
            return _this.videoEl.volume = parseFloat(e / 100);
          };
        })(this);
        $scope.volumeDown = (function(_this) {
          return function() {
            _this.videoEl.volume = 0;
            return $scope.volumeInput = 0;
          };
        })(this);
        $scope.volumeUp = (function(_this) {
          return function() {
            _this.videoEl.volume = 1;
            return $scope.volumeInput = 100;
          };
        })(this);
        $scope.fullScreen = (function(_this) {
          return function() {
            if (_this.videoEl.requestFullscreen) {
              return _this.videoEl.requestFullscreen();
            } else if (_this.videoEl.webkitRequestFullscreen) {
              return _this.videoEl.webkitRequestFullscreen();
            } else if (_this.videoEl.mozRequestFullScreen) {
              return _this.videoEl.mozRequestFullScreen();
            } else if (_this.videoEl.msRequestFullscreen) {
              return _this.videoEl.msRequestFullscreen();
            }
          };
        })(this);
        resize = (function(_this) {
          return function() {
            var height, vs, width, wrapperRatio, ws;
            if (!$scope.optionsVideo) {
              return;
            }
            vs = $scope.videoStyle;
            ws = $scope.wrapperStyle;
            if (_this.sizemode === 'crop') {
              width = $element[0].clientWidth;
              height = $element[0].clientHeight;
              wrapperRatio = width / height;
              if (_this.assetRatio < wrapperRatio) {
                if (imagoUtils.isiOS()) {
                  vs.width = '100%';
                  vs.height = '100%';
                }
                if (_this.align === 'center center') {
                  vs.top = '0';
                  vs.left = '0';
                } else {
                  vs.width = '100%';
                  vs.height = 'auto';
                }
                if (_this.align === 'center center') {
                  vs.top = '50%';
                  vs.left = 'auto';
                  vs.marginTop = "-" + (_this.width / _this.assetRatio / 2) + "px";
                  vs.marginLeft = '0px';
                }
                ws.backgroundSize = '100% auto';
                return ws.backgroundPosition = _this.align;
              } else {
                if (imagoUtils.isiOS()) {
                  vs.width = '100%';
                  vs.height = '100%';
                }
                if (_this.align === 'center center') {
                  vs.top = '0';
                  vs.left = '0';
                } else {
                  vs.width = 'auto';
                  vs.height = '100%';
                }
                if (_this.align === 'center center') {
                  vs.top = 'auto';
                  vs.left = '50%';
                  vs.marginTop = '0px';
                  vs.marginLeft = "-" + (parseInt(_this.height * _this.assetRatio / 2, 10)) + "px";
                }
                ws.backgroundSize = 'auto 100%';
                return ws.backgroundPosition = _this.align;
              }
            } else if (_this.sizemode === 'fit') {
              width = $element[0].clientWidth;
              height = $element[0].clientHeight;
              wrapperRatio = width / height;
              if (_this.assetRatio > wrapperRatio) {
                vs.width = '100%';
                vs.height = imagoUtils.isiOS() ? '100%' : 'auto';
                ws.backgroundSize = '100% auto';
                return ws.backgroundPosition = _this.align;
              } else {
                vs.width = imagoUtils.isiOS() ? '100%' : 'auto';
                vs.height = '100%';
                ws.backgroundSize = 'auto 100%';
                return ws.backgroundPosition = _this.align;
              }
            }
          };
        })(this);
        loadSources = function(data) {
          var codec, format, i, result, _i, _len, _ref, _results;
          $scope.videoFormats = [];
          this.codecs = ['mp4', 'webm'];
          codec = detectCodec();
          data.formats.sort(function(a, b) {
            return b.height - a.height;
          });
          _ref = data.formats;
          _results = [];
          for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
            format = _ref[i];
            if (codec !== format.codec) {
              continue;
            }
            _results.push($scope.videoFormats.push(result = {
              "src": "http://" + tenant + ".imagoapp.com/assets/api/play_redirect?uuid=" + data.id + "&codec=" + format.codec + "&quality=hd&max_size=" + format.size,
              "size": format.size,
              "codec": format.codec,
              "type": "video/" + codec
            }));
          }
          return _results;
        };
        detectCodec = function() {
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
        return $scope.$on('resizelimit', (function(_this) {
          return function() {
            return resize();
          };
        })(this));
      }
    };
  }

  return imagoVideo;

})();

angular.module('imago.widgets.angular').directive('imagoVideo', [imagoVideo]);

angular.module('imago.widgets.angular').factory('imagoPanel', function($http, imagoUtils, $q, $location) {
  return {
    search: function(query) {
      var params;
      params = this.objListToDict(query);
      return $http.post(this.getSearchUrl(), angular.toJson(params));
    },
    getData: function(query) {
      var data, promises;
      if (!query) {
        query = $location.$$path;
      }
      if (!query) {
        return console.log("Panel: query is empty, aborting " + query);
      }
      if (angular.isString(query)) {
        query = [
          {
            path: query
          }
        ];
      }
      query = imagoUtils.toArray(query);
      promises = [];
      data = [];
      angular.forEach(query, (function(_this) {
        return function(value) {
          return promises.push(_this.search(value).success(function(response) {
            var result;
            if (response.length === 1 && response[0].kind === 'Collection') {
              return data.push(response[0]);
            } else {
              result = {
                items: response,
                count: response.length
              };
              return data.push(result);
            }
          }));
        };
      })(this));
      return $q.all(promises).then(((function(_this) {
        return function(response) {
          return data;
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

angular.module('imago.widgets.angular').factory('imagoUtils', function() {
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
    },
    getData: function(asset, attribute) {
      if (!asset.meta[attribute]) {
        return console.log("This asset does not contain a " + attribute + " attribute");
      }
      return asset.meta[attribute].value;
    }
  };
});

angular.module('imago.widgets.angular').filter("meta", function() {
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
