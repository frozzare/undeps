const undeps = require('./');

test('should not find any unused dependencies', () => {
  const { unused } = undeps(process.cwd());

  expect(Object.keys(unused).length).toBe(0);
});
