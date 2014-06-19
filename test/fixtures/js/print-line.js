(function () {
  "use strict";
  function printLine(line) {
    var div = document.createElement('div');
    div.textContent = line;
    document.body.appendChild(div);
  }
  this.printLine = printLine;
}.call(this));
