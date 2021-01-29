const { glob } = require('glob');

const defaultPackage = {
  dependencies: {},
  devDependencies: {},
  scripts: {},
};

const loadPackage = (file) => ({ ...defaultPackage, ...require(file) });

const loadPackages = (pattern) =>
  glob.sync(pattern).reduce((prev, file) => {
    const pkg = loadPackage(file);
    return {
      dependencies: {
        ...prev.dependencies,
        ...pkg.dependencies,
      },
      devDependencies: {
        ...prev.devDependencies,
        ...pkg.devDependencies,
      },
      scripts: {
        ...prev.scripts,
        ...pkg.scripts,
      },
    };
  }, {});

const findBinaries = (p, cwd = process.cwd()) => {
  try {
    const { bin } = require(`${cwd}/node_modules/${p}/package.json`);
    return typeof bin === 'string' ? { [p]: [bin] } : bin;
  } catch (err) {}
};

const hasBinaries = (p, cwd = process.cwd()) => {
  const b = findBinaries(p, cwd);
  return b ? !!Object.keys(b).length : false;
};

module.exports = {
  findBinaries,
  hasBinaries,
  loadPackage,
  loadPackages,
};
