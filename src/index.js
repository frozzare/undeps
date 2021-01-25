const fs = require('fs');
const path = require('path');
const R = require('ramda');
const glob = require('glob');

const defaultConfig = {
  binaries: false,
  checkFn: (dep, file) => file.body.indexOf(dep) !== -1,
  exclude: [],
  excludeFn: (dep) => true,
  files: [],
  pattern: './src/**/*.+(js|ts|jsx|tsx|vue)',
  package: (cwd) => `${cwd}/package.json`, // object or string
  types: false,
};

function undeps(opts) {
  const { cwd } = opts;

  const config = {
    ...defaultConfig,
    ...(fs.existsSync(opts.config) ? require(opts.config) : {}),
  };

  let pkg = config.package(cwd);
  if (typeof pkg !== 'object' || Array.isArray(pkg)) {
    try {
      pkg = require(pkg);
    } catch (err) {
      console.error(`No package.json found in: ${cwd}`);
      return;
    }
  }

  const findBinaries = (p) => {
    try {
      const { bin } = require(`${cwd}/node_modules/${p}/package.json`);
      return typeof bin === 'string' ? { [p]: [bin] } : bin;
    } catch (err) {
      return;
    }
  };

  const hasBinaries = (p) => {
    const b = findBinaries(p);
    return b ? !!Object.keys(b).length : false;
  };

  const deps = R.pipe(
    R.filter(config.excludeFn),
    R.filter((p) => (config.types ? true : p.indexOf('@types/') === -1)),
    R.filter((p) => !config.exclude.includes(p)),
    R.filter((p) => (config.binaries ? true : !hasBinaries(p)))
  )([
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ]);

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

  const unused = R.pipe(
    R.reduce(
      (prev, dep) => ({
        ...prev,
        [dep]: checkFiles(dep),
      }),
      {}
    ),
    R.filter((p) => !p)
  )(deps);

  return {
    used: deps,
    unused,
  };
}

module.exports = (cwd) =>
  undeps(cwd) || {
    unused: 0,
    used: 0,
  };
