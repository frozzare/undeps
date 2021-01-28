const defaultPackage = {
  dependencies: {},
  devDependencies: {},
  scripts: {},
  resolutions: {},
};

const loadPackage = (pkg) => {
  if (typeof pkg !== 'object' || Array.isArray(pkg)) {
    pkg = require(pkg);
  }

  return { ...defaultPackage, ...pkg };
};

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
};
