const fs = require('fs');
const path = require('path');
const assert = require('assert');

const FILE_NAME_REGEX = /^(\d+)_\S+\.js$/;

/**
 * Reads out the base directory for other directories
 * @param {String} dir absolute path to migrations directory
 * @returns {[String]} directory names
 */
function readDirs(dir) {
  return fs.readdirSync(dir)
    .filter(file => fs.statSync(path.join(dir, file)).isDirectory());
}

/**
 * Reads out a subdirectory for migration files.
 * Files must be in following file name format: [digit]_[verbose].js
 * Example: 0001_add_users.js
 * @param {String} dir absolute path to migration app directory
 * @returns {[String]} sorted array of tuples in format [prefix, filename]
 */
function readFiles(dir) {
  return fs.readdirSync(dir)
    .filter(file => !fs.statSync(path.join(dir, file)).isDirectory()
      && file.match(FILE_NAME_REGEX))
    .map(file => ({ migration: file.match(FILE_NAME_REGEX)[1], file }))
    .sort((a, b) => a.migration.localeCompare(b.migration));
}

/**
 * Injects the migration file.
 * @param {String} path absolute path to migration file
 */
function loadFile(filePath) {
  let file = false;
  try {
    file = require(filePath); // eslint-disable-line global-require, import/no-dynamic-require, max-len
  } catch (err) {
    console.error(`Failed to load migration file ${filePath}`);
    console.error('Error information:');
    console.error(err);
    return false;
  }

  if (
    !Object.prototype.hasOwnProperty.call(file, 'forward')
  ) {
    console.error(`Failed to prepare migration file ${filePath}`);
    console.error('Forward function not found.');
    return false;
  }
  return file;
}

/**
 * Initialize a new `Migrate` instance.
 */
function Migrate() {
  this.configPath = '';
}

/**
 * Configures the task runner object.
 * @param {String} dir path to migrations directory
 * @returns {bool}
 */
Migrate.prototype.configure = function (dir) {
  assert.ok(dir);
  
  this.configPath = dir;
  this.apps = readDirs(dir);
  return true;
};

/**
 * Destroys Migrate instance, resetting properties.
 */
Migrate.prototype.destroy = function () {
  this.configPath = '';
};

/**
 * Forwards all migrations.
 * @returns {Number} number of migrations applied.
 */
Migrate.prototype.all = async function () {
  assert(this.configPath);
  let migrationsApplied = 0;

  for (let i = 0; i < this.apps.length; i += 1) {
    migrationsApplied += await this.app(this.apps[i]); // eslint-disable-line no-await-in-loop
  }

  return migrationsApplied;
};

/**
 * Forwards one migration.
 * @param {String} appName the app to migrate forward
 * @returns {Number} number of migrations applied.
 */
Migrate.prototype.app = async function (appName) {
  assert(appName);
  assert(this.configPath);

  const migrationFiles = readFiles(path.join(this.configPath, appName));
 
  // inject files and check for consistency.
  let migrations = migrationFiles.map((file) => {
    file.fn = loadFile(path.resolve(this.configPath, appName, file.file));
    return file;
  });

  // all migration files must be in correct format, to prevent faulty intermittent states.
  if (migrations.find(file => file.fn === false)) {
    console.error('One or more migration files are incompatible. Check error messages above. Exiting.');
    return 0;
  }

  console.info(`Running migrations for '${appName}'.`);

  for (let i = 0; i < migrations.length; i += 1) {
    /* eslint-disable no-await-in-loop */
    const migration = migrations[i];
    console.info(` - ${migration.migration}: ${migration.fn.name}`);
    await migration.fn.forward();
    /* eslint-enable no-await-in-loop */
  }

  // return the number of migrations done.
  return migrations.length;
};

/**
 * Expose the root command.
 */
module.exports = new Migrate();

/**
 * Export `Migrate`
 */
exports.Migrate = Migrate;
