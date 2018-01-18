const sum = require('./sum')

describe('Function sum', () => {

  it('should return sum', () =>
  {
    expect(sum(1, 2)).toBe(3);
  });
});