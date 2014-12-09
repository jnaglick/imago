class imagoSubmit extends Factory

  constructor: ($http, imagoUtils) ->
    return {

      getxsrf: () ->
        url = if (data is 'online' and debug) then "http://#{tenant}.imagoapp.com/api/v2/getxsrf" else "/api/v2/getxsrf"
        $http.get(url)

      formToJson: (form) ->
        defaultFields = ['message', 'subscribe']
        obj = {}
        message = ''
        for key, value of form
          unless key in defaultFields
            message+= "#{imagoUtils.titleCase(key)}: #{value}<br><br>"
          obj[key] = value or ''

        obj.message = message + imagoUtils.replaceNewLines(obj.message or '')

        return angular.toJson(obj)

      send: (data) ->
        @getxsrf().then (response) =>
          console.log 'getxsrf success: ', response
          xsrfHeader = {"Nex-Xsrf": response.data}
          postUrl = if (data is 'online' and debug) then "http://#{tenant}.imagoapp.com/api/v2/contact" else "/api/v2/contact"

          $http.post(postUrl,
            @formToJson(data),
            {headers: xsrfHeader}
          ). then (response) =>
            console.log 'success: ', response
            return true
          , (error) ->
            console.log 'error: ', error
            return false
        , (error) ->
          console.log 'getxsrf error: ', error

    }
