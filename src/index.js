const fs = require('fs');
const path = require('path');
const R = require('ramda');
const glob = require('glob');

function undeps(cwd) {
  if (!fs.existsSync(`${cwd}/package.json`)) {
    console.error('No package.json exists in current folder');
    return;
  }

  const pkg = require(`${cwd}/package.json`);

  const config = {
    ...{
      binaries: false,
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

  return {
    deps,
    diff,
  };
}

module.exports = undeps;
