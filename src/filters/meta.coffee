class Meta extends Filter

  constructor: () ->
    return (input) ->
      return unless input

      resources = input.split('.')
      unless resources.length is 2
        console.log 'Not enough data for meta'
        return

      return unless this[resources[0]] or this[resources[0]].meta[resources[1]].value

      if this[resources[0]].meta[resources[1]].value.type
        return this[resources[0]].meta[resources[1]].value.value
      else
        return this[resources[0]].meta[resources[1]].value
