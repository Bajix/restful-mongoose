var Resource = require('./resource'),
  mongoose = require('mongoose'),
  util = require('util');

function Vottu( modelName, options ) {
  if (typeof modelName !== 'string') {
    return Vottu.init.apply(Vottu, arguments);
  }

  if (!(this instanceof Vottu)) {
    return new Vottu(modelName, options);
  }

  this.modelName = modelName;

  this.init(options);
}

Vottu.prototype.init = function( options ) {
  this.options = {};
  this.plugins = [];

  util._extend(this.options, options);

  if (!this.options.hasOwnProperty('toObject')) {
    this.options.toObject = {};
  }

  this.use(
    './plugins/pagination',
    './plugins/populate',
    './plugins/select',
    './plugins/sort'
  );

  return this;
};

Object.defineProperty(Vottu, 'init', {
  value: Vottu.prototype.init,
  configurable: false,
  enumerable: false,
  writeable: false
});

Object.defineProperty(Vottu, 'schemas', {
  value: mongoose.modelSchemas,
  configurable: true,
  enumerable: false,
  writeable: true
});

Vottu.prototype.use = function() {
  var plugins = this.plugins;

  for (var i = 0; i < arguments.length; i++) {
    var plugin = arguments[i];

    if (typeof plugin === 'string') {
      plugin = require(plugin);
    }

    if (!~plugins.indexOf(plugin)) {
      plugins.push(plugin);
    }
  }

  return this;
};

Object.defineProperty(Vottu, 'use', {
  value: Vottu.prototype.use,
  enumerable: false
});

function makeGetter(key, fn) {
  Object.defineProperty(Vottu.prototype, key, {
    get: function() {
      var value = fn.call(this);

      Object.defineProperty(this, key, {
        value: value,
        configurable: false,
        enumerable: false,
        writeable: false
      });

      return value;
    },
    configurable: true,
    enumerable: false,
    writeable: false
  });
}

makeGetter('schema', function() {
  return Vottu.schemas[this.modelName];
});

makeGetter('Model', function() {
  return mongoose.model(this.modelName);
});

[
  'index',
  'create',
  'show',
  'update',
  'destroy',
  'count'
].forEach(function( action ) {
  Vottu.prototype[action] = function( options ) {
    var defaults = {
      pageSize: 10,
      maxLimit: 50
    };

    var plugins = [];

    util._extend(defaults, Vottu.options);
    util._extend(defaults, this.options);

    options = util._extend(defaults, options);

    Array.prototype.push.apply(plugins, Vottu.plugins);
    Array.prototype.push.apply(plugins, this.plugins);

    var resource = new Resource(this.Model, action, options);

    resource.use.apply(resource, plugins);

    return resource;
  }
});

exports.Vottu = Vottu;