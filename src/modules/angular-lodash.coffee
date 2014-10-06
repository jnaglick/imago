lodash = angular.module 'lodash', []

lodash.factory '_', () ->
  return window._()

# class _ extends Factory('lodash')

#   constructor: () ->
#     return window._()