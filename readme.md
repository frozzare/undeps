# undeps

> work in progress

## config

Filename: `undeps.config.js`

```js
module.exports = {
  checkFn: (dep, file) => file.body.indexOf(dep) !== -1, // dep = e.g webpack, file = { name, path, body }
  exclude: [], // deps to exclude, e.g webpack
  excludeFn: (dep) => true, // dep = e.g webpack,
  files: [], // path to files to include, e.g ./babel.config.js
  pattern: './src/**/*.+(js|ts|jsx|tsx|vue)',
  types: false, // set to true to check for @types/* deps, default is to ignore
};
```

## License

MIT © [Fredrik Forsmo](https://github.com/frozzare)
