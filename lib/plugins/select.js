module.exports = function( action, options ) {
  this.reservedParams.push('select');

  if (/(index|show|update)/.test(action)) {
    this.pre('query', function() {
      if (this.req.query.select) {
        this.query.select(this.req.query.select);
      }
    });
  }
};