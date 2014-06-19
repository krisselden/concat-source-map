makeSong = @makeSong
button = document.createElement 'button'
button.textContent = 'Make Song'
button.addEventListener 'click', ->
  song = makeSong 10
  for note in song
    printLine note
  return
document.body.appendChild button
