class imagoWorker extends Service

  constructor: (@$q, workerSettings) ->
    @path = workerSettings

  create: () =>
    new Worker(@path)

  reorder: (data) =>
    defer = @$q.defer()

    defer.reject('nodata') unless data

    worker = @create()

    worker.addEventListener 'message', (e) =>
        defer.resolve e.data

    , false

    worker.postMessage data
    defer.promise

