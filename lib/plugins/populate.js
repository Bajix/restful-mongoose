module.exports = function( action, options ) {
  this.reservedParams.push('populate');

  if (/(index|show|update)/.test(action)) {
    this.pre('query', function() {
      var populate = this.req.query.populate;

      if (populate) {
        this.query.populate(populate);
      }
    });
  }
};