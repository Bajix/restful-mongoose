process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';
process.env.NODE_ENV = 'test';

var fixtures = require('mongoose-fixture-factory/lib/fixtures'),
  models = require('mongoose-fixture-factory/lib/models'),
  Factory = require('mongoose-fixture-factory'),
  Vottu = require('../index'),
  sinon = require('sinon'),
  chai = require('chai');

global.Factory = Factory;
global.fixtures = fixtures;

global.sinon = sinon;
global.assert = chai.assert;
global.expect = chai.expect;

Factory.register(models, fixtures);

process.on('uncaughtException', function(err) {
  console.log(err.stack || err.message);
});
