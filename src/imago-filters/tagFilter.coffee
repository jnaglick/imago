class tagFilter extends Filter
  constructor: (imagoUtils) ->
    return (input, tag) ->
      return unless input
      if tag
        filtered = []
        for asset in input
          tags = imagoUtils.getMeta(asset, 'tags')
          filtered.push asset if tags and tag in tags
        return filtered
      else
        return input