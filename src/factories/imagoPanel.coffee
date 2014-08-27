class imagoPanel extends Factory
  #rename to imagoFetch?
  constructor: ($http, imagoUtils, $q, $location) ->

    return {

      search: (query) ->
        # console.log 'search...', query
        params = @objListToDict query
        return $http.post(@getSearchUrl(), angular.toJson(params))

      getData: (query) ->
        query = $location.$$path unless query
        # console.log 'query in getData', query
        # return console.log "Panel: query is empty, aborting #{query}" unless query
        # return if path is @path
        if angular.isString query
          query =
            [path: query]

        query = imagoUtils.toArray query


        promises = []
        data = []

        # console.log 'before', query
        angular.forEach query, (value) =>
          # console.log 'in foreach', value
          promises.push @search(value).success (response) =>
            # if the data is one single item and its a collection
            if response.length is 1 and response[0].kind is 'Collection'
              data.push response[0]
            else
              result =
                items : response
                count : response.length

              data.push result
            # else construct a result object
            # {items : data, count : data.length}

        $q.all(promises).then =>
          return data

      objListToDict: (obj_or_list) ->
        querydict = {}
        if angular.isArray(obj_or_list)
          for elem in obj_or_list
            for key of elem
              value = elem[key]
              querydict[key] or= []
              querydict[key].push(value)
        else
          for key of obj_or_list
            value = obj_or_list[key]
            querydict[key] = if angular.isArray(value) then value else [value]
        # if querydict.collection?
        #   querydict['path'] = querydict.collection
        #   delete querydict.collection
        for key in ['page', 'pagesize']
          if querydict.hasOwnProperty(key)
            querydict[key] = querydict[key][0]
        querydict

      getSearchUrl: ->
        if (data is 'online' and debug) then "http://#{tenant}.imagoapp.com/api/v3/search" else "/api/v3/search"

    }
