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
