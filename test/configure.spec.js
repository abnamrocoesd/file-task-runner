const fs = require('fs');
const path = require('path');
const expect = require('chai').expect;

const rimraf = require('rimraf');
const Migrate = require('../src/index');

const TEST_DIR = 'chai-test';

describe('Configure', function() {

  beforeEach(() => {
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR);
    }
  });

  afterEach(() => {
    // remove TEST_DIR if made.
    Migrate.destroy();
    if (fs.existsSync(TEST_DIR)) {
      rimraf.sync(TEST_DIR);
    }
  });

  it('should fail with no dir argument', function() {
    expect(() => { Migrate.configure() }).to.throw();
  });

  it('should succeed with regular dir', function() {
    expect(() => { Migrate.configure(TEST_DIR) }).not.to.throw();
    expect(fs.existsSync(TEST_DIR)).to.be.true;
  });

});
