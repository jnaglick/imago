imago.widgets.angular.directive 'imagoImage', () ->
  replace: true
  templateUrl: '/app/directives/views/image-widget.html'
  controller: ($scope, $element, $attrs, $transclude) ->

  compile: (tElement, tAttrs, transclude) ->
    pre: (scope, iElement, iAttrs, controller) ->
      @defaults =
        align     : 'center center'
        sizemode  : 'fit'
        hires     : true
        scale     : 1
        lazy      : true
        maxSize   : 2560
        responsive: true
        mediasize : false
        width     : ''
        height    : ''


      angular.forEach @defaults, (value, key) ->
        @[key] = value

      angular.forEach iAttrs, (value, key) ->
        @[key] = value

      @image = angular.copy(scope[@source])

      unless @image.serving_url then return

        # if image.width is 'auto' then image.width is iElement[0].offsetWidth
      @width    = @width    or iElement[0].clientWidth
      @height   = @height   or iElement[0].clientHeight
      @sizemode = @sizemode

      scope.elementStyle = {}

      if angular.isString(@image.resolution)
        r = @image.resolution.split('x')
        @resolution =
          width:  r[0]
          height: r[1]

      # return $log 'tried to preload during preloading!!' if @status is 'preloading'

      assetRatio = @resolution.width / @resolution.height

      # use pvrovided dimentions or current size of @el
      if @width is 'auto' or @height is 'auto'
        # fixed size asset, we have with and height
        # @log 'IfElse Block: ', width, width, height, height
        if angular.isNumber(@width) and angular.isNumber(@height)
          # @log 'fixed size', width, height

          # width = width
          # height = height

        # fit width
        else if @height is 'auto' and angular.isNumber(@width)
          # @log 'fit width', width, height
          # width = width
          @height = @width / assetRatio
          # @el.height(height)
          scope.elementStyle.height = @height


        # fit height
        else if @width is 'auto' and angular.isNumber(@height)
          # @log 'fit height', width, height
          # height = height
          @width = @height * assetRatio
          # @el.width(width)
          scope.elementStyle.width = @width

        # width and height dynamic, needs to be defined via css
        # either width height or position
        else if @height is 'auto' and @width is 'auto'
          @width = iElement[0].clientWidth
          @height = @width / assetRatio
          scope.elementStyle.height = @height

        else
          # @log 'dynamic height and width', width, height
          @width  = iElement[0].clientWidth
          @height = iElement[0].clientHeight

      # check viewport here
      # if not $.inviewport(@el, threshold: 0) and @lazy
        # @log 'in viewport: ', $.inviewport(@el, threshold: 0)
        # return

      # @log 'width, height', width, height

      # this should only be done if imageimage is not pos absolute
      # @el.height height if @el.css('position') in ['static', 'relative']

      # @status = 'preloading'

      # unbind scrollstop listener for lazy loading
      # @window.off "scrollstop.#{@id}" if @lazy

      wrapperRatio = @width / @height

      # @log 'width, height, wrapperRatio', width, height, wrapperRatio
      # debugger

      dpr = Math.ceil(window.devicePixelRatio) or 1
      # servingSize = Math.min(Math[if sizemode is 'fit' then 'min' else 'max'](width, height) * dpr, @maxSize)

      # @log 'width, height', width, height
      if sizemode is 'crop'
        if assetRatio <= wrapperRatio
          # @log 'crop full width'
          servingSize = Math.round(Math.max(@width, @width / assetRatio))
        else
          # @log 'crop full height'
          servingSize = Math.round(Math.max(@height, @height * assetRatio))

      # sizemode fit
      else
        # @log 'ratios', assetRatio, wrapperRatio
        if assetRatio <= wrapperRatio
          # @log 'fit full height', width, height, assetRatio, height * assetRatio
          servingSize = Math.round(Math.max(@height, @height * assetRatio))
        else
          # @log 'fit full width', width, height, assetRatio, height / assetRatio
          servingSize = Math.round(Math.max(@width, @width / assetRatio))

      servingSize = parseInt Math.min(servingSize * dpr, @maxSize)

      # @log 'servingSize', servingSize, width, height

      # make sure we only load a new size
      # if servingSize is @servingSize
      #   # @log 'abort load. same size', @servingSize, servingSize
      #   @status = 'loaded'
      #   return

      @servingSize = servingSize

      # @log @servingSize * @scale
      @servingUrl = "#{ @image.serving_url }=s#{ @servingSize * @scale }"

      # @log 'servingURl', @servingUrl

      # create image and bind load event
      # img = $('<img>').bind 'load', @imgLoaded
      # img.attr('src', @servingUrl)

      if sizemode is 'crop'
        # @log 'sizemode crop', assetRatio, wrapperRatio
        backgroundSize = if assetRatio < wrapperRatio then "100% auto" else "auto 100%"
      else
        # @log 'sizemode fit', assetRatio, wrapperRatio
        backgroundSize = if assetRatio > wrapperRatio then "100% auto" else "auto 100%"

      scope.imageStyle =
        "background-image"    : "url(#{ @servingUrl })"
        "background-size"     : backgroundSize
        "background-position" : @align



    post: (scope, iElement, iAttrs, controller) ->

  link: (scope, iElement, iAttrs) ->
