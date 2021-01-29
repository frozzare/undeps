const defaultConfig = (cwd) => ({
  binaries: false,
  checkFn: (dep, file) => file.body.indexOf(dep) !== -1,
  exclude: [],
  excludeFn: (dep) => true,
  files: [],
  pattern: `${cwd}/src/**/*.+(js|ts|jsx|tsx|vue)`,
  packages: `${cwd}/{package.json,packages/**/package.json}`,
  types: false,
});

module.exports = { defaultConfig };
