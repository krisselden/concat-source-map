var assert = require('assert');
var ConcatSourceMap = require('../index.js');
var path = require('path');
var fs = require('fs');
var SourceMapConsumer = require('source-map').SourceMapConsumer;
var assertEqualMaps = require('source-map/test/source-map/util').assertEqualMaps;

var fixtures = path.join(__dirname, 'fixtures');
function readFixture(src) {
  return fs.readFileSync(path.join(fixtures, src), {encoding:'utf8'});
}

describe('ConcatSourceMap',function () {
  beforeEach(function () {
    this.subject = new ConcatSourceMap();
  });
  describe('#generated', function () {
    beforeEach(function () {
      this.subject.offset = {
        line: 5,
        column: 20
      };
    });
    it('should offset the line and not offset column if line > 1', function () {
      var original = { line: 11, column: 15 };
      var generated = this.subject.generated(original);
      assert.equal(original.line, 11, 'original not modified');
      assert.equal(original.column, 15, 'original not modified');
      assert.equal(generated.line, 16);
      assert.equal(generated.column, 15);
    });
    it('should offset the line and offset column if line === 1', function () {
      var original = { line: 1, column: 15 };
      var generated = this.subject.generated(original);
      assert.equal(original.line, 1, 'original not modified');
      assert.equal(original.column, 15, 'original not modified');
      assert.equal(generated.line, 6);
      assert.equal(generated.column, 35);
    });
  });
  describe('#moveOffset',function () {
    it('should move the offset to the end of the content', function () {
      var content = '/*\n'+
                    ' * The quick brown fox\n'+
                    ' * jumps over the lazy dog.\n'+
                    ' */';
      var offset = this.subject.offset;
      this.subject.moveOffset(content);
      assert.equal(offset.line, 3, 'move line for 3 newlines');
      assert.equal(offset.column, 3, 'set column to 3 for incomplete 4th line');

      this.subject.moveOffset('no newlines');
      assert.equal(offset.line, 3, 'no adjustment since no newlines');
      assert.equal(offset.column, 14, 'moves column for 11 added chars');

      this.subject.moveOffset('ends with\nempty line\n');
      assert.equal(offset.line, 5, 'add 2 newlines');
      assert.equal(offset.column, 0, 'no partial line');

      // make column non-zero to ensure column is set not adjusted
      offset.column = 3;
      this.subject.moveOffset(content);
      assert.equal(offset.line, 8, 'move line for 3 newlines');
      assert.equal(offset.column, 3, 'set column to 3 for incomplete 4th line');
    });
  });
  it('should be able to be used to generate a source map for bundled js', function () {
    var subject = this.subject;
    var sourceFile, sourceContent, originalMap, originalSourceFile, originalSourceContent;

    sourceFile = 'js/print-line.js';
    sourceContent = readFixture(sourceFile);
    subject.addSourceFile(sourceFile, sourceContent);
    subject.setSourceContent(sourceFile, sourceContent);

    sourceFile = 'js/song.js';
    sourceContent = readFixture(sourceFile);
    subject.addSourceFile(sourceFile, sourceContent);
    subject.setSourceContent(sourceFile, sourceContent);

    sourceFile = 'tmp/bar.js';
    sourceContent = readFixture(sourceFile);
    originalMap = readFixture('bar.map');
    originalSourceFile = 'coffee/bar.coffee';
    originalSourceContent = readFixture(originalSourceFile);
    subject.setSourceContent(sourceFile, sourceContent);
    subject.addSourceFile(sourceFile, sourceContent, originalMap);
    // Only need if the map doesn't have the source content
    subject.setSourceContent(originalSourceFile, originalSourceContent);


    var actualMap = subject.toJSON();
    var expectedMap = JSON.parse(readFixture('bundle.map'));

    assertEqualMaps(assert, actualMap, expectedMap);
  });
});
