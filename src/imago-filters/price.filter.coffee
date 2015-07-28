class Price extends Filter

  constructor: (imagoUtils) ->
    return (price, decimal = 2) ->
      if _.isUndefined price
        return String(0.toFixed(decimal))
      else
        format = 1000.5.toLocaleString()
        price = Number(price) / 100
        return imagoUtils.formatCurrency(price, decimal, format.charAt(5), format.charAt(1))