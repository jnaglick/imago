class imagoSubmit extends Factory

  constructor: ($http, imagoUtils, $q, $location) ->
    return {

      xsrfHeader: ''

      getxsrf: () =>
        url = if (data is 'online' and debug) then "http://#{tenant}.imagoapp.com/api/v2/getxsrf" else "/api/v2/getxsrf"
        $http.get(url).then (response) =>
          console.log 'response: ', response
          @xsrfHeader = response
        , (error) ->
          console.log 'error: ', error
          return error

      formToJson: (form) =>
        console.log 'form: ', form
        return angular.toJson(form)

      send: (data) ->
        @getxsrf()
        return console.log @getxsrf() unless @xsrfHeader

        $http.post( @formToJson(data),
          if (data is 'online' and debug) then "http://#{tenant}.imagoapp.com/api/v2/contact" else "/api/v2/contact",
          {xsrfHeaderName: @xsrfHeader}
        ). then (response) =>
          console.log response
          return true
        , (error) ->
          console.log 'error: ', error
          return false

    }
