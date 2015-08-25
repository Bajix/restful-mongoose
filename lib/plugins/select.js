var util = require('util');

module.exports = function( action, options ) {
  this.reservedParams.push('select');

  var Model = this.Model;

  if (/(index|show|update)/.test(action)) {
    this.on('sanitize', function( req ) {
      var select = req.query.select;

      if (select) {
        var fields = Model.where().select(select)._fields

        if (fields) {
          req.query.select = util._extend({}, fields);
        } else {
          delete req.query.select;
        }
      }
    });

    this.pre('query', function() {
      if (this.req.query.select) {
        this.query.select(this.req.query.select);
      }
    });
  }
};