'use strict';

describe('Filter: numberwithcomma', function () {

  // load the filter's module
  beforeEach(module('actualApp'));

  // initialize a new instance of the filter before each test
  var numberwithcomma;
  beforeEach(inject(function ($filter) {
    numberwithcomma = $filter('numberwithcomma');
  }));

  it('should return the input prefixed with "numberwithcomma filter:"', function () {
    var text = 'angularjs';
    expect(numberwithcomma(text)).toBe('numberwithcomma filter: ' + text);
  });

});
