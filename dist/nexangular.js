angular.module("ImagoTemplates", []).run(["$templateCache", function($templateCache) {$templateCache.put("/NexAngular/image-widget.html","<div ng-style=\"elementStyle\" ng-class=\"{loaded: !!imageStyle}\" class=\"imagoimage\"><div ng-style=\"imageStyle\" class=\"image\"></div></div>");
$templateCache.put("/NexAngular/slider-widget.html","<div ng-class=\"elementStyle\"><div ng-style=\"sliderStyle\" ng-swipe-left=\"goPrev()\" ng-swipe-right=\"goNext()\" class=\"nexslider\"><div ng-show=\"confSlider.enablearrows &amp;&amp; loadedData\" ng-click=\"goPrev()\" class=\"prev\"></div><div ng-show=\"confSlider.enablearrows &amp;&amp; loadedData\" ng-click=\"goNext()\" class=\"next\"></div><div ng-class=\"{\'active\':isCurrentSlideIndex($index)}\" ng-repeat=\"slide in slideSource\" ng-hide=\"!isCurrentSlideIndex($index)\" class=\"slide\"><div imago-image=\"imago-image\" source=\"slide\" sizemode=\"{{$parent.confSlider.sizemode}}\"></div></div></div></div>");
$templateCache.put("/NexAngular/video-widget.html","<div ng-style=\"videoBackground\" ng-click=\"videoActive = true\" class=\"imagovideo imagowrapper {{optionsVideo.align}} {{optionsVideo.size}} {{optionsVideo.sizemode}}\"><a ng-click=\"togglePlay()\" class=\"playbig icon-play\"></a><video ng-style=\"styleFormats\" ng-show=\"videoActive\"><source ng-repeat=\"format in videoFormats\" src=\"{{format.src}}\" data-size=\"{{format.size}}\" data-codec=\"{{format.codec}}\" type=\"{{format.type}}\"/></video><div ng-if=\"controls\" class=\"controls\"><a ng-click=\"play()\" class=\"play icon-play\"></a><a ng-click=\"pause()\" class=\"pause icon-pause\"></a><span class=\"time\">{{time}}</span><span class=\"seekbar\"><input type=\"range\" ng-model=\"seekTime\" ng-change=\"seek(seekTime)\" class=\"seek\"/></span><a ng-click=\"toggleSize()\" class=\"size\">hd</a><span class=\"volume\"><input type=\"range\" ng-model=\"volumeInput\" ng-change=\"onVolumeChange(volumeInput)\"/></span><a ng-click=\"fullScreen()\" class=\"fullscreen icon-resize-full\"></a><a class=\"screen icon-resize-small\"></a></div></div>");}]);
imago.widgets.angular = angular.module('imago.widgets.angular', ["ImagoTemplates"]);

imago.widgets.angular.directive('imagoImage', function() {
  return {
    replace: true,
    templateUrl: '/app/directives/views/image-widget.html',
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

imago.widgets.angular.directive('imagoSlider', function(imagoUtils) {
  return {
    replace: true,
    templateUrl: '/app/directives/views/slider-widget.html',
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

imago.widgets.angular.directive('imagoVideo', function(imagoUtils) {
  return {
    replace: true,
    scope: true,
    templateUrl: '/app/directives/views/video-widget.html',
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
