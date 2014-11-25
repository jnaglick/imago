var App;

App = (function() {
  function App() {
    return ['ImagoWidgetsTemplates', 'lodash', 'angular-inview'];
  }

  return App;

})();

angular.module('imago.widgets.angular', App());

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

angular.module('imago.widgets.angular').controller('imagoPage', ['$scope', '$state', 'imagoModel', imagoPage]);

var imagoCompile;

imagoCompile = (function() {
  function imagoCompile($compile) {
    return function(scope, element, attrs) {
      var compile, htmlName;
      compile = function(newHTML) {
        newHTML = $compile(newHTML)(scope);
        return element.html("").append(newHTML);
      };
      htmlName = attrs.compile;
      return scope.$watch(htmlName, function(newHTML) {
        if (!newHTML) {
          return;
        }
        return compile(newHTML);
      });
    };
  }

  return imagoCompile;

})();

angular.module('imago.widgets.angular').directive('imagoCompile', ['$compile', imagoCompile]);

var imagoContact;

imagoContact = (function() {
  function imagoContact(imagoSubmit) {
    return {
      replace: true,
      scope: {},
      templateUrl: '/imagoWidgets/contact-widget.html',
      controller: function($scope) {
        return $scope.submitForm = (function(_this) {
          return function(isValid) {
            if (isValid) {
              return imagoSubmit.send($scope.contact);
            }
          };
        })(this);
      }
    };
  }

  return imagoContact;

})();

angular.module('imago.widgets.angular').directive('imagoContact', ['imagoSubmit', imagoContact]);

var imagoControls;

imagoControls = (function() {
  function imagoControls() {
    return {
      replace: true,
      scope: true,
      require: '^imagoVideo',
      templateUrl: '/imagoWidgets/controlsVideo.html',
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

angular.module('imago.widgets.angular').directive('imagoControls', [imagoControls]);

var imagoImage;

imagoImage = (function() {
  function imagoImage($window, $log, imagoUtils) {
    return {
      replace: true,
      scope: true,
      templateUrl: '/imagoWidgets/imagoImage.html',
      controller: function($scope, $element, $attrs) {
        $scope.status = 'loading';
        return $scope.imageStyle = {};
      },
      link: function(scope, element, attrs) {
        var calcMediaSize, calcSize, createServingUrl, key, opts, render, self, setImageStyle, source, value;
        self = {
          visible: false
        };
        source = {};
        opts = {
          align: 'center center',
          sizemode: 'fit',
          hires: true,
          responsive: true,
          scale: 1,
          lazy: true,
          maxsize: 2560,
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
        self.watch = scope.$watch(attrs['imagoImage'], (function(_this) {
          return function(data) {
            if (!data) {
              return;
            }
            if (!attrs['watch']) {
              self.watch();
            }
            source = data;
            if (!(source != null ? source.serving_url : void 0)) {
              element.remove();
              return;
            }
            if (source.fields.hasOwnProperty('crop') && !attrs['align']) {
              opts.align = source.fields.crop.value;
            }
            if (source.fields.hasOwnProperty('sizemode') && !attrs['sizemode']) {
              opts.sizemode = source.fields.sizemode.value;
            }
            return calcSize();
          };
        })(this));
        calcSize = function() {
          var height, r, width;
          if (angular.isString(source.resolution)) {
            r = source.resolution.split('x');
            opts.resolution = {
              width: r[0],
              height: r[1]
            };
            opts.assetRatio = r[0] / r[1];
          }
          if (scope.status === 'preloading') {
            return console.log('tried to render during rendering!!');
          }
          scope.status = 'preloading';
          if (angular.isNumber(opts.width) && angular.isNumber(opts.height)) {
            width = parseInt(opts.width);
            height = parseInt(opts.height);
          } else if (opts.height === 'auto' && angular.isNumber(opts.width)) {
            height = parseInt(opts.width / opts.assetRatio);
            width = opts.width;
          } else if (opts.width === 'auto' && angular.isNumber(opts.height)) {
            height = opts.height;
            width = opts.height * opts.assetRatio;
          } else if (opts.width === 'auto' && opts.height === 'auto') {
            width = element[0].clientWidth;
            height = width / opts.assetRatio;
          } else {
            width = element[0].clientWidth;
            height = element[0].clientHeight;
          }
          if (opts.width === 'auto' && opts.height === 'auto') {
            scope.elementStyle = {
              height: Math.round(height) + 'px'
            };
          } else if (opts.width === 'auto' || opts.height === 'auto') {
            scope.elementStyle = {
              width: Math.round(width) + 'px',
              height: Math.round(height) + 'px'
            };
          }
          scope.align = opts.align;
          return createServingUrl(width, height);
        };
        createServingUrl = function(width, height) {
          var dpr, servingSize, servingUrl, wrapperRatio;
          wrapperRatio = width / height;
          dpr = opts.hires ? Math.ceil($window.devicePixelRatio) || 1 : 1;
          if (opts.sizemode === 'crop') {
            if (opts.assetRatio <= wrapperRatio) {
              servingSize = Math.round(Math.max(width, width / opts.assetRatio));
            } else {
              servingSize = Math.round(Math.max(height, height * opts.assetRatio));
            }
          } else {
            if (opts.assetRatio <= wrapperRatio) {
              servingSize = Math.round(Math.max(height, height * opts.assetRatio));
            } else {
              servingSize = Math.round(Math.max(width, width / opts.assetRatio));
            }
          }
          servingSize = parseInt(Math.min(servingSize * dpr, opts.maxsize), 10);
          if (servingSize === opts.servingSize) {
            scope.status = 'loaded';
            return;
          }
          opts.servingSize = servingSize;
          if (imagoUtils.isBaseString(source.serving_url)) {
            servingUrl = source.serving_url;
          } else {
            servingUrl = "" + source.serving_url + "=s" + (servingSize * opts.scale);
          }
          if (!opts.responsive) {
            scope.imageStyle.width = "" + (parseInt(width, 10)) + "px";
            scope.imageStyle.height = "" + (parseInt(height, 10)) + "px";
          }
          return render(servingUrl);
        };
        render = function(servingUrl) {
          var img;
          if (opts.lazy && !self.visible) {
            return self.visibleFunc = scope.$watch(attrs['visible'], (function(_this) {
              return function(value) {
                if (!value) {
                  return;
                }
                self.visible = true;
                self.visibleFunc();
                return render(servingUrl);
              };
            })(this));
          } else {
            img = angular.element('<img>');
            img.on('load', (function(_this) {
              return function(e) {
                scope.imageStyle = setImageStyle(servingUrl);
                scope.status = 'loaded';
                return scope.$apply();
              };
            })(this));
            return img[0].src = servingUrl;
          }
        };
        calcMediaSize = (function(_this) {
          return function() {
            var height, width, wrapperRatio;
            width = element[0].clientWidth || opts.width;
            height = element[0].clientHeight || opts.height;
            if (!(width && height)) {
              return;
            }
            wrapperRatio = width / height;
            if (opts.sizemode === 'crop') {
              if (opts.assetRatio < wrapperRatio) {
                return "100% auto";
              } else {
                return "auto 100%";
              }
            } else {
              if (opts.assetRatio > wrapperRatio) {
                return "100% auto";
              } else {
                return "auto 100%";
              }
            }
          };
        })(this);
        setImageStyle = function(servingUrl) {
          var height, styles, width, wrapperRatio;
          width = element[0].clientWidth || opts.width;
          height = element[0].clientHeight || opts.height;
          if (!(width && height)) {
            return;
          }
          wrapperRatio = width / height;
          styles = {
            backgroundImage: "url(" + servingUrl + ")",
            backgroundSize: calcMediaSize(),
            backgroundPosition: opts.align,
            display: 'inline-block'
          };
          if (opts.assetRatio > wrapperRatio) {
            styles.width = "" + width + "px";
            styles.height = "" + (Math.round(width / opts.assetRatio)) + "px";
          } else {
            styles.width = "" + (Math.round(height * opts.assetRatio)) + "px";
            styles.height = "" + height + "px";
          }
          return styles;
        };
        scope.onResize = (function(_this) {
          return function() {
            return scope.imageStyle['background-size'] = calcMediaSize();
          };
        })(this);
        if (opts.responsive) {
          scope.$on('resizelimit', scope.onResize);
          scope.$on('resizestop', (function(_this) {
            return function() {
              scope.status = 'loading';
              return calcSize();
            };
          })(this));
        }
        return angular.element($window).on("orientationchange", calcSize);
      }
    };
  }

  return imagoImage;

})();

angular.module('imago.widgets.angular').directive('imagoImage', ['$window', '$log', 'imagoUtils', imagoImage]);

var imagoSlider;

imagoSlider = (function() {
  function imagoSlider($rootScope, $q, $document, imagoModel, $interval) {
    return {
      replace: true,
      transclude: true,
      scope: true,
      templateUrl: '/imagoWidgets/imagoSlider.html',
      controller: function($scope) {
        return $scope.conf = {
          animation: 'fade',
          enablekeys: true,
          enablearrows: true,
          loop: true,
          current: 0,
          namespace: 'slider',
          autoplay: 0
        };
      },
      link: function(scope, element, attrs, ctrl, transclude) {
        var interval, watcher;
        transclude(scope, function(clone, scope) {
          return element.append(clone);
        });
        angular.forEach(attrs, function(value, key) {
          if (value === 'true' || value === 'false') {
            value = JSON.parse(value);
          }
          return scope.conf[key] = value;
        });
        scope.currentIndex = scope.conf.current;
        scope.goPrev = function($event) {
          return scope.setCurrent(scope.currentIndex > 0 ? scope.currentIndex - 1 : parseInt(attrs.length) - 1);
        };
        scope.goNext = function($event) {
          return scope.setCurrent(scope.currentIndex < parseInt(attrs.length) - 1 ? scope.currentIndex + 1 : 0);
        };
        scope.getLast = function() {
          return parseInt(attrs.length) - 1;
        };
        scope.getCurrent = function() {
          return scope.currentIndex;
        };
        scope.setCurrent = (function(_this) {
          return function(index) {
            scope.action = (function() {
              switch (false) {
                case !(index === 0 && scope.currentIndex === (parseInt(attrs.length) - 1)):
                  return 'next';
                case !(index === (parseInt(attrs.length) - 1) && scope.currentIndex === 0):
                  return 'prev';
                case !(index > scope.currentIndex):
                  return 'next';
                case !(index < scope.currentIndex):
                  return 'prev';
                default:
                  return '';
              }
            })();
            scope.currentIndex = index;
            return $rootScope.$emit("" + scope.conf.namespace + ":changed", index);
          };
        })(this);
        if (scope.conf.autoplay) {
          interval = $interval(scope.goNext, parseInt(scope.conf.autoplay));
        }
        if (scope.conf.enablekeys) {
          $document.on('keydown', function(e) {
            switch (e.keyCode) {
              case 37:
                return scope.$apply(function() {
                  return scope.goPrev();
                });
              case 39:
                return scope.$apply(function() {
                  return scope.goNext();
                });
            }
          });
        }
        watcher = $rootScope.$on("" + scope.conf.namespace + ":change", function(event, index) {
          return scope.setCurrent(index);
        });
        return scope.$on('$destroy', function() {
          $interval.cancel(interval);
          return watcher();
        });
      }
    };
  }

  return imagoSlider;

})();

angular.module('imago.widgets.angular').directive('imagoSlider', ['$rootScope', '$q', '$document', 'imagoModel', '$interval', imagoSlider]);

var imagoVideo;

imagoVideo = (function() {
  function imagoVideo($q, $timeout, $window, imagoUtils) {
    return {
      replace: true,
      scope: true,
      templateUrl: '/imagoWidgets/imagoVideo.html',
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

angular.module('imago.widgets.angular').directive('imagoVideo', ['$q', '$timeout', '$window', 'imagoUtils', imagoVideo]);

var ResponsiveEvents;

ResponsiveEvents = (function() {
  function ResponsiveEvents($window) {
    return {
      restrict: 'A',
      link: function($scope) {
        var onMouseWheelStart, onResizeStart, onScrollStart, w;
        w = angular.element($window);
        onResizeStart = (function(_this) {
          return function(e) {
            if (_this.resizeing) {
              return;
            }
            $scope.$broadcast('resizestart');
            _this.resizeing = true;
            return w.one('resizestop', function() {
              return _this.resizeing = false;
            });
          };
        })(this);
        onScrollStart = (function(_this) {
          return function(e) {
            if (_this.scrolling) {
              return;
            }
            $scope.$broadcast('scrollstart');
            _this.scrolling = true;
            return w.one('scrollstop', function() {
              return _this.scrolling = false;
            });
          };
        })(this);
        onMouseWheelStart = (function(_this) {
          return function(e) {
            if (_this.isMouseWheeling) {
              return;
            }
            $scope.$broadcast('mousewheelstart');
            _this.isMouseWheeling = true;
            return w.one('mousewheelstop', function() {
              return _this.isMouseWheeling = false;
            });
          };
        })(this);
        w.on('resize', function() {
          return $scope.$broadcast('resize');
        });
        w.on('resize', onResizeStart);
        w.on('resize', _.debounce((function() {
          return $scope.$broadcast('resizestop');
        }), 200));
        w.on('resize', _.throttle((function() {
          return $scope.$broadcast('resizelimit');
        }), 150));
        w.on('scroll', onScrollStart);
        w.on('scroll', _.debounce((function() {
          return $scope.$broadcast('scrollstop');
        }), 200));
        w.on('scroll', _.throttle((function() {
          return $scope.$broadcast('scrolllimit');
        }), 150));
        w.on('mousewheel', onMouseWheelStart);
        w.on('mousewheel', _.debounce((function() {
          return $scope.$broadcast('mousewheelstop');
        }), 200));
        return w.on('mousewheel', _.throttle((function() {
          return $scope.$broadcast('mousewheellimit');
        }), 150));
      }
    };
  }

  return ResponsiveEvents;

})();

angular.module('imago.widgets.angular').directive('responsiveEvents', ['$window', ResponsiveEvents]);

var StopPropagation;

StopPropagation = (function() {
  function StopPropagation() {
    return {
      link: function(scope, element, attr) {
        element.bind('click', function(e) {
          return e.stopPropagation();
        });
        return element.bind('dblclick', function(e) {
          return e.stopPropagation();
        });
      }
    };
  }

  return StopPropagation;

})();

angular.module('imago.widgets.angular').directive('stopPropagation', [StopPropagation]);

var imagoModel,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

imagoModel = (function() {
  function imagoModel($rootScope, $http, $location, $q, imagoUtils, imagoWorker, imagoConf) {
    this.$rootScope = $rootScope;
    this.$http = $http;
    this.$location = $location;
    this.$q = $q;
    this.imagoUtils = imagoUtils;
    this.imagoWorker = imagoWorker;
    this.imagoConf = imagoConf;
    this.prepareCreation = __bind(this.prepareCreation, this);
    this.isDuplicated = __bind(this.isDuplicated, this);
    this.batchChange = __bind(this.batchChange, this);
    this.reorder = __bind(this.reorder, this);
    this.reindexAll = __bind(this.reindexAll, this);
    this.reSort = __bind(this.reSort, this);
    this.paste = __bind(this.paste, this);
    this.move = __bind(this.move, this);
    this.copy = __bind(this.copy, this);
    this.trash = __bind(this.trash, this);
    this["delete"] = __bind(this["delete"], this);
    this.update = __bind(this.update, this);
    this.add = __bind(this.add, this);
    this.updateCount = __bind(this.updateCount, this);
    this.filterAssets = __bind(this.filterAssets, this);
    this.findIdx = __bind(this.findIdx, this);
    this.find = __bind(this.find, this);
    this.findByAttr = __bind(this.findByAttr, this);
    this.findParent = __bind(this.findParent, this);
    this.findChildren = __bind(this.findChildren, this);
    this.create = __bind(this.create, this);
    this.getData = __bind(this.getData, this);
    this.getLocalData = __bind(this.getLocalData, this);
    this.assets = {
      get: (function(_this) {
        return function(id) {
          return $http.get("" + _this.imagoConf.host + "/api/assets/" + id);
        };
      })(this),
      create: (function(_this) {
        return function(assets) {
          return $http.post("" + _this.imagoConf.host + "/api/assets", assets);
        };
      })(this),
      update: (function(_this) {
        return function(item) {
          return $http.put("" + _this.imagoConf.host + "/api/assets/" + item._id, item);
        };
      })(this),
      "delete": (function(_this) {
        return function(id) {
          return $http["delete"]("" + _this.imagoConf.host + "/api/assets/" + id);
        };
      })(this),
      trash: (function(_this) {
        return function(assets) {
          return $http.post("" + _this.imagoConf.host + "/api/assets/trash", assets);
        };
      })(this),
      move: (function(_this) {
        return function(items, src, dest) {
          var data;
          data = {
            src: src,
            dest: dest,
            items: items
          };
          return $http.post("" + _this.imagoConf.host + "/api/assets/move", data);
        };
      })(this),
      copy: (function(_this) {
        return function(items, src, dest) {
          var data;
          data = {
            src: src,
            dest: dest,
            items: items
          };
          return $http.post("" + _this.imagoConf.host + "/api/assets/copy", data);
        };
      })(this),
      batch: (function(_this) {
        return function(list) {
          return $http.put("" + _this.imagoConf.host + "/api/assets/update", {
            assets: list
          });
        };
      })(this)
    };
  }

  imagoModel.prototype.data = [];

  imagoModel.prototype.currentCollection = void 0;

  imagoModel.prototype.getSearchUrl = function() {
    if (data === 'online' && debug) {
      return "" + window.location.protocol + "//api.2.imagoapp.com/api/search";
    } else {
      return "http://localhost:8000/api/search";
    }
  };

  imagoModel.prototype.search = function(query) {
    var params;
    params = this.formatQuery(query);
    return this.$http.post(this.getSearchUrl(), angular.toJson(params));
  };

  imagoModel.prototype.getLocalData = function(query, opts) {
    var asset, defer, key, path, value;
    if (opts == null) {
      opts = {};
    }
    defer = this.$q.defer();
    for (key in opts) {
      value = opts[key];
      if (key === 'localData' && value === false) {
        defer.reject(query);
      }
    }
    for (key in query) {
      value = query[key];
      if (key === 'fts') {
        console.log('reject if fts', query);
        defer.reject(query);
      } else if (key === 'collection') {
        query = this.imagoUtils.renameKey('collection', 'path', query);
        path = value;
      } else if (key === 'kind') {
        query = this.imagoUtils.renameKey('kind', 'metakind', query);
      } else if (key === 'path') {
        path = value;
      }
    }
    if (path) {
      if (_.isString(path)) {
        asset = this.find({
          'path': path
        });
      } else if (_.isArray(path)) {
        asset = this.find({
          'path': path[0]
        });
      }
      if (asset) {
        asset.assets = this.findChildren(asset);
        if (asset.count || asset.assets.length) {
          if (asset.assets.length !== asset.count) {
            defer.reject(query);
          } else {
            asset.assets = this.filterAssets(asset.assets, query);
            defer.resolve(asset);
          }
        } else {
          defer.resolve(asset);
        }
      } else {
        defer.reject(query);
      }
    } else {
      defer.reject(query);
    }
    return defer.promise;
  };

  imagoModel.prototype.getData = function(query, opts) {
    var data, defer, fetches, promises, resolve;
    if (opts == null) {
      opts = {};
    }
    defer = this.$q.defer();
    query = angular.copy(query);
    if (!query) {
      query = this.$location.path();
    }
    if (angular.isString(query)) {
      query = [
        {
          path: query
        }
      ];
    }
    query = this.imagoUtils.toArray(query);
    promises = [];
    fetches = [];
    data = [];
    resolve = (function(_this) {
      return function() {
        return _this.$q.all(fetches).then(function(resolve) {
          return defer.resolve(data);
        });
      };
    })(this);
    _.forEach(query, (function(_this) {
      return function(value) {
        return promises.push(_this.getLocalData(value, opts).then(function(result) {
          var worker;
          if (result.assets) {
            worker = {
              assets: result.assets,
              order: result.sortorder,
              path: _this.imagoConf.sort_worker
            };
            return fetches.push(_this.imagoWorker.work(worker).then(function(response) {
              result.assets = response.assets;
              data.push(result);
              return data = _.flatten(data);
            }));
          } else {
            data.push(result);
            return data = _.flatten(data);
          }
        }, function(reject) {
          console.log('rejected query', reject);
          return fetches.push(_this.search(reject).then(function(response) {
            if (!response.data) {
              return;
            }
            if (reject.page) {
              response.data.page = reject.page;
            }
            return data.push(_this.create(response.data));
          }));
        }));
      };
    })(this));
    this.$q.all(promises).then(function(response) {
      return resolve();
    });
    return defer.promise;
  };

  imagoModel.prototype.formatQuery = function(query) {
    var elem, key, querydict, value, _i, _j, _len, _len1, _ref;
    querydict = {};
    if (angular.isArray(query)) {
      for (_i = 0, _len = query.length; _i < _len; _i++) {
        elem = query[_i];
        for (key in elem) {
          value = elem[key];
          querydict[key] || (querydict[key] = []);
          querydict[key].push(value);
        }
      }
    } else {
      for (key in query) {
        value = query[key];
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
  };

  imagoModel.prototype.create = function(data) {
    var asset, collection, _i, _len, _ref;
    collection = data;
    if (data.assets) {
      _ref = data.assets;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        asset = _ref[_i];
        if (this.imagoUtils.isBaseString(asset.serving_url)) {
          asset.base64 = true;
        } else {
          asset.base64 = false;
        }
        if (!this.find({
          '_id': asset._id
        })) {
          this.data.push(asset);
        }
      }
    }
    if (!this.find({
      '_id': collection._id
    })) {
      if (collection.kind === 'Collection') {
        collection = _.omit(collection, 'assets');
      }
      this.data.push(collection);
    }
    return data;
  };

  imagoModel.prototype.findChildren = function(asset) {
    return _.where(this.data, {
      parent: asset._id
    });
  };

  imagoModel.prototype.findParent = function(asset) {
    return _.find(this.data, {
      '_id': asset.parent
    });
  };

  imagoModel.prototype.findByAttr = function(options) {
    if (options == null) {
      options = {};
    }
    return _.where(this.data, options);
  };

  imagoModel.prototype.find = function(options) {
    if (options == null) {
      options = {};
    }
    return _.find(this.data, options);
  };

  imagoModel.prototype.findIdx = function(options) {
    if (options == null) {
      options = {};
    }
    return _.findIndex(this.data, options);
  };

  imagoModel.prototype.filterAssets = function(assets, query) {
    var key, params, value, _i, _len;
    if (query.path) {
      delete query.path;
    }
    if (_.keys(query).length > 0) {
      for (key in query) {
        value = query[key];
        for (_i = 0, _len = value.length; _i < _len; _i++) {
          params = value[_i];
          if (key !== 'path') {
            assets = _.filter(assets, function(asset) {
              var _ref;
              if ((_ref = asset.fields) != null ? _ref.hasOwnProperty(key) : void 0) {
                if (asset.fields[key]['value'] === params) {
                  return asset;
                }
              } else if (asset[key] === params) {
                return asset;
              }
            });
          }
        }
      }
    }
    return assets;
  };

  imagoModel.prototype.updateCount = function(parent, number) {
    parent.count = parent.count + number;
    return this.update(parent, {
      stream: false
    });
  };

  imagoModel.prototype.add = function(assets, options) {
    var asset, defer, _i, _len;
    if (options == null) {
      options = {};
    }
    if (_.isUndefined(options.stream)) {
      options.stream = true;
    }
    if (_.isUndefined(options.push)) {
      options.push = true;
    }
    if (options.save) {
      defer = this.$q.defer();
      this.assets.create(assets).then((function(_this) {
        return function(result) {
          var asset, _i, _len, _ref;
          if (options.push) {
            _ref = result.data.data;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              asset = _ref[_i];
              if (_this.imagoUtils.isBaseString(asset.serving_url)) {
                asset.base64 = true;
              } else {
                asset.base64 = false;
              }
              _this.data.push(asset);
            }
          }
          defer.resolve(result.data.data);
          if (options.stream) {
            return _this.$rootScope.$emit('assets:add', result.data.data);
          }
        };
      })(this));
      return defer.promise;
    } else {
      if (options.push) {
        for (_i = 0, _len = assets.length; _i < _len; _i++) {
          asset = assets[_i];
          if (this.imagoUtils.isBaseString(asset.serving_url)) {
            asset.base64 = true;
          } else {
            asset.base64 = false;
          }
          this.data.push(asset);
        }
      }
      if (options.stream) {
        return this.$rootScope.$emit('assets:add', assets);
      }
    }
  };

  imagoModel.prototype.update = function(data, options) {
    var asset, attribute, copy, idx, query, _i, _len;
    if (options == null) {
      options = {};
    }
    if (_.isUndefined(options.stream)) {
      options.stream = true;
    }
    attribute = (options.attribute ? options.attribute : '_id');
    copy = angular.copy(data);
    if (_.isPlainObject(copy)) {
      query = {};
      query[attribute] = copy[attribute];
      if (!copy[attribute]) {
        return;
      }
      if (copy.assets) {
        delete copy.assets;
      }
      idx = this.findIdx(query);
      if (idx !== -1) {
        this.data[idx] = _.assign(this.data[idx], copy);
      } else {
        this.data.push(copy);
      }
      if (options.save) {
        if (copy.status === 'processing') {
          delete copy.serving_url;
        }
        this.assets.update(copy);
      }
    } else if (_.isArray(copy)) {
      for (_i = 0, _len = copy.length; _i < _len; _i++) {
        asset = copy[_i];
        query = {};
        query[attribute] = asset[attribute];
        if (asset.assets) {
          delete asset.assets;
        }
        idx = this.findIdx(query);
        if (idx !== -1) {
          _.assign(this.data[idx], asset);
        } else {
          this.data.push(asset);
        }
        if (asset.status === 'processing') {
          delete asset.serving_url;
        }
      }
      if (options.save) {
        this.assets.batch(copy);
      }
    }
    if (options.stream) {
      return this.$rootScope.$emit('assets:update', copy);
    }
  };

  imagoModel.prototype["delete"] = function(assets, options) {
    var asset, defer, _i, _len;
    if (options == null) {
      options = {};
    }
    if (!assets) {
      return;
    }
    defer = this.$q.defer();
    if (_.isUndefined(options.stream)) {
      options.stream = true;
    }
    for (_i = 0, _len = assets.length; _i < _len; _i++) {
      asset = assets[_i];
      this.data = _.reject(this.data, {
        '_id': asset._id
      });
      if (options.save) {
        this.assets["delete"](asset._id);
      }
    }
    defer.resolve(assets);
    if (options.stream) {
      this.$rootScope.$emit('assets:delete', assets);
    }
    return defer.promise;
  };

  imagoModel.prototype.trash = function(assets) {
    var asset, newAsset, request, _i, _len;
    request = [];
    for (_i = 0, _len = assets.length; _i < _len; _i++) {
      asset = assets[_i];
      newAsset = {
        '_id': asset._id
      };
      request.push(newAsset);
    }
    this.assets.trash(request);
    return this["delete"](assets);
  };

  imagoModel.prototype.copy = function(assets, sourceId, parentId) {
    return this.paste(assets).then((function(_this) {
      return function(pasted) {
        var asset, newAsset, request, _i, _len;
        request = [];
        for (_i = 0, _len = pasted.length; _i < _len; _i++) {
          asset = pasted[_i];
          newAsset = {
            '_id': asset._id,
            'order': asset.order,
            'name': asset.name
          };
          request.push(newAsset);
        }
        return _this.assets.copy(request, sourceId, parentId).then(function(result) {
          if (_this.currentCollection.sortorder === '-order') {
            return _this.update(result.data);
          } else {
            _this.update(result.data, {
              stream: false
            });
            return _this.reSort(_this.currentCollection);
          }
        });
      };
    })(this));
  };

  imagoModel.prototype.move = function(assets, sourceId, parentId) {
    return this.paste(assets).then((function(_this) {
      return function(pasted) {
        var asset, formatted, request, _i, _len;
        request = [];
        for (_i = 0, _len = pasted.length; _i < _len; _i++) {
          asset = pasted[_i];
          formatted = {
            '_id': asset._id,
            'order': asset.order,
            'name': asset.name
          };
          request.push(formatted);
        }
        if (_this.currentCollection.sortorder === '-order') {
          _this.update(pasted);
        } else {
          _this.update(pasted, {
            stream: false
          });
          _this.reSort(_this.currentCollection);
        }
        return _this.assets.move(request, sourceId, parentId);
      };
    })(this));
  };

  imagoModel.prototype.paste = function(assets, options) {
    var asset, assetsChildren, checkAsset, defer, queue, _i, _len;
    if (options == null) {
      options = {};
    }
    if (_.isUndefined(options.checkdups)) {
      options.checkdups = true;
    }
    defer = this.$q.defer();
    assetsChildren = this.findChildren(this.currentCollection);
    checkAsset = (function(_this) {
      return function(asset) {
        var deferAsset, exists, i, original_name;
        deferAsset = _this.$q.defer();
        if (!options.checkdups || _.where(assetsChildren, {
          name: asset.name
        }).length === 0) {
          deferAsset.resolve(asset);
        } else {
          i = 1;
          exists = true;
          original_name = asset.name;
          while (exists) {
            asset.name = "" + original_name + "_" + i;
            i++;
            exists = (_.where(assetsChildren, {
              name: asset.name
            }).length > 0 ? true : false);
          }
          deferAsset.resolve(asset);
        }
        return deferAsset.promise;
      };
    })(this);
    queue = [];
    for (_i = 0, _len = assets.length; _i < _len; _i++) {
      asset = assets[_i];
      queue.push(checkAsset(asset));
    }
    this.$q.all(queue).then((function(_this) {
      return function(result) {
        return defer.resolve(result);
      };
    })(this));
    return defer.promise;
  };

  imagoModel.prototype.reSort = function(collection) {
    var orderedList;
    if (!collection.assets || collection.sortorder === '-order') {
      return;
    }
    orderedList = this.reindexAll(collection.assets);
    this.update(orderedList, {
      stream: false,
      save: true
    });
    collection.sortorder = '-order';
    return this.update(collection, {
      save: true
    });
  };

  imagoModel.prototype.reindexAll = function(list) {
    var asset, count, key, newList, ordered, _i, _len;
    newList = [];
    count = list.length;
    for (key = _i = 0, _len = list.length; _i < _len; key = ++_i) {
      asset = list[key];
      asset.order = (count - key) * this.imagoConf.index;
      ordered = {
        '_id': asset._id,
        'order': asset.order
      };
      newList.push(ordered);
    }
    return newList;
  };

  imagoModel.prototype.reorder = function(dropped, list, selection, options) {
    var count, data, idxOne, idxTwo, minusOrder;
    if (options == null) {
      options = {};
    }
    if (_.isUndefined(options.process)) {
      options.process = true;
    }
    if (options.reverse) {
      count = dropped - selection.length;
      idxOne = list[count];
      idxTwo = list[dropped + 1] ? list[dropped + 1] : {
        order: 0
      };
      selection = selection.reverse();
    } else if (options.process === false) {
      idxOne = list[dropped - 1];
      idxTwo = list[dropped] ? list[dropped] : {
        order: 0
      };
    } else {
      count = dropped + selection.length;
      idxOne = list[dropped - 1] ? list[dropped - 1] : void 0;
      idxTwo = list[count];
    }
    if (!idxOne) {
      minusOrder = this.imagoConf.index;
    } else {
      minusOrder = (idxOne.order - idxTwo.order) / (selection.length + 1);
    }
    data = {
      minus: parseInt(minusOrder),
      order: parseInt(idxTwo.order + minusOrder)
    };
    return data;
  };

  imagoModel.prototype.batchChange = function(assets) {
    var asset, copy, idx, key, original, toedit, value, _i, _len;
    for (idx = _i = 0, _len = assets.length; _i < _len; idx = ++_i) {
      asset = assets[idx];
      original = this.find({
        '_id': asset._id
      });
      if (!original) {
        return;
      }
      copy = {
        fields: original.fields,
        parent: original.parent
      };
      toedit = angular.copy(asset);
      for (key in toedit) {
        value = toedit[key];
        if (key === 'fields') {
          for (key in toedit.fields) {
            copy['fields'] || (copy['fields'] = {});
            copy['fields'][key] = toedit.fields[key];
          }
        } else {
          copy[key] = toedit[key];
        }
      }
      assets[idx] = copy;
    }
    return this.update(assets, {
      save: true
    });
  };

  imagoModel.prototype.isDuplicated = function(asset, assets, options) {
    var assetsChildren, defer, exists, findName, i, name, original_name, result;
    if (options == null) {
      options = {};
    }
    if (_.isUndefined(options.rename)) {
      options.rename = false;
    }
    defer = this.$q.defer();
    if (!asset.name) {
      defer.reject(asset.name);
    }
    name = this.imagoUtils.normalize(asset.name);
    result = void 0;
    assetsChildren = _.where(assets, (function(_this) {
      return function(chr) {
        var normalizeName;
        if (!chr.name) {
          return false;
        }
        normalizeName = angular.copy(_this.imagoUtils.normalize(chr.name));
        return normalizeName === name;
      };
    })(this));
    if (assetsChildren.length) {
      if (assetsChildren.length === 1 && assetsChildren[0]._id === asset._id) {
        defer.resolve(false);
      }
      if (options.rename) {
        i = 1;
        exists = true;
        original_name = name;
        while (exists) {
          name = "" + original_name + "_" + i;
          i++;
          findName = _.find(assets, (function(_this) {
            return function(chr) {
              var normalizeName;
              normalizeName = angular.copy(_this.imagoUtils.normalize(chr.name));
              return normalizeName === name;
            };
          })(this));
          exists = (findName ? true : false);
        }
        defer.resolve(name);
      } else {
        defer.resolve(true);
      }
    } else {
      defer.resolve(false);
    }
    return defer.promise;
  };

  imagoModel.prototype.prepareCreation = function(asset, parent, order, rename) {
    var defer;
    if (rename == null) {
      rename = false;
    }
    defer = this.$q.defer();
    if (!asset.name) {
      defer.reject(asset.name);
    }
    this.isDuplicated(asset, parent.assets, {
      rename: rename
    }).then((function(_this) {
      return function(isDuplicated) {
        var assets, orderedList;
        if (isDuplicated && _.isBoolean(isDuplicated)) {
          return defer.resolve('duplicated');
        } else {
          if (_.isString(isDuplicated)) {
            asset.name = isDuplicated;
          }
          if (order) {
            asset.order = order;
          } else {
            if (parent.sortorder === '-order') {
              assets = parent.assets;
              asset.order = (assets.length ? assets[0].order + _this.imagoConf.index : _this.imagoConf.index);
            } else {
              if (parent.assets.length) {
                orderedList = _this.reindexAll(parent.assets);
                _this.update(orderedList, {
                  save: true
                });
                asset.order = orderedList[0].order + _this.imagoConf.index;
              } else {
                asset.order = _this.imagoConf.index;
              }
              parent.sortorder = '-order';
              _this.update(parent, {
                save: true
              });
            }
          }
          asset.parent = parent._id;
          return defer.resolve(asset);
        }
      };
    })(this));
    return defer.promise;
  };

  return imagoModel;

})();

angular.module('imago.widgets.angular').service('imagoModel', ['$rootScope', '$http', '$location', '$q', 'imagoUtils', 'imagoWorker', 'imagoConf', imagoModel]);

var imagoSubmit,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

imagoSubmit = (function() {
  function imagoSubmit($http, imagoUtils) {
    return {
      getxsrf: function() {
        var url;
        url = data === 'online' && debug ? "http://" + tenant + ".imagoapp.com/api/v2/getxsrf" : "/api/v2/getxsrf";
        return $http.get(url);
      },
      formToJson: function(form) {
        var defaultFields, key, message, obj, value;
        defaultFields = ['message', 'subscribe'];
        obj = {};
        message = '';
        for (key in form) {
          value = form[key];
          if (__indexOf.call(defaultFields, key) < 0) {
            message += "" + (imagoUtils.titleCase(key)) + ": " + value + "<br><br>";
          }
          obj[key] = value || '';
        }
        obj.message = message + imagoUtils.replaceNewLines(obj.message || '');
        return angular.toJson(obj);
      },
      send: function(data) {
        return this.getxsrf().then((function(_this) {
          return function(response) {
            var postUrl, xsrfHeader;
            console.log('getxsrf success: ', response);
            xsrfHeader = {
              "Nex-Xsrf": response.data
            };
            postUrl = data === 'online' && debug ? "http://" + tenant + ".imagoapp.com/api/v2/contact" : "/api/v2/contact";
            return $http.post(postUrl, _this.formToJson(data), {
              headers: xsrfHeader
            }).then(function(response) {
              console.log('success: ', response);
              return true;
            }, function(error) {
              console.log('error: ', error);
              return false;
            });
          };
        })(this), function(error) {
          return console.log('getxsrf error: ', error);
        });
      }
    };
  }

  return imagoSubmit;

})();

angular.module('imago.widgets.angular').factory('imagoSubmit', ['$http', 'imagoUtils', imagoSubmit]);

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
        EUR: '&#128;',
        USD: '&#36;',
        SEK: 'SEK',
        YEN: '&#165;',
        GBP: '&#163;',
        GENERIC: '&#164;'
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
      replaceNewLines: function(msg) {
        return msg.replace(/(\r\n\r\n|\r\n|\n|\r)/gm, "<br>");
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

angular.module('imago.widgets.angular').factory('imagoUtils', [imagoUtils]);

var imagoWorker,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

imagoWorker = (function() {
  function imagoWorker($q) {
    this.$q = $q;
    this.work = __bind(this.work, this);
    this.create = __bind(this.create, this);
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

angular.module('imago.widgets.angular').service('imagoWorker', ['$q', imagoWorker]);

var Meta;

Meta = (function() {
  function Meta() {
    return function(input, value) {
      if (!(input && value && input.fields[value])) {
        return;
      }
      if (input.fields[value].value.type) {
        return input.fields[value].value.value;
      } else {
        return input.fields[value].value;
      }
    };
  }

  return Meta;

})();

angular.module('imago.widgets.angular').filter('meta', [Meta]);

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

angular.module('imago.widgets.angular').filter('time', [Time]);

var lodash;

lodash = angular.module('lodash', []);

lodash.factory('_', function() {
  return window._();
});
