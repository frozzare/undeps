const fs = require('fs');
const path = require('path');
const R = require('ramda');
const glob = require('glob');

const cwd = process.cwd();
const pkg = require(`${cwd}/package.json`);

const config = {
  ...{
    checkFn: (dep, file) => file.body.indexOf(dep) !== -1,
    exclude: [],
    excludeFn: (dep) => true,
    files: [],
    pattern: './src/**/*.+(js|ts|jsx|tsx|vue)',
    types: false,
  },
  ...(fs.existsSync(`${cwd}/undeps.config.js`)
    ? require(`${cwd}/undeps.config.js`)
    : {}),
};

const binaries = (p) => {
  try {
    const { bin } = require(`${cwd}/node_modules/${p}/package.json`);
    return typeof bin === 'string' ? { [p]: [bin] } : bin;
  } catch (err) {
    return;
  }
};

const hasBinaries = (p) => {
  const b = binaries(p);
  return b ? !!Object.keys(b).length : false;
};

const deps = Object.keys(pkg.dependencies || {})
  .concat(Object.keys(pkg.devDependencies || {}))
  .filter(config.excludeFn)
  .filter((p) => (config.types ? true : p.indexOf('@types/') === -1))
  .filter((p) => !config.exclude.includes(p))
  .filter((p) => !hasBinaries(p));

const files = {
  './package.json': JSON.stringify({
    ...pkg,
    scripts: Object.values(pkg.scripts),
    dependencies: {},
    devDependencies: {},
    resolutions: {},
  }),
  ...config.files.reduce(
    (prev, file) => ({
      ...prev,
      [file]: fs.readFileSync(file).toString(),
    }),
    {}
  ),
  ...glob.sync(config.pattern).reduce(
    (prev, file) => ({
      ...prev,
      [file]: fs.readFileSync(file).toString(),
    }),
    {}
  ),
};

const fileNames = Object.keys(files);

const checkFiles = (dep) =>
  !!fileNames.find((fileName) =>
    config.checkFn(dep, {
      name: path.basename(fileName),
      path: fileName,
      body: files[fileName],
    })
  );

const diff = R.pipe(
  R.reduce(
    (prev, dep) => ({
      ...prev,
      [dep]: checkFiles(dep),
    }),
    {}
  ),
  R.filter((p) => !p)
)(deps);

console.log(
  `Found ${Object.keys(deps).length} dependenc${
    Object.keys(deps).length > 1 ? 'ies' : 'y'
  } and ${Object.keys(diff).length} are unused:`
);
console.log(`\n${Object.keys(diff).join('\n')}`);
