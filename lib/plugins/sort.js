module.exports = function( action, options ) {
  this.reservedParams.push('sort');

  if (action === 'index') {
    this.pre('query', function() {
      if (this.req.query.sort) {
        this.query.sort(this.req.query.sort);
      }
    });
  }
};