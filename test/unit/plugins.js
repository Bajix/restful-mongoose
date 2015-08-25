var errorHandler = require('express-error-funnel'),
  validator = require('express-validator'),
  handler = require('node-restify-errors'),
  bodyParser = require('body-parser'),
  request = require('supertest'),
  Vottu = require('vottu').Vottu,
  express = require('express'),
  user = fixtures.User[0],
  util = require('util'),
  url = require('url');

Vottu();

describe('Plugins', function() {
  before(Factory.fill);
  beforeEach(function() {
    var app = express();

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
      extended: true
    }));

    app.use(validator());

    this.app = app;

    this.agent = request.agent(app);
  });

  describe('Helpers', function() {

    describe('Select', function() {
      it('sanitizes select', function( done ) {
        var index = new Vottu('User').index(),
          app = this.app;

        index.on('validate', function( req ) {
          req.checkQuery('select.admin').equals(1);
        });

        app.get('/users.:format?', index.exec());

        app.use(errorHandler);

        var uri = url.format({
          pathname: '/users',
          query: {
            select: 'admin'
          }
        });

        this.agent.get(uri)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(done);
      });
    });
  });

  describe('Query Filters', function() {
    beforeEach(function() {
      var vottu = new Vottu('User'),
        app = this.app;

      vottu.use(function() {
        this.pre('query', function() {
          this.query.sort('createdAt');
        });
      });

      app.get('/users.:format?', vottu.index().exec());
      app.get('/users/:id.:format?', vottu.show().exec());

      app.use(errorHandler);
    });

    describe('Pagination', function() {
      it('validates limit', function( done ) {
        var uri = url.format({
          pathname: '/users',
          query: {
            limit: 0
          }
        });

        this.agent.get(uri)
          .expect('Content-Type', /json/)
          .expect(400)
          .end(done);
      });

      it('validates skip', function( done ) {
        var uri = url.format({
          pathname: '/users',
          query: {
            skip: 0
          }
        });

        this.agent.get(uri)
          .expect('Content-Type', /json/)
          .expect(400)
          .end(done);
      });

      it('validates page', function( done ) {
        var uri = url.format({
          pathname: '/users',
          query: {
            p: 0
          }
        });

        this.agent.get(uri)
          .expect('Content-Type', /json/)
          .expect(400)
          .end(done);
      });

      it('paginates documents', function( done ) {
        var users = fixtures.User.sort(function( a, b ) {
          return Date.parse(a.createdAt) - Date.parse(b.createdAt);
        });

        var uri = url.format({
          pathname: '/users',
          query: {
            limit: 1,
            p: users.length
          }
        });

        this.agent.get(uri)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function( err, res ){
            if (err) {
              return done(err);
            }
            assert.lengthOf(res.body, 1);
            assert.propertyVal(res.body[0], '_id', users[users.length -1]._id);
            done();
          });
      });
    });

    describe('Select', function() {
      it('selects fields', function( done ) {
        var users = fixtures.User.sort(function( a, b ) {
          return Date.parse(a.createdAt) - Date.parse(b.createdAt);
        });

        var uri = url.format({
          pathname: '/users',
          query: {
            select: '+createdAt -name'
          }
        });

        this.agent.get(uri)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function( err, res ){
            if (err) {
              return done(err);
            }

            var users = res.body;

            for (var i = 0; i < users.length; i++) {
              var user = users[i];
              assert.property(user, 'createdAt');
              assert.notProperty(user, 'name');
            }

            done();
          });
        });
    });
  });
});