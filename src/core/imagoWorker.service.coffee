class imagoWorker extends Service

  store: []

  constructor: (@$q, @$http) ->

  create: (path, data, defer) =>
    worker = new Worker(path)

    worker.addEventListener 'message', (e) =>
      defer.resolve e.data
      worker.terminate()

    worker.postMessage data

  work: (data) =>
    defer = @$q.defer()

    defer.reject('nodata or path') unless data and data.path

    find = _.find @store, {'path': data.path}
    if bowser?.msie
      @create data.path, data, defer
    else if find
      @create find.blob, data, defer
    else
      windowURL = window.URL or window.webkitURL
      @$http.get(data.path, {cache: true}).then (response) =>
        stringified = response.data.toString()
        blob = new Blob([stringified], {type: 'application/javascript'})
        blobURL = windowURL.createObjectURL(blob)

        @store.push {'path': data.path, 'blob': blobURL}

        @create blobURL, data, defer

    defer.promise
