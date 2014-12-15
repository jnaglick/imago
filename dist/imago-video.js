var imagoControls;

imagoControls = (function() {
  function imagoControls() {
    return {
      replace: true,
      scope: true,
      require: '^imagoVideo',
      templateUrl: '/imago/controlsVideo.html',
      controller: function($scope) {
        var videoPlayer;
        videoPlayer = angular.element($scope.player);
        $scope.currentTime = 0;
        videoPlayer.bind('loadeddata', function(e) {
          $scope.duration = parseInt(e.target.duration);
          return $scope.$apply();
        });
        videoPlayer.bind('timeupdate', function(e) {
          $scope.currentTime = e.target.currentTime;
          return $scope.$apply();
        });
        return videoPlayer.bind('seeking', function(e) {
          $scope.currentTime = e.target.currentTime;
          return $scope.$apply();
        });
      },
      link: function(scope, element, attrs) {
        scope.seek = function(value) {
          return scope.player.currentTime = value;
        };
        scope.onVolumeChange = (function(_this) {
          return function(e) {
            return scope.player.volume = parseFloat(e / 100);
          };
        })(this);
        scope.volumeDown = (function(_this) {
          return function() {
            scope.player.volume = 0;
            return scope.volumeInput = 0;
          };
        })(this);
        scope.volumeUp = (function(_this) {
          return function() {
            scope.player.volume = 1;
            return scope.volumeInput = 100;
          };
        })(this);
        scope.fullScreen = (function(_this) {
          return function() {
            if (scope.player.requestFullscreen) {
              return scope.player.requestFullscreen();
            } else if (scope.player.webkitRequestFullscreen) {
              return scope.player.webkitRequestFullscreen();
            } else if (scope.player.mozRequestFullScreen) {
              return scope.player.mozRequestFullScreen();
            } else if (scope.player.msRequestFullscreen) {
              return scope.player.msRequestFullscreen();
            }
          };
        })(this);
        element.bind('mouseup', function(e) {
          return e.stopPropagation();
        });
        return element.bind('mousedown', function(e) {
          return e.stopPropagation();
        });
      }
    };
  }

  return imagoControls;

})();

angular.module('imago').directive('imagoControls', [imagoControls]);

var imagoVideo;

imagoVideo = (function() {
  function imagoVideo($q, $timeout, $window, imagoUtils) {
    return {
      scope: true,
      templateUrl: '/imago/imagoVideo.html',
      controller: function($scope, $element, $attrs, $transclude) {
        $scope.player = $element.find('video')[0];
        $scope.loading = true;
        angular.element($scope.player).bind('ended', function(e) {
          $scope.player.currentTime = 0;
          return $scope.isPlaying = false;
        });
        angular.element($scope.player).bind('loadeddata', function() {
          $scope.hasPlayed = true;
          return angular.element($scope.player).unbind('loadeddata');
        });
        return angular.element($scope.player).bind('play', function() {
          return $scope.isPlaying = true;
        });
      },
      link: function(scope, element, attrs) {
        var detectCodec, key, loadFormats, onResize, opts, preload, render, self, setPlayerAttrs, styleVideo, styleWrapper, value;
        self = {
          visible: false
        };
        opts = {
          autobuffer: null,
          autoplay: false,
          controls: true,
          preload: 'none',
          size: 'hd',
          align: 'center center',
          sizemode: 'fit',
          lazy: true,
          hires: true,
          loop: false,
          width: '',
          height: ''
        };
        for (key in attrs) {
          value = attrs[key];
          if (value === 'true' || value === 'false') {
            opts[key] = JSON.parse(value);
          } else if (key === 'width' || key === 'height') {
            opts[key] = value === 'auto' ? value : parseInt(value);
          } else {
            opts[key] = value;
          }
        }
        self.watch = scope.$watch(attrs['imagoVideo'], (function(_this) {
          return function(data) {
            var _ref;
            if (!data) {
              return;
            }
            if (!attrs['watch']) {
              self.watch();
            }
            self.source = data;
            if (!((_ref = self.source) != null ? _ref.serving_url : void 0)) {
              element.remove();
              return;
            }
            if (self.source.fields.hasOwnProperty('crop') && !attrs['align']) {
              opts.align = self.source.fields.crop.value;
            }
            if (self.source.fields.hasOwnProperty('sizemode') && !attrs['sizemode']) {
              opts.sizemode = self.source.fields.sizemode.value;
            }
            return preload(self.source);
          };
        })(this));
        preload = function(data) {
          var dpr, height, r, resolution, serving_url, style, width;
          if (angular.isString(data.resolution)) {
            r = data.resolution.split('x');
            resolution = {
              width: r[0],
              height: r[1]
            };
            opts.assetRatio = r[0] / r[1];
          }
          scope.controls = opts.controls;
          if (opts.width && opts.height) {
            width = opts.width;
            height = opts.height;
          } else {
            width = element[0].clientWidth;
            height = element[0].clientHeight;
          }
          dpr = opts.hires ? Math.ceil(window.devicePixelRatio) || 1 : 1;
          serving_url = "" + data.serving_url + "=s" + (Math.ceil(Math.min(Math.max(width, height) * dpr)) || 1600);
          style = {
            size: opts.size,
            sizemode: opts.sizemode,
            backgroundPosition: opts.align,
            backgroundImage: "url(" + serving_url + ")",
            backgroundRepeat: "no-repeat"
          };
          scope.wrapperStyle = style;
          setPlayerAttrs();
          scope.videoFormats = loadFormats(self.source);
          return render(width, height, serving_url);
        };
        setPlayerAttrs = function() {
          if (opts.autoplay === true) {
            scope.player.setAttribute("autoplay", true);
          }
          scope.player.setAttribute("preload", opts.preload);
          scope.player.setAttribute("x-webkit-airplay", "allow");
          scope.player.setAttribute("webkitAllowFullscreen", true);
          return scope.player.setAttribute("loop", opts.loop);
        };
        render = (function(_this) {
          return function(width, height, servingUrl) {
            var img;
            if (opts.lazy && !self.visible) {
              return self.visibleFunc = scope.$watch(attrs['visible'], function(value) {
                if (!value) {
                  return;
                }
                self.visible = true;
                self.visibleFunc();
                return render(width, height, servingUrl);
              });
            } else {
              img = angular.element('<img>');
              img.on('load', function(e) {
                _.assign(scope.wrapperStyle, styleWrapper(width, height));
                scope.videoStyle = styleVideo(width, height);
                scope.loading = false;
                return scope.$apply();
              });
              return img[0].src = servingUrl;
            }
          };
        })(this);
        styleWrapper = function(width, height) {
          var style, wrapperRatio;
          if (!(width && height)) {
            return;
          }
          style = {};
          wrapperRatio = width / height;
          if (opts.sizemode === 'crop') {
            if (opts.assetRatio < wrapperRatio) {
              style.backgroundSize = '100% auto';
            } else {
              style.backgroundSize = 'auto 100%';
            }
          } else {
            if (opts.assetRatio < wrapperRatio) {
              style.width = "" + (Math.round(height * opts.assetRatio)) + "px";
              style.height = "" + height + "px";
              style.backgroundSize = 'auto 100%';
            } else {
              style.width = "" + width + "px";
              style.height = "" + (Math.round(width / opts.assetRatio)) + "px";
              style.backgroundSize = '100% auto';
            }
          }
          return style;
        };
        styleVideo = (function(_this) {
          return function(width, height) {
            var style, wrapperRatio;
            if (!(width && height)) {
              return;
            }
            style = {};
            wrapperRatio = width / height;
            if (imagoUtils.isiOS()) {
              style.width = '100%';
              style.height = '100%';
              if (opts.align === 'center center' && opts.sizemode === 'crop') {
                style.top = '0';
                style.left = '0';
              }
            } else {
              if (opts.sizemode === 'crop') {
                if (opts.assetRatio < wrapperRatio) {
                  style.width = '100%';
                  style.height = 'auto';
                  if (opts.align === 'center center') {
                    style.top = '50%';
                    style.left = 'auto';
                    style.marginTop = "-" + (Math.round(height / 2)) + "px";
                    style.marginLeft = '0px';
                  }
                } else {
                  style.width = 'auto';
                  style.height = '100%';
                  if (opts.align === 'center center') {
                    style.top = 'auto';
                    style.left = '50%';
                    style.marginTop = '0px';
                    style.marginLeft = "-" + (Math.round(width / 2)) + "px";
                  }
                }
              } else {
                if (opts.assetRatio < wrapperRatio) {
                  style.width = 'auto';
                  style.height = '100%';
                } else {
                  style.width = '100%';
                  style.height = 'auto';
                }
              }
            }
            return style;
          };
        })(this);
        loadFormats = function(data) {
          var codec, format, formats, i, _i, _len, _ref;
          formats = [];
          codec = detectCodec();
          data.fields.formats.sort(function(a, b) {
            return b.height - a.height;
          });
          _ref = data.fields.formats;
          for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
            format = _ref[i];
            if (codec !== format.codec) {
              continue;
            }
            formats.push({
              "src": "//api.2.imagoapp.com/api/play_redirect?uuid=" + data.uuid + "&codec=" + format.codec + "&quality=hd&max_size=" + format.size,
              "size": format.size,
              "codec": format.codec,
              "type": "video/" + codec
            });
          }
          return formats;
        };
        detectCodec = function() {
          var codecs;
          if (!scope.player.canPlayType) {
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
            if (scope.player.canPlayType(value)) {
              return key;
            }
          }
        };
        scope.togglePlay = (function(_this) {
          return function() {
            if (scope.player.paused) {
              return scope.player.play();
            } else {
              scope.isPlaying = false;
              return scope.player.pause();
            }
          };
        })(this);
        scope.toggleSize = function() {
          if (opts.size === 'hd') {
            opts.size = 'sd';
            scope.wrapperStyle.size = 'sd';
          } else {
            opts.size = 'hd';
            scope.wrapperStyle.size = 'hd';
          }
          scope.videoFormats.reverse();
          return $timeout(function() {
            scope.player.load();
            return scope.player.play();
          });
        };
        onResize = function() {
          var height, width;
          width = element[0].clientWidth || opts.width;
          height = element[0].clientHeight || opts.height;
          _.assign(scope.wrapperStyle, styleWrapper(width, height));
          scope.videoStyle = styleVideo(width, height);
          return scope.$apply();
        };
        scope.$on('resize', onResize);
        return scope.$on('resizestop', function() {
          return preload(self.source);
        });
      }
    };
  }

  return imagoVideo;

})();

angular.module('imago').directive('imagoVideo', ['$q', '$timeout', '$window', 'imagoUtils', imagoVideo]);

var Time;

Time = (function() {
  function Time() {
    return function(input) {
      var calc, hours, minutes, pad, seconds;
      if (typeof input !== 'number') {
        return;
      }
      pad = function(num) {
        if (num < 10) {
          return "0" + num;
        }
        return num;
      };
      calc = [];
      minutes = Math.floor(input / 60);
      hours = Math.floor(input / 3600);
      seconds = (input === 0 ? 0 : input % 60);
      seconds = Math.round(seconds);
      if (hours > 0) {
        calc.push(pad(hours));
      }
      calc.push(pad(minutes));
      calc.push(pad(seconds));
      return calc.join(":");
    };
  }

  return Time;

})();

angular.module('imago').filter('time', [Time]);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/controlsVideo.html","<div stop-propagation=\"stop-propagation\" ng-switch=\"isPlaying\" class=\"controls\"><a hm-tap=\"togglePlay()\" ng-switch-when=\"false\" class=\"video-play fa fa-play\"></a><a hm-tap=\"togglePlay()\" ng-switch-when=\"true\" class=\"video-pause fa fa-pause\"></a><span class=\"video-time\">{{currentTime | time}}</span><span class=\"video-seekbar\"><input type=\"range\" ng-model=\"currentTime\" min=\"0\" max=\"{{duration}}\" ng-change=\"seek(currentTime)\" class=\"seek\"/></span><a hm-tap=\"toggleSize()\" class=\"size\">{{wrapperStyle.size}}</a><span class=\"volume\"><span ng-click=\"volumeUp()\" class=\"fa fa-volume-up icon-volume-up\"></span><input type=\"range\" ng-model=\"volumeInput\" ng-change=\"onVolumeChange(volumeInput)\"/><span hm-tap=\"volumeDown()\" class=\"fa fa-volume-down icon-volume-down\"></span></span><a hm-tap=\"fullScreen()\" class=\"video-fullscreen fa fa-expand\"></a><a class=\"video-screen fa fa-compress\"></a></div>");
$templateCache.put("/imago/imagoVideo.html","<div ng-class=\"{loading: loading}\" in-view=\"visible = $inview\" visible=\"visible\" responsive-events=\"responsive-events\" class=\"imagovideo {{wrapperStyle.backgroundPosition}} {{wrapperStyle.size}} {{wrapperStyle.sizemode}}\"><div ng-style=\"wrapperStyle\" ng-class=\"{playing: isPlaying}\" class=\"imagowrapper\"><a ng-hide=\"loading\" hm-tap=\"togglePlay()\" ng-class=\"{playing: isPlaying}\" stop-propagation=\"stop-propagation\" class=\"playbig fa fa-play\"></a><video ng-style=\"videoStyle\"><source ng-repeat=\"format in videoFormats\" src=\"{{format.src}}\" data-size=\"{{format.size}}\" data-codec=\"{{format.codec}}\" type=\"{{format.type}}\"/></video><div imago-controls=\"imago-controls\" ng-style=\"controlStyle\" ng-if=\"controls\" ng-show=\"hasPlayed\"></div></div></div>");}]);