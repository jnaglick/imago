angular.module("ImagoWidgetsTemplates", []).run(["$templateCache", function($templateCache) {$templateCache.put("/imagoWidgets/contact-widget.html","<div class=\"nex form\"><form name=\"nexContact\" ng-submit=\"submitForm(nexContact.$valid)\" novalidate=\"novalidate\"><div class=\"nex field\"><label for=\"name\">Name</label><input type=\"text\" name=\"name\" ng-model=\"contact.name\" placeholder=\"Name\" require=\"require\"/></div><div class=\"nex field\"><label for=\"email\">Email</label><input type=\"email\" name=\"email\" ng-model=\"contact.email\" placeholder=\"Email\" require=\"require\"/></div><div class=\"nex field\"><label for=\"message\">Message</label><textarea name=\"message\" ng-model=\"contact.message\" placeholder=\"Your message.\" require=\"require\"></textarea></div><div class=\"nex checkbox\"><input type=\"checkbox\" name=\"subscribe\" ng-model=\"contact.subscribe\" checked=\"checked\"/><label for=\"subscribe\">Subscribe</label></div><div class=\"formcontrols\"><button type=\"submit\" ng-disabled=\"nexContact.$invalid\" class=\"send\">Send</button></div></form><div class=\"sucess\"><span>Thank You!</span></div><div class=\"error\"><span>Error!</span></div></div>");
$templateCache.put("/imagoWidgets/image-widget.html","<div in-view=\"visible = $inview\" ng-style=\"elementStyle\" ng-class=\"status\" visible=\"visible\" class=\"imagoimage imagowrapper\"><div ng-style=\"imageStyle\" class=\"image\"></div><div class=\"loading\"><div class=\"spin\"></div><div class=\"spin2\"></div></div></div>");
$templateCache.put("/imagoWidgets/slider-widget.html","<div ng-class=\"elementStyle\"><div ng-transclude=\"ng-transclude\"></div><div ng-style=\"sliderStyle\" ng-swipe-left=\"goPrev()\" ng-swipe-right=\"goNext()\" class=\"nexslider {{confSlider.animation}}\"><div ng-show=\"confSlider.enablearrows &amp;&amp; loadedData\" ng-click=\"goPrev()\" class=\"prev\"></div><div ng-show=\"confSlider.enablearrows &amp;&amp; loadedData\" ng-click=\"goNext()\" class=\"next\"></div><div ng-class=\"{\'active\': $index === currentIndex, \'nextslide\': $index === nextIndex, \'prevslide\': $index === prevIndex}\" ng-repeat=\"slide in slideSource\" ng-show=\"displaySlides($index)\" class=\"slide\"><div imago-image=\"imago-image\" dimensions=\"dimensions\" source=\"slide\" sizemode=\"{{ $parent.confSlider.sizemode }}\"></div></div></div></div>");
$templateCache.put("/imagoWidgets/video-widget.html","<div class=\"imagovideo {{optionsVideo.align}} {{optionsVideo.size}} {{optionsVideo.sizemode}}\"><div ng-style=\"wrapperStyle\" ng-click=\"videoActive = true\" class=\"imagowrapper\"><a ng-click=\"togglePlay()\" ng-class=\"{ playing : optionsVideo.playing}\" class=\"playbig fa fa-play\"></a><video ng-style=\"videoStyle\" ng-show=\"videoActive\"><source ng-repeat=\"format in videoFormats\" src=\"{{format.src}}\" data-size=\"{{format.size}}\" data-codec=\"{{format.codec}}\" type=\"{{format.type}}\"/></video><div ng-hide=\"!controls\" class=\"controls\"><a ng-click=\"togglePlay()\" ng-hide=\"optionsVideo.playing\" class=\"play fa fa-play\"></a><a ng-click=\"togglePlay()\" ng-show=\"optionsVideo.playing\" class=\"pause fa fa-pause\"></a><span class=\"time\">{{time}}</span><span class=\"seekbar\"><input type=\"range\" ng-model=\"seekTime\" ng-change=\"seek(seekTime)\" class=\"seek\"/></span><a ng-click=\"toggleSize()\" class=\"size\">hd</a><span class=\"volume\"><span ng-click=\"volumeUp()\" class=\"fa fa-volume-up icon-volume-up\"></span><input type=\"range\" ng-model=\"volumeInput\" ng-change=\"onVolumeChange(volumeInput)\"/><span ng-click=\"volumeDown()\" class=\"fa fa-volume-down icon-volume-down\"></span></span><a ng-click=\"fullScreen()\" class=\"fullscreen fa fa-expand\"></a><a class=\"screen fa fa-compress\"></a></div></div></div>");}]);
var App;

App = (function() {
  function App() {
    return ['ImagoWidgetsTemplates'];
  }

  return App;

})();

angular.module('imago.widgets.angular', App());

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

var imagoImage;

imagoImage = (function() {
  function imagoImage($window, $q) {
    return {
      replace: true,
      scope: true,
      templateUrl: '/imagoWidgets/image-widget.html',
      controller: function($scope, $element, $attrs) {
        return $scope.status = 'loading';
      },
      link: function(scope, element, attrs) {
        var defaults, key, opts, render, self, source, sourcePromise, value, visiblePromise;
        self = {};
        opts = {};
        source = {};
        defaults = {
          align: 'center center',
          sizemode: 'fit',
          hires: true,
          responsive: true,
          scale: 1,
          lazy: true,
          maxsize: 2560,
          mediasize: false,
          width: '',
          height: '',
          responsive: true
        };
        for (key in defaults) {
          value = defaults[key];
          opts[key] = value;
        }
        for (key in attrs) {
          value = attrs[key];
          opts[key] = value;
        }
        if (opts.lazy) {
          visiblePromise = (function(_this) {
            return function() {
              var deffered;
              deffered = $q.defer();
              self.visibleFunc = scope.$watch(attrs['visible'], function(value) {
                if (!value) {
                  return;
                }
                return deffered.resolve(value);
              });
              return deffered.promise;
            };
          })(this)();
        }
        sourcePromise = (function(_this) {
          return function() {
            var deffered;
            deffered = $q.defer();
            self.watch = scope.$watch(attrs['source'], function(data) {
              if (!data) {
                return;
              }
              return deffered.resolve(data);
            });
            return deffered.promise;
          };
        })(this)();
        sourcePromise.then((function(_this) {
          return function(data) {
            if (!attrs['watch']) {
              self.watch();
            }
            source = data;
            if (opts.lazy) {
              return visiblePromise.then(function(value) {
                self.visibleFunc();
                return render(source);
              });
            } else {
              return render(data);
            }
          };
        })(this));
        render = (function(_this) {
          return function(data) {
            var dpr, height, img, r, servingSize, servingUrl, width, wrapperRatio;
            if (!(data != null ? data.serving_url : void 0)) {
              element.remove();
              return;
            }
            if (opts.dimensions && attrs['dimensions']) {
              scope.$watch(attrs['dimensions'], function(value) {
                return angular.forEach(value, function(value, key) {
                  return opts[key] = value;
                });
              });
            }
            if (!scope.elementStyle) {
              scope.elementStyle = {};
            }
            if (angular.isString(data.resolution)) {
              r = data.resolution.split('x');
              opts.resolution = {
                width: r[0],
                height: r[1]
              };
              opts.assetRatio = r[0] / r[1];
            }
            if (opts.width && opts.height) {
              width = parseInt(opts.width);
              height = parseInt(opts.height);
            } else {
              width = element[0].clientWidth;
              height = element[0].clientHeight;
            }
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
            servingUrl = "" + data.serving_url + "=s" + (servingSize * opts.scale);
            opts.servingSize = servingSize;
            scope.imageStyle = {};
            if (!opts.responsive) {
              scope.imageStyle.width = "" + (parseInt(width, 10)) + "px";
              scope.imageStyle.height = "" + (parseInt(height, 10)) + "px";
            }
            img = angular.element('<img>');
            img.on('load', function(e) {
              scope.imageStyle.backgroundImage = "url(" + servingUrl + ")";
              scope.imageStyle.backgroundSize = scope.calcMediaSize();
              scope.imageStyle.backgroundPosition = opts.align;
              scope.imageStyle.display = 'inline-block';
              scope.status = 'loaded';
              return scope.$apply();
            });
            return img[0].src = servingUrl;
          };
        })(this);
        scope.onResize = (function(_this) {
          return function() {
            return scope.imageStyle['background-size'] = scope.calcMediaSize();
          };
        })(this);
        scope.calcMediaSize = (function(_this) {
          return function() {
            var wrapperRatio;
            opts.width = element[0].clientWidth || opts.width;
            opts.height = element[0].clientHeight || opts.height;
            if (!(opts.width && opts.height)) {
              return;
            }
            wrapperRatio = opts.width / opts.height;
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
        scope.$on('resizelimit', (function(_this) {
          return function() {
            if (opts.responsive) {
              return scope.onResize();
            }
          };
        })(this));
        return scope.$on('resizestop', (function(_this) {
          return function() {
            if (opts.responsive) {
              return render(source);
            }
          };
        })(this));
      }
    };
  }

  return imagoImage;

})();

angular.module('imago.widgets.angular').directive('imagoImage', ['$window', '$q', imagoImage]);

var addWindowInViewItem, bindWindowEvents, checkInView, debounce, getBoundingClientRect, getViewportHeight, inView, removeWindowInViewItem, triggerInViewCallback, unbindWindowEvents, windowCheckInViewDebounced, windowEventsHandler, _windowEventsHandlerBinded, _windowInViewItems;

inView = (function() {
  function inView($parse) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs, containerController) {
        var inViewFunc, item, performCheckDebounced;
        if (!attrs.inView) {
          return;
        }
        inViewFunc = $parse(attrs.inView);
        item = {
          element: element,
          wasInView: false,
          offset: 0,
          callback: function($inview, $inviewpart) {
            return scope.$apply((function(_this) {
              return function() {
                return inViewFunc(scope, {
                  '$element': element[0],
                  '$inview': $inview,
                  '$inviewpart': $inviewpart
                });
              };
            })(this));
          }
        };
        performCheckDebounced = windowCheckInViewDebounced;
        addWindowInViewItem(item);
        performCheckDebounced();
        if (attrs.inViewOffset != null) {
          attrs.$observe('inViewOffset', function(offset) {
            item.offset = scope.$eval(offset) || 0;
            return performCheckDebounced();
          });
        }
        return scope.$on('$destroy', function() {
          return removeWindowInViewItem(item);
        });
      }
    };
  }

  return inView;

})();

_windowInViewItems = [];

addWindowInViewItem = function(item) {
  _windowInViewItems.push(item);
  return bindWindowEvents();
};

removeWindowInViewItem = function(item) {
  var i;
  _windowInViewItems = (function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = _windowInViewItems.length; _i < _len; _i++) {
      i = _windowInViewItems[_i];
      if (i !== item) {
        _results.push(i);
      }
    }
    return _results;
  })();
  return unbindWindowEvents();
};

_windowEventsHandlerBinded = false;

windowEventsHandler = function() {
  if (_windowInViewItems.length) {
    return windowCheckInViewDebounced();
  }
};

bindWindowEvents = function() {
  if (_windowEventsHandlerBinded) {
    return;
  }
  _windowEventsHandlerBinded = true;
  return angular.element(window).bind('checkInView click ready scroll resize', windowEventsHandler);
};

unbindWindowEvents = function() {
  if (!_windowEventsHandlerBinded) {
    return;
  }
  if (_windowInViewItems.length) {
    return;
  }
  _windowEventsHandlerBinded = false;
  return angular.element(window).unbind('checkInView click ready scroll resize', windowEventsHandler);
};

triggerInViewCallback = function(item, inview, isTopVisible, isBottomVisible) {
  var el, inviewpart;
  if (inview) {
    el = item.element[0];
    inviewpart = (isTopVisible && 'top') || (isBottomVisible && 'bottom') || 'both';
    if (!(item.wasInView && item.wasInView === inviewpart && el.offsetTop === item.lastOffsetTop)) {
      item.lastOffsetTop = el.offsetTop;
      item.wasInView = inviewpart;
      return item.callback(true, inviewpart);
    }
  } else if (item.wasInView) {
    item.wasInView = false;
    return item.callback(false);
  }
};

checkInView = function(items, container) {
  var bounds, element, item, viewport, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3, _results;
  viewport = {
    top: 0,
    bottom: getViewportHeight()
  };
  if (container && container !== window) {
    bounds = getBoundingClientRect(container);
    if (bounds.top > viewport.bottom || bounds.bottom < viewport.top) {
      for (_i = 0, _len = items.length; _i < _len; _i++) {
        item = items[_i];
        triggerInViewCallback(item, false);
      }
      return;
    }
    if (bounds.top > viewport.top) {
      viewport.top = bounds.top;
    }
    if (bounds.bottom < viewport.bottom) {
      viewport.bottom = bounds.bottom;
    }
  }
  _results = [];
  for (_j = 0, _len1 = items.length; _j < _len1; _j++) {
    item = items[_j];
    element = item.element[0];
    bounds = getBoundingClientRect(element);
    bounds.top += (_ref = (_ref1 = item.offset) != null ? _ref1[0] : void 0) != null ? _ref : item.offset;
    bounds.bottom += (_ref2 = (_ref3 = item.offset) != null ? _ref3[1] : void 0) != null ? _ref2 : item.offset;
    if (bounds.top < viewport.bottom && bounds.bottom >= viewport.top) {
      _results.push(triggerInViewCallback(item, true, bounds.bottom > viewport.bottom, bounds.top < viewport.top));
    } else {
      _results.push(triggerInViewCallback(item, false));
    }
  }
  return _results;
};

getViewportHeight = function() {
  var height, mode, _ref;
  height = window.innerHeight;
  if (height) {
    return height;
  }
  mode = document.compatMode;
  if (mode || !(typeof $ !== "undefined" && $ !== null ? (_ref = $.support) != null ? _ref.boxModel : void 0 : void 0)) {
    height = mode === 'CSS1Compat' ? document.documentElement.clientHeight : document.body.clientHeight;
  }
  return height;
};

getBoundingClientRect = function(element) {
  var el, parent, top;
  top = 0;
  el = element;
  while (el) {
    top += el.offsetTop;
    el = el.offsetParent;
  }
  parent = element.parentElement;
  while (parent) {
    if (parent.scrollTop != null) {
      top -= parent.scrollTop;
    }
    parent = parent.parentElement;
  }
  return {
    top: top,
    bottom: top + element.offsetHeight
  };
};

debounce = function(f, t) {
  var timer;
  timer = null;
  return function() {
    if (timer != null) {
      clearTimeout(timer);
    }
    return timer = setTimeout(f, t != null ? t : 100);
  };
};

windowCheckInViewDebounced = debounce(function() {
  return checkInView(_windowInViewItems);
});

angular.module('imago.widgets.angular').directive('inView', ['$parse', inView]);

var imagoSlider;

imagoSlider = (function() {
  function imagoSlider($q, $window, imagoPanel) {
    return {
      replace: true,
      scope: true,
      transclude: true,
      templateUrl: '/imagoWidgets/slider-widget.html',
      controller: function($scope) {
        $scope.confSlider = {};
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
        return angular.forEach(this.defaults, function(value, key) {
          return $scope.confSlider[key] = value;
        });
      },
      link: function(scope, element, attrs) {
        var getSiblings, prepareSlides, self, sourcePromise;
        self = {};
        angular.forEach(attrs, function(value, key) {
          return scope.confSlider[key] = value;
        });
        sourcePromise = (function(_this) {
          return function() {
            var deffered;
            deffered = $q.defer();
            self.watch = scope.$watch(attrs['source'], function(data) {
              if (!data) {
                return;
              }
              return deffered.resolve(data);
            });
            return deffered.promise;
          };
        })(this)();
        sourcePromise.then((function(_this) {
          return function(data) {
            if (!data) {
              return;
            }
            if (!attrs['watch']) {
              self.watch();
            }
            if (!angular.isArray(data)) {
              return imagoPanel.getData(data.path).then(function(response) {
                data = response[0].items;
                return prepareSlides(data);
              });
            } else {
              return prepareSlides(data);
            }
          };
        })(this));
        prepareSlides = function(data) {
          var item, _i, _len, _ref;
          scope.loadedData = true;
          scope.slideSource = [];
          scope.dimensions = {
            width: element[0].clientWidth,
            height: element[0].clientHeight
          };
          for (_i = 0, _len = data.length; _i < _len; _i++) {
            item = data[_i];
            if (item.serving_url) {
              scope.slideSource.push(item);
            }
          }
          if (((_ref = scope.slideSource) != null ? _ref.length : void 0) <= 1 || !scope.slideSource) {
            scope.confSlider.enablearrows = false;
            scope.confSlider.enablekeys = false;
          }
          scope.currentIndex = 0;
          scope.sliderLength = scope.slideSource.length - 1;
          return getSiblings();
        };
        scope.setCurrentSlideIndex = function(index) {
          scope.currentIndex = index;
          return getSiblings();
        };
        scope.displaySlides = function(index) {
          if (index === scope.currentIndex || scope.nextIndex || scope.prevIndex) {
            return true;
          }
        };
        scope.goNext = function() {
          scope.currentIndex = scope.currentIndex < scope.slideSource.length - 1 ? ++scope.currentIndex : 0;
          return getSiblings();
        };
        scope.goPrev = function() {
          scope.currentIndex = scope.currentIndex > 0 ? --scope.currentIndex : scope.slideSource.length - 1;
          return getSiblings();
        };
        getSiblings = function() {
          scope.nextIndex = scope.currentIndex === scope.sliderLength ? 0 : scope.currentIndex + 1;
          return scope.prevIndex = scope.currentIndex === 0 ? scope.sliderLength : scope.currentIndex - 1;
        };
        scope.getLast = function() {
          return scope.slideSource.length - 1;
        };
        return angular.element($window).on('keydown', function(e) {
          if (!scope.confSlider.enablekeys) {
            return;
          }
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
    };
  }

  return imagoSlider;

})();

angular.module('imago.widgets.angular').directive('imagoSlider', ['$q', '$window', 'imagoPanel', imagoSlider]);

var imagoVideo;

imagoVideo = (function() {
  function imagoVideo() {
    return {
      replace: true,
      scope: true,
      templateUrl: '/imagoWidgets/video-widget.html',
      controller: function($scope, $element, $attrs, $transclude, $window, imagoUtils, $timeout) {
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
          height: '',
          hires: true
        };
        this.timeLineEl = document.getElementsByTagName('input')[0];
        $scope.seekTime = this.timeLineEl.value = 0;
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
        if (!!+this.width) {
          this.orgWidth = this.width = +this.width;
        }
        if (!!+this.height) {
          this.orgHeight = this.height = +this.height;
        }
        this.videoEl = $element[0].children[0].children[1];
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
            $scope.seekTime = parseFloat((_this.videoEl.currentTime / _this.videoEl.duration) * 100);
            updateTime(_this.videoEl.currentTime);
            if (!$scope.$$phase) {
              return $scope.$apply();
            }
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
            if (!(_this.width && _this.height)) {
              _this.width = $element[0].clientWidth;
              _this.height = $element[0].clientHeight;
            }
            $scope.wrapperStyle.backgroundPosition = "" + _this.align;
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
            $scope.wrapperStyle.backgroundImage = "url(" + _this.serving_url + ")";
            $scope.wrapperStyle.backgroundRepeat = "no-repeat";
            $scope.wrapperStyle.backgroundSize = "auto 100%";
            $scope.wrapperStyle.width = angular.isNumber(_this.orgWidth) ? _this.orgWidth : $element[0].clientWidth || parseInt(_this.width);
            $scope.wrapperStyle.height = angular.isNumber(_this.orgHeight) ? _this.orgHeight : $element[0].clientHeight || parseInt(_this.height);
            return $scope.videoStyle = {
              "autoplay": $scope.optionsVideo.autoplay,
              "preload": $scope.optionsVideo.preload,
              "autobuffer": $scope.optionsVideo.autobuffer,
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
        $scope.togglePlay = (function(_this) {
          return function() {
            if (!_this.videoEl.paused) {
              _this.videoEl.pause();
              return $scope.optionsVideo.playing = false;
            } else {
              console.log('play');
              _this.videoEl.play();
              $scope.optionsVideo.playing = true;
              if (!$scope.$$phase) {
                return $scope.$apply();
              }
            }
          };
        })(this);
        setSize = function(size) {
          return console.log('******** setSize, nothing here');
        };
        $scope.toggleSize = function() {
          if ($scope.optionsVideo.size === 'hd') {
            $scope.optionsVideo.size = 'sd';
          } else {
            $scope.optionsVideo.size = 'hd';
          }
          return $scope.videoFormats.reverse();
        };
        $scope.seek = (function(_this) {
          return function(time) {
            return _this.videoEl.currentTime = parseFloat(time / 100 * _this.videoEl.duration);
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
                ws.backgroundPosition = _this.align;
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
                ws.backgroundPosition = _this.align;
              }
            } else if (_this.sizemode === 'fit') {
              width = angular.isNumber(_this.orgWidth) ? _this.orgWidth : $element[0].clientWidth || parseInt(_this.width);
              height = angular.isNumber(_this.orgHeight) ? _this.orgHeight : $element[0].clientHeight || parseInt(_this.height);
              wrapperRatio = width / height;
              if (_this.assetRatio > wrapperRatio) {
                vs.width = '100%';
                vs.height = imagoUtils.isiOS() ? '100%' : 'auto';
                ws.backgroundSize = '100% auto';
                ws.backgroundPosition = _this.align;
                ws.width = "" + width + "px";
                ws.height = "" + (parseInt(width / _this.assetRatio, 10)) + "px";
              } else {
                vs.width = imagoUtils.isiOS() ? '100%' : 'auto';
                vs.height = '100%';
                ws.backgroundSize = 'auto 100%';
                ws.backgroundPosition = _this.align;
                ws.height = "" + height + "px";
                ws.width = "" + (parseInt(height * _this.assetRatio, 10)) + "px";
              }
            }
            if (!$scope.$$phase) {
              return $scope.$apply($scope.wrapperStyle);
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
        if (!(angular.isNumber(this.orgWidth) && angular.isNumber(this.orgHeight))) {
          return $scope.$on('resizelimit', resize);
        }
      }
    };
  }

  return imagoVideo;

})();

angular.module('imago.widgets.angular').directive('imagoVideo', [imagoVideo]);

var imagoPanel;

imagoPanel = (function() {
  function imagoPanel($http, imagoUtils, $q, $location) {
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
  }

  return imagoPanel;

})();

angular.module('imago.widgets.angular').factory('imagoPanel', ['$http', 'imagoUtils', '$q', '$location', imagoPanel]);

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
        if (!asset.meta[attribute]) {
          return console.log("This asset does not contain a " + attribute + " attribute");
        }
        return asset.meta[attribute].value;
      }
    };
  }

  return imagoUtils;

})();

angular.module('imago.widgets.angular').factory('imagoUtils', [imagoUtils]);

var Meta;

Meta = (function() {
  function Meta() {
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
  }

  return Meta;

})();

angular.module('imago.widgets.angular').filter('meta', [Meta]);
