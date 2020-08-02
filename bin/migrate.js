#!/usr/bin/env node

const program = require('commander');
const pkg = require('../package.json');
const Migrate = require('../src');

(() => {
  program
    .version(pkg.version)
    .option('-d, --dir [path]', 'Path to tasks directory', './tasks')
    .parse(process.argv);

  // Configure migrate instance
  if (!Migrate.configure(program.dir)) {
    process.exit(1);
  }
  
  return Migrate.all()
    .then(() => { process.exit(0); })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
  
})();
