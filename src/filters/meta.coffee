imagoWidgets.filter "meta", () ->
  (input) ->

    unless input then return

    resources = input.split('.')
    unless resources.length is 2
      console.log 'Not enough data for meta'
      return

    unless this[resources[0]] then return

    if this[resources[0]].meta[resources[1]].value.type
      return this[resources[0]].meta[resources[1]].value.value
    else
      return this[resources[0]].meta[resources[1]].value