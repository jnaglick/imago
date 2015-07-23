class Price extends Filter

  constructor: ->
    return (price, decimal = 2) ->
      if _.isUndefined price
        return String(0.toFixed(decimal))
      else
        price = parseFloat price
        price = (price/100).toFixed(decimal)
        return price
