var Validator = require('express-validator'),
  Vottu = require('./lib/vottu').Vottu,
  validator = Validator.validator;

validator.extend('isGTE', function( val, num ) {
  return val >= num;
});

validator.extend('isGT', function( val, num ) {
  return val > num;
});

validator.extend('isLTE', function( val, num ) {
  return val <= num;
});

validator.extend('isLT', function( val, num ) {
  return val < num;
});

exports.Vottu = Vottu;
exports.Validator = Validator;