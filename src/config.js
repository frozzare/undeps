const defaultConfig = (cwd) => ({
  binaries: false,
  checkFn: (dep, file) => file.body.indexOf(dep) !== -1,
  exclude: [],
  excludeFn: (dep) => true,
  files: [],
  pattern: `${cwd}/src/**/*.+(js|ts|jsx|tsx|vue)`,
  package: `${cwd}/package.json`, // object or string
  types: false,
});

module.exports = { defaultConfig };
