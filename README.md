# file-task-runner

Node.js library for easy file-based task migrations.

Inspired by (https://south.readthedocs.io/en/latest/)
Based on (https://github.com/abnamrocoesd/neo4j-data-migrations)

# Requirements

Node.js version >= 10

# Installation

Install package:

`npm install file-task-runner`

# Usage

## Command-line

The command-line tool is used to control the migration of the system forwards or backwards through the series of migrations for any given app.

The most common use is:

`run-file-tasks myapp`

This will migrate the app myapp forwards through all the migrations. If you want to migrate all the apps at once, run:

`run-file-tasks`

This has the same effect as calling the first example for every app, and will deal with dependencies properly.

## Options

The following options are available to change behaviour of the migration tool:

- `-d, --dir [path]` Path to the migrations directory.

# Adding migrations

If you want to add a data migration script, add a `.js` file with the appropriate prefix in the `tasks` and app (sub-)directory. You need to keep track of the increment of the prefix to ensure correct migration order.

## Migration format

Each migration file should export an anonymous object exposing three properties:
- name {String} Verbose description of the migration
- forward {async Function} Forward migration script.

Example migration file:

```
module.exports = {
  name: 'Add users',
  forward: async () => {
    console.log('Hello, file task runner!');
  },
};
```

# Inclusion in continuous integration and deployment

You can include the `run-file-tasks` command in the deployment script of your application. Ensure it is run before the rest of your application is started.

# API usage

It is possible to programmatically use the migration library by means of dependency injection. An example:

```
import Migrate from 'file-task-runner';

Migrate.configure(__dirname);
Migrate.all(); // Migrate all apps at once.
Migrate.app('myapp') // Migrate myapp.
Migrate.close();
```

# License

MIT

# Author

Remco Hendriks, ABN AMRO Bank 2020.