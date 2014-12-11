class tagFilter extends Filter
  constructor: (imagoUtils) ->
    return (input, tag) ->
      filtered = []
      return unless input
      for asset in input
        if tag
          filtered.push asset if tag in imagoUtils.getMeta(asset, 'tags')
        else
          filtered.push asset

      filtered