var EventEmitter = require('events').EventEmitter,
  handler = require('node-restify-errors'),
  Kareem = require('kareem'),
  async = require('async'),
  util = require('util');

function Resource( Model, action, options ) {
  if (!(this instanceof Resource)) {
    return new Resource(Model, action, options);
  }

  Kareem.call(this);
  EventEmitter.call(this);

  this.init.apply(this, arguments);
};

Resource.prototype = Object.create(Kareem.prototype);
Resource.prototype.constructor = Resource;

util._extend(Resource.prototype, EventEmitter.prototype);

Resource.prototype.init = function( Model, action, options ) {
  this.Model = Model;
  this.action = action;
  this.options = {};
  this.plugins = [];

  this.reservedParams = [
    '$where',
    'q',
    '_'
  ];

  util._extend(this.options, options);
};

Resource.prototype.use = function() {
  var plugins = this.plugins;

  for (var i = 0; i < arguments.length; i++) {
    var plugin = arguments[i];

    if (typeof plugin === 'string') {
      plugin = require(plugin);
    }

    if (!~plugins.indexOf(plugin)) {
      plugin.call(this, this.action, this.options);
      plugins.push(plugin);
    }
  }

  return this;
};

Resource.prototype.queryParams = function( req ) {
  var params = {};

  for (var key in req.query) {
    if (req.query.hasOwnProperty(key) && !~this.reservedParams.indexOf(key)) {
      params[key] = req.query[key];
    }
  }

  if (req.params.id) {
    params._id = req.params.id;
  }

  if (req.query.hasOwnProperty('q')) {
    params.$text = {
      $search: req.query.q
    };
  }

  this.emit('params', params, req);

  return params;
};

Resource.prototype.buildQuery = function( req ) {
  var params = this.queryParams(req),
    query;

  if (params.hasOwnProperty('$text')) {
    query = this.Model.where(params, {
      score: {
        $meta: 'textScore'
      }
    });
  } else {
    query = this.Model.where(params);
  }

  return query;
};

Resource.prototype.index = function( serializer ) {
  var self = this;

  return function( req, res, next ) {
    var done = serializer.call(this, req, res, next);

    self.emit('validate', req);

    var errors = req.validationErrors();

    if (errors) {
      return done(errors);
    }

    var context = {
      req: req
    };

    async.waterfall([
      function( cb ) {
        context.query = self.buildQuery(req).find();
        self.execPre('query', context, cb);
      },
      function( cb ) {
        context.query.exec(cb);
      },
      function( models, cb ) {
        context.models = models;

        self.execPost('query', context, [context], cb);
      },
      function( context, cb ) {
        cb(null, context.models);
      }
    ], done);
  };
};

Resource.prototype.create = function( serializer ) {
  var self = this;

  return function( req, res, next ) {
    var done = serializer.call(this, req, res, next);

    if (!req.body || Object.keys(req.body).length === 0) {
      return done(new handler.InvalidContentError('No data sent'));
    }

    self.emit('validate', req);

    var errors = req.validationErrors();

    if (errors) {
      return done(errors);
    }

    var body = util._extend({}, req.body),
      model = new self.Model();

    var context = {
      req: req,
      body: body,
      model: model
    };

    async.waterfall([
      function( cb ) {
        self.execPre('save', context, cb);
      },
      function( cb ) {
        var model = context.model,
          body = context.body;

        model.set(body);
        model.save(cb);
      }
    ], done);
  };
};

Resource.prototype.update = function( serializer ) {
  var self = this;

  return function( req, res, next ) {
    var done = serializer.call(this, req, res, next);

    if (!req.body || Object.keys(req.body).length === 0) {
      return done(new handler.InvalidContentError('No data sent'));
    }

    self.emit('validate', req);

    var errors = req.validationErrors();

    if (errors) {
      return done(errors);
    }

    var body = util._extend({}, req.body);

    var context = {
      req: req,
      body: body
    };

    async.waterfall([
      function( cb ) {
        context.query = self.buildQuery(req).findOne();
        self.execPre('query', context, cb);
      },
      function( cb ) {
        context.query.exec(cb);
      },
      function( model, cb ) {
        if (!model) {
          return cb(new handler.ResourceNotFoundError('Resource not found', {
            _id: req.params.id
          }));
        }

        context.model = model;

        self.execPost('query', context, [context], cb);
      },
      function( context, cb ) {
        self.execPre('save', context, cb);
      },
      function( cb ) {
        var model = context.model,
          body = context.body;

        model.set(body);
        model.save(cb);
      }
    ], done);
  };
};

Resource.prototype.show = function( serializer ) {
  var self = this;

  return function( req, res, next ) {
    var done = serializer.call(this, req, res, next);

    self.emit('validate', req);

    var errors = req.validationErrors();

    if (errors) {
      return done(errors);
    }

    var context = {
      req: req
    };

    async.waterfall([
      function( cb ) {
        context.query = self.buildQuery(req).findOne();
        self.execPre('query', context, cb);
      },
      function( cb ) {
        context.query.exec(cb);
      },
      function( model, cb ) {
        if (!model) {
          return cb(new handler.ResourceNotFoundError('Resource not found', {
            _id: req.params.id
          }));
        }

        context.model = model;

        self.execPost('query', context, [context], cb);
      },
      function( context, cb ) {
        cb(null, context.model);
      }
    ], done);
  };
};

Resource.prototype.destroy = function( serializer ) {
  var self = this;

  return function( req, res, next ) {
    var done = serializer.call(this, req, res, next);

    self.emit('validate', req);

    var errors = req.validationErrors();

    if (errors) {
      return done(errors);
    }

    var context = {
      req: req
    };

    async.waterfall([
      function( cb ) {
        context.query = self.buildQuery(req).findOne();
        self.execPre('query', context, cb);
      },
      function( cb ) {
        context.query.exec(cb);
      },
      function( model, cb ) {
        if (!model) {
          return cb(new handler.ResourceNotFoundError('Resource not found', {
            _id: req.params.id
          }));
        }

        context.model = model;

        self.execPost('query', context, [context], cb);
      },
      function( context, cb ) {
        self.execPre('destroy', context, cb);
      },
      function( cb ) {
        var model = context.model;

        model.remove(cb);
      }
    ], done);
  };
};

Resource.prototype.count = function( serializer ) {
  var self = this;

  return function( req, res, next ) {
    var done = serializer.call(this, req, res, next);

    self.emit('validate', req);

    var errors = req.validationErrors();

    if (errors) {
      return done(errors);
    }

    var context = {
      req: req
    };

    async.waterfall([
      function( cb ) {
        context.query = self.buildQuery(req).count();
        self.execPre('query', context, cb);
      },
      function( cb ) {
        context.query.exec(cb);
      },
      function( count, cb ) {
        cb(null, {
          count: count
        });
      }
    ], done);
  };
};

Object.defineProperty(Resource.prototype, 'middleware', {
  get: function() {
    return this[this.action];
  },
  configurable: false,
  enumerable: false,
  writeable: false
});

Resource.prototype.exec = function( serializer ) {
  return this.middleware.call(this, serializer || this.serializer);
};

Resource.prototype.serializer = function( req, res, next ) {
  return function( err, data ) {
    if (err) {
      return next(err);
    }

    res.header('Content-type', 'application/json');
    res.status(200).send(data);
  };
};


module.exports = Resource;