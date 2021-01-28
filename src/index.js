const fs = require('fs');
const path = require('path');
const R = require('ramda');
const glob = require('glob');
const { defaultConfig } = require('./config');
const { hasBinaries, loadPackage } = require('./package');

const undeps = (config = {}, cwd = process.cwd()) => {
  config = {
    ...defaultConfig(cwd),
    ...config,
  };

  let pkg;
  try {
    pkg = loadPackage(config.package);
  } catch (err) {
    console.error(`No package.json found in: ${cwd}`);
    return;
  }

  const deps = R.pipe(
    R.filter(config.excludeFn),
    R.filter((p) => (config.types ? true : p.indexOf('@types/') === -1)),
    R.filter((p) => !config.exclude.includes(p)),
    R.filter((p) => (config.binaries ? true : !hasBinaries(p, cwd)))
  )([...Object.keys(pkg.dependencies), ...Object.keys(pkg.devDependencies)]);

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
    R.filter((p) => !p),
    R.keys
  )(deps);

  return {
    deps,
    unused,
  };
};

module.exports = (config, cwd) =>
  undeps(config, cwd) || {
    deps: [],
    unused: [],
  };
