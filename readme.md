# undeps

> work in progress

## config

Filename: `undeps.config.js`

```js
module.exports = {
  checkFn: (dep, file) => file.body.indexOf(dep) !== -1, // dep = e.g webpack, file = { name, path, body }
  exclude: [],
  excludeFn: (dep) => true, // dep = e.g webpack,
  files: [],
  pattern: './src/**/*.+(js|ts|jsx|tsx|vue)',
  types: false,
};
```

## License

MIT © [Fredrik Forsmo](https://github.com/frozzare)
