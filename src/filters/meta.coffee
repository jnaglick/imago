class Meta extends Filter

  constructor: () ->
    return (input,value) ->
      return unless input and value

      if input.fields[value].value.type
        return input.fields[value].value.value
      else
        return input.fields[value].value
