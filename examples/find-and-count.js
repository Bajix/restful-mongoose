var vottu = new Vottu('User', {
  pageSize: 20,
  maxLimit: 100
}).use('vottu-private-fields')
 .use('vottu-access-control')
 .use('vottu-cache');

var index = vottu.index()
 .pre('query', function() {
   this.query.select('-email');
 });

var count = vottu.count();

exports.index = function( req, res, next ) {
  async.parellel({
    count: function( cb ) {
      count.exec(function( req, res, next ) {
        return cb;
      })(req, res, next);
    },
    data: function( cb ) {
      index.exec(function( req, res, next ) {
        return cb;
      })(req, res, next);
    }
  }, function( err, data ) {
    if (err) {
      return next(err);
    }

    res.status(200).send(data);
  });
};