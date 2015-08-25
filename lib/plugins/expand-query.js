var expandHash = require('expand-hash');

module.exports = function( action, options ) {
  this.on('sanitize', function( req ) {
    req.query = expandHash(req.query || {});
  });
};