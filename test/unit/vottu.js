var Vottu = require('../../index').Vottu;

describe('Vottu', function() {
  describe('Inheritance', function() {
    it('resources instance inherits options', function() {
      var vottu = new Vottu('User', {
        pageSize: 1,
        maxLimit: 99
      });

      var resource = vottu.create();
      assert.deepEqual(resource.options, vottu.options);
    });

    it('resources inherit base plugins', function() {
      var spy = sinon.spy();

      Vottu.init().use(spy);

      var vottu = new Vottu('User'),
        resource = vottu.create();

      assert.propertyVal(spy, 'callCount', 1);
      assert.deepEqual(resource.plugins, Vottu.plugins);
    });

    it('resources inherit instance plugins', function() {
      var spy = sinon.spy();

      var vottu = new Vottu('User').use(spy);

      var create = vottu.create();

      assert.propertyVal(spy, 'callCount', 1);
      assert.includeMembers(create.plugins, Vottu.plugins);
      assert.includeMembers(create.plugins, vottu.plugins);
    });
  });
});