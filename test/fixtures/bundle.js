(function () {
  "use strict";
  function printLine(line) {
    var div = document.createElement('div');
    div.textContent = line;
    document.body.appendChild(div);
  }
  this.printLine = printLine;
}.call(this));
(function () {
  "use strict";
  var notes = ["do", "re", "mi", "fa", "so", "la", "ti", "da"];
  function randomNote() {
    return notes[Math.floor(Math.random() * notes.length)];
  }
  function makeSong(length) {
    var song = new Array(length);
    for (var i=0; i<length; i++) {
      song[i] = randomNote();
    }
    return song;
  }
  this.makeSong = makeSong;
}.call(this));
// Generated by CoffeeScript 2.0.0-beta8
void function () {
  var button, makeSong;
  makeSong = this.makeSong;
  button = document.createElement('button');
  button.textContent = 'Make Song';
  button.addEventListener('click', function () {
    var note, song;
    song = makeSong(10);
    for (var i$ = 0, length$ = song.length; i$ < length$; ++i$) {
      note = song[i$];
      printLine(note);
    }
  });
  document.body.appendChild(button);
}.call(this);

//# sourceMappingURL=../bar.map
//# sourceMappingURL=bundle.map
