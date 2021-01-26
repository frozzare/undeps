const path = require('path');
const undeps = require('./');

test('should not find any unused dependencies', () => {
  const { unused } = undeps({
    exclude: ['minimist'],
  });

  expect(Object.keys(unused).length).toBe(0);
});

test('should find missing dependencies with default config', () => {
  const { deps, unused } = undeps(
    {},
    path.join(process.cwd(), 'fixtures', 'missing')
  );

  expect(deps.length).toBe(unused.length);
  expect(unused).toStrictEqual(['undeps']);
});
