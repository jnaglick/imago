class Meta extends Filter

  constructor: () ->
    return (input,value) ->
      return unless input and value and input.fields[value]

      if input.fields[value].kind is 'file'
        return input.fields[value].download_url
      else if input.fields[value].kind is 'markup'
        return input.fields[value].value.value
      else
        return input.fields[value].value
