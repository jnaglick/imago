class Price extends Filter

  constructor: ->
    return (price) ->
      if _.isUndefined price
        return '0.00'
      else
        price = parseFloat price
        price = (price/100).toFixed(2)
        return price