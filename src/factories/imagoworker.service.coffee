class imagoWorker extends Service

  constructor: (@$q) ->

  create: (path) => new Worker(path)

  work: (data) =>
    defer = @$q.defer()

    defer.reject('nodata') unless data and data.path

    worker = @create(data.path)

    worker.addEventListener 'message', (e) =>
      defer.resolve e.data
      worker.terminate()

    worker.postMessage data
    defer.promise