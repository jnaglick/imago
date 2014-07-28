class Time extends Filter

  constructor: () ->
    return (input) ->
      return unless input

      pad = (num) ->
        return "0" + num  if num < 10
        num

      calc = []
      minutes = Math.floor(input / 60)
      hours = Math.floor(input / 3600)
      seconds = (if (input is 0) then 0 else (input % 60))
      seconds = Math.round(seconds)
      calc.push pad(hours)  if hours > 0
      calc.push pad(minutes)
      calc.push pad(seconds)

      return calc.join ":"
