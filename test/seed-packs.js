// Test :: Seed packs
var assert = require('chai').assert;
var countBy = require('lodash.countby');
var findRoot = require('find-root');
var harvester = require('../index');

describe('harvester: seed-packs', function() {
  var packs = harvester();
  var pack = packs[0];

  it('should automatically include seed packs (from package.json)', function() {
    assert.equal(true, packs[1].includes('@seedcss/seed-color-scheme'));
    assert.equal(true, packs[3].includes('seed-breakpoints'));
  });

  it('should include seed packs dependencies', function() {
    assert.equal(true, packs[0].includes('@seedcss/seed-config'));
    assert.equal(true, packs[2].includes('seed-props'));
  });

  it('should prefer pack dependencies specified by package.json', function() {
    var samplePack = findRoot(__dirname) + '/node_modules/pack-name/scss';
    var packDirLength = samplePack.split('/').length;
    assert.isAtLeast(packDirLength, pack.split('/').length - 1);
  });

  it('should not include duplicate seed packs or dependencies', function() {
    var packList = packs.map(function(pack) {
      pack = pack.split('/');
      return pack[pack.length - 2];
    });
    var count = countBy(packList);
    assert.equal(1, count['seed-props']);
  });
});
