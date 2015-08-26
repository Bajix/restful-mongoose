module.exports = function( action, options ) {
  this.reservedParams.push('limit', 'skip', 'p');

  if (action === 'index') {
    this.on('validate', function( req ) {
      var maxLimit = options.maxLimit;

      req.checkQuery('limit').optional().isInt();
      req.checkQuery('limit', 'limit must be greater than, or equal to 1').optional().isGTE(1);
      req.checkQuery('limit', 'limit must be less than, or equal to ' + maxLimit).optional().isLTE(maxLimit);

      req.checkQuery('skip').optional().isInt();
      req.checkQuery('skip', 'skip must be greater than, or equal to 1').optional().isGTE(1);

      req.checkQuery('p').optional().isInt();
      req.checkQuery('p', 'p must be greater than, or equal to 1').optional().isGTE(1);
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