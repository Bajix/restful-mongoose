module.exports = function( action, options ) {
  this.reservedParams.push('limit', 'skip', 'p');

  if (action === 'index') {
    this.on('validate', function( req ) {
      var maxLimit = options.maxLimit;

      if (req.query.hasOwnProperty('limit')) {
        req.checkQuery('limit').isInt();
        req.checkQuery('limit', 'limit must be greater than, or equal to 1').isGTE(1);
        req.checkQuery('limit', 'limit must be less than, or equal to ' + maxLimit).isLTE(maxLimit);
      }

      if (req.query.hasOwnProperty('skip')) {
        req.checkQuery('skip').isInt();
        req.checkQuery('skip', 'skip must be greater than, or equal to 1').isGTE(1);
      }

      if (req.query.hasOwnProperty('p')) {
        req.checkQuery('p').isInt();
        req.checkQuery('p', 'p must be greater than, or equal to 1').isGTE(1);
      }
    });

    this.pre('query', function() {
      var page = this.req.query.p || 1,
        limit = this.req.query.limit || options.pageSize,
        skip = this.req.query.skip || limit * (page - 1);

      this.query.skip(skip);
      this.query.limit(limit);
    });
  }
};