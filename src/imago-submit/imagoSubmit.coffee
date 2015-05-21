class imagoSubmit extends Service

  constructor: ($http, imagoUtils, imagoSettings) ->

    return {

      getxsrf: ->
        url = imagoSettings.host + "/getxsrf"
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
          postUrl =  imagoSettings.host + "/api/contact"

          $http.post(postUrl,
            @formToJson(data)
          ).then (response) =>
            console.log 'success: ', response
            return {status: true, message: ""}
          , (error) ->
            console.log 'error: ', error
            return {status: false, message: "could not connect to Server."}

    }
