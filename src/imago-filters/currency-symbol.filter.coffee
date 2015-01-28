class CurrencySymbol extends Filter

  constructor: (imagoUtils) ->
    return (currency) ->
      return unless currency
      return imagoUtils.getCurrencySymbol currency