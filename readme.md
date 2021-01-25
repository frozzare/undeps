# Undeps

Undeps is a tool for detect unused dependencies, by default it takes all dependencies and check if the package name exists in files. To make the tool more strict you can change the `checkFn`, e.g check for `import` or `require`

It will also exclude some dependencies:

- `@types/` packages
- packages with binaries
- `exclude` array
- `excludeFn` function

You can configure the tool for your needs with `undeps.config.js`

## Installation

```
npm install -g undeps
```

## Config

Filename: `undeps.config.js`

```js
module.exports = {
  binaries: false, // set to true to include binaries dependencies in the search, default is to ignore
  checkFn: (dep, file) => file.body.indexOf(dep) !== -1, // dep = e.g webpack, file = { name, path, body }
  exclude: [], // deps to exclude, e.g webpack
  excludeFn: (dep) => true, // dep = e.g webpack,
  files: [], // path to files to include, e.g ./babel.config.js
  pattern: './src/**/*.+(js|ts|jsx|tsx|vue)',
  package: (cwd) => `${cwd}/package.json`, // object or string
  types: false, // set to true to check for @types/* deps, default is to ignore
};
```

## License

MIT © [Fredrik Forsmo](https://github.com/frozzare)
