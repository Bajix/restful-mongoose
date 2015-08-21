process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';
process.env.NODE_ENV = 'test';

var fixtures = require('mongoose-fixture-factory/lib/fixtures'),
  models = require('mongoose-fixture-factory/lib/models'),
  Factory = require('mongoose-fixture-factory'),
  chai = require('chai');

global.assert = chai.assert;
global.expect = chai.expect;

Factory.register(models, fixtures);