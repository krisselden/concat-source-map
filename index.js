var tokenize = require('esprima').tokenize;
var SourceMapGenerator = require('source-map').SourceMapGenerator;
var SourceMapConsumer = require('source-map').SourceMapConsumer;

// sourceRoot: root of sources
// file: path to concatenated file
function ConcatSourceMap(options) {
  var sourceRoot = null;
  var file = null;
  if (options) {
    sourceRoot = options.sourceRoot ? options.sourceRoot : null;
    file = options.file ? options.file : null;
  }
  this.generator = new SourceMapGenerator({file: file, sourceRoot: sourceRoot});
  this.offset = {
    line: 0,
    column: 0
  };
}

var REGEX_NEWLINE = /(\r?\n)/g;
ConcatSourceMap.prototype.moveOffset = function (sourceContent) {
  var lines = 0;
  var start = 0;
  while (REGEX_NEWLINE.test(sourceContent)) {
    lines++;
    start = REGEX_NEWLINE.lastIndex;
  }
  var offset = this.offset;
  if (lines === 0) {
    offset.column += sourceContent.length - start;
  } else {
    offset.line += lines;
    offset.column = sourceContent.length - start;
  }
};

ConcatSourceMap.prototype.addSourceFile =
  function (sourceFile, sourceContent, originalSourceMap, originalSourceMapPath) {
    var tokens = tokenize(sourceContent, {loc: true});
    this.addMappingsForTokens(sourceFile, tokens);

    if (originalSourceMap) {
      var sourceMapConsumer = new SourceMapConsumer(originalSourceMap);
      this.generator.applySourceMap(sourceMapConsumer, sourceFile, originalSourceMapPath);
    }

    this.moveOffset(sourceContent);
  };

ConcatSourceMap.prototype.addMappingsForTokens = function (source, tokens) {
  var end = null;
  var token, start, name;
  for (var i=0, l=tokens.length; i<l; i++) {
    token = tokens[i];
    start = token.loc.start;
    name = token.type === 'Identifier' ? token.value : null;
    // output end of last token if it is different
    // from the start of this token
    if (end && (start.line !== end.line || start.column !== end.column)) {
      this.addMapping(source, end);
    }
    this.addMapping(source, start, name);
    end = token.loc.end;
  }
  if (end) {
    this.addMapping(source, end);
  }
};

// add mapping to concatenated file
ConcatSourceMap.prototype.addMapping = function (source, original, name) {
  var mapping = {
    source: source,
    original: original,
    generated: this.generated(original)
  };
  if (name) {
    mapping.name = name;
  }
  this.generator.addMapping(mapping);
};

ConcatSourceMap.prototype.generated = function (original) {
  var offset = this.offset;
  return {
    line: original.line + offset.line,
    column: original.line === 1 ? original.column + offset.column : original.column
  };
};

ConcatSourceMap.prototype.setSourceContent = function (sourceFile, sourceContent) {
  this.generator.setSourceContent(sourceFile, sourceContent);
};

ConcatSourceMap.prototype.toJSON = function () {
  return this.generator.toJSON();
};

ConcatSourceMap.prototype.toString = function () {
  return JSON.stringify(this.generator.toJSON());
};

module.exports = ConcatSourceMap;
