const fs = require('fs');
const path = require('path');
const expect = require('chai').expect;

const rimraf = require('rimraf');
const Migrate = require('../src/index');

const TEST_DIR = 'chai-test';

describe('Migrate', function() {

  before(() => {
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR);
    }
    Migrate.configure('test/mock');
  });

  after(() => {
    // remove TEST_DIR if made.
    Migrate.destroy();
    if (fs.existsSync(TEST_DIR)) {
      rimraf.sync(TEST_DIR);
    }
  });

  it('should forward all', async function() {
    const number = await Migrate.all();
    expect(number).to.equal(4);
  });

  it('should forward all again (no state)', async function() {
    const number = await Migrate.all();
    expect(number).to.equal(4);
  });

  it('shoud not be able to load malformed migration', async function () {
    fs.copyFileSync(
      path.join(__dirname, 'mock-faulty', '0005_add_prizes.js'),
      path.join(__dirname, 'mock', 'actors', '0005_add_prizes.js'),
    );
    const number = await Migrate.app('actors');
    expect(number).to.equal(0);
    rimraf.sync(path.join(__dirname, 'mock', 'actors', '0005_add_prizes.js'));
  });

  it('shoud not be able to load incompatible migration', async function () {
    fs.copyFileSync(
      path.join(__dirname, 'mock-faulty', '0006_add_tickets.js'),
      path.join(__dirname, 'mock', 'actors', '0006_add_tickets.js'),
    );
    const number = await Migrate.app('actors');
    expect(number).to.equal(0);
    rimraf.sync(path.join(__dirname, 'mock', 'actors', '0006_add_tickets.js'));
  });
});
