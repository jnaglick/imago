class ImagoCartUtils extends Factory

  constructor: ->

    return {

      updateItem: (item) ->
        return item unless item.changed.length
        if item.qty > item.stock
          item.qty = item.stock
          item.updates.push 'quantity'
        if 'price' in item.changed
          item.price = item.fields?.price?.value
          item.updates.push 'price'
        if 'discountedPrice' in item.changed and item.fields?.discountedPrice?.value?[@currency]
          item.price = item.fields?.discountedPrice?.value
          item.updates.push('price') unless 'price' in item.updates

        return item

    }
