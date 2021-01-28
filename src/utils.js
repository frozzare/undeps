const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const exec = (cmd, cwd = process.cwd()) => {
  process.env.FORCE_COLOR = true;

  const sp = spawn(cmd, [], {
    cwd,
    shell: true,
    env: process.env,
  });

  sp.stdout.pipe(process.stdout);
  sp.stderr.pipe(process.stderr);
};

const hasYarn = (cwd = process.cwd()) =>
  fs.existsSync(path.resolve(cwd, 'yarn.lock'));

module.exports = {
  exec,
  hasYarn,
};
