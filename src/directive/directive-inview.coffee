class inView extends Directive
	constructor: ($parse) ->
		return {
			restrict: 'A'
			link: (scope, element, attrs, containerController) ->
				# console.log 'containerController: ', containerController
				return unless attrs.inView
				inViewFunc = $parse(attrs.inView)
				item =
					element: element
					wasInView: no
					offset: 0
					callback: ($inview, $inviewpart) -> scope.$apply =>
						inViewFunc scope,
							'$element': element[0]
							'$inview': $inview
							'$inviewpart': $inviewpart
				# Add item to proper list
				performCheckDebounced = windowCheckInViewDebounced

				addWindowInViewItem item
				# Perform initial check
				do performCheckDebounced
				# Check for offset
				if attrs.inViewOffset?
					attrs.$observe 'inViewOffset', (offset) ->
						item.offset = scope.$eval(offset) or 0
						do performCheckDebounced
				# Handle element removal
				scope.$on '$destroy', ->
					removeWindowInViewItem item
			}


_windowInViewItems = []
addWindowInViewItem = (item) ->
	_windowInViewItems.push item
	do bindWindowEvents
removeWindowInViewItem = (item) ->
	_windowInViewItems = (i for i in _windowInViewItems when i isnt item)
	do unbindWindowEvents

# Window events handler management
_windowEventsHandlerBinded = no
windowEventsHandler = ->
	do windowCheckInViewDebounced if _windowInViewItems.length

bindWindowEvents = ->
	return if _windowEventsHandlerBinded
	_windowEventsHandlerBinded = yes
	angular.element(window).bind 'checkInView click ready scroll resize', windowEventsHandler

unbindWindowEvents = ->
	return unless _windowEventsHandlerBinded
	return if _windowInViewItems.length
	_windowEventsHandlerBinded = no
	angular.element(window).unbind 'checkInView click ready scroll resize', windowEventsHandler

# Perform inview expression if neccessary
triggerInViewCallback = (item, inview, isTopVisible, isBottomVisible) ->
	if inview
		el = item.element[0]
		inviewpart = (isTopVisible and 'top') or (isBottomVisible and 'bottom') or 'both'
		unless item.wasInView and item.wasInView == inviewpart and el.offsetTop == item.lastOffsetTop
			item.lastOffsetTop = el.offsetTop
			item.wasInView = inviewpart
			item.callback yes, inviewpart
	else if item.wasInView
		item.wasInView = no
		item.callback no

# Check if items are inview and perform callbacks
checkInView = (items, container) ->
	# Calculate viewport
	viewport =
		top: 0
		bottom: getViewportHeight()
	# Restrict viewport if a container is specified
	if container and container isnt window
		bounds = getBoundingClientRect container
		# Shortcut to all item not in view if container isn't itself
		if bounds.top > viewport.bottom or bounds.bottom < viewport.top
			triggerInViewCallback(item, false) for item in items
			return
		# Actual viewport restriction
		viewport.top = bounds.top if bounds.top > viewport.top
		viewport.bottom = bounds.bottom if bounds.bottom < viewport.bottom
	# Calculate inview status for each item
	for item in items
		# Get the bounding top and bottom of the element in the viewport
		element = item.element[0]
		bounds = getBoundingClientRect element
		# Apply offset
		bounds.top += item.offset?[0] ? item.offset
		bounds.bottom += item.offset?[1] ? item.offset
		# Calculate parts in view
		if bounds.top < viewport.bottom and bounds.bottom >= viewport.top
			triggerInViewCallback(item, true, bounds.bottom > viewport.bottom, bounds.top < viewport.top)
		else
			triggerInViewCallback(item, false)

# Utility functions

getViewportHeight = ->
	height = window.innerHeight
	return height if height

	mode = document.compatMode

	if mode or not $?.support?.boxModel
		height = if mode is 'CSS1Compat' then document.documentElement.clientHeight else document.body.clientHeight

	height

getBoundingClientRect = (element) ->
	# return element.getBoundingClientRect() if element.getBoundingClientRect?
	top = 0
	el = element
	while el
		top += el.offsetTop
		el = el.offsetParent
	parent = element.parentElement
	while parent
		top -= parent.scrollTop if parent.scrollTop?
		parent = parent.parentElement
	return {
		top: top
		bottom: top + element.offsetHeight
	}

debounce = (f, t) ->
	timer = null
	->
		clearTimeout timer if timer?
		timer = setTimeout f, (t ? 100)

windowCheckInViewDebounced = debounce -> checkInView _windowInViewItems
