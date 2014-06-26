'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
// var shelljs = require('shelljs');
require('shelljs/global');
var chalk = require('chalk');
var _ = require('lodash');


var IvkWordpressGenerator = module.exports = function IvkWordpressGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  this.on('end', function () {
    this.installDependencies({ skipInstall: options['skip-install'] });
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(IvkWordpressGenerator, yeoman.generators.Base);

var QUESTIONS = [
  {
    name: 'project',
    message: 'What is the name of the project?'
  }, {
    name: 'repo',
    message: 'What is the location of your repository? [' + chalk.yellow.bold('user/repo') + ']:'
  }, {
    name: 'local.host',
    message: 'What is the local server url?',
  }, {
    name: 'local.db.host',
    message: 'What is the local database host?',
    default: 'localhost'
  }, {
    name: 'local.db.name',
    message: 'What is the local database name?',
    default: 'skeleton'
  }, {
    name: 'local.db.user',
    message: 'What is the local database user?',
    default: 'skeleton'
  }, {
    name: 'local.db.password',
    message: 'What is the local database password?',
    default: 'secret'
  }, {
    name: 'local.db.prefix',
    message: 'What is the local database prefix?',
    default: 'wp_'
  }, {
    name: 'staging.host',
    message: 'What is the staging server url?',
  }, {
    name: 'staging.db.host',
    message: 'What is the staging database host?',
    default: 'localhost'
  }, {
    name: 'staging.db.name',
    message: 'What is the staging database name?',
  }, {
    name: 'staging.db.user',
    message: 'What is the staging database user?',
    default: 'root'
  }, {
    name: 'staging.db.password',
    message: 'What is the staging database password?',
  }, {
    name: 'staging.db.prefix',
    message: 'What is the staging database prefix?',
    default: 'wp_'
  }, {
    name: 'production.host',
    message: 'What is the production server url?',
  }, {
    name: 'production.db.host',
    message: 'What is the production database host?',
    default: 'localhost'
  }, {
    name: 'production.db.name',
    message: 'What is the production database name?',
  }, {
    name: 'production.db.user',
    message: 'What is the production database user?',
    default: 'root'
  }, {
    name: 'production.db.password',
    message: 'What is the production database password?',
  }, {
    name: 'production.db.prefix',
    message: 'What is the production database prefix?',
    default: 'wp_'
  }, {
    name: 'ssh.user',
    message: 'What is the ssh user\'s name?',
  }, {
    name: 'ssh.host',
    message: 'What is the ssh user\'s url?',
  }, {
    name: 'lang',
    message: 'Enter language code, leave blank for American English',
  }, {
    type: 'confirm',
    name: 'debugging',
    message: 'Enable debugging locally?',
    default: true
  }, {
    type: 'confirm',
    name: 'booting',
    message: 'Do you want to boot the vagrant box right now?',
    default: true
  }
];


IvkWordpressGenerator.prototype.introduction = function introduction() {
  var cb = this.async();

  // have Yeoman greet the user.
  console.log(this.yeoman);

  var instructionText = [
    "Before we can begin, you need to create a repository on github",
    "Please take note of the location of your new repository, for example: ",
    "  " + chalk.yellow('username/new-repository')
  ];

  this._printInstructions(instructionText);
};

IvkWordpressGenerator.prototype.ask = function ask() {
  var cb = this.async();

  this.prompt(QUESTIONS, function (answers) {

    this.answers = answers;

    var segments = answers.repo.split('/');

    this.answers.git = {
      username: segments[0],
      repo: segments[1],
      url: 'https://github.com/' + this.answers.repo
    };

    this._fetchRepo();

    exec("git submodule update");
    exec('find . -type d | grep -i "\.git$" | xargs rm -rf'); // Remove all git folders

    this._installGems();

    this._vagrantUp();

    this._setupWorkingDirectory();

    cb();
  }.bind(this));
};

IvkWordpressGenerator.prototype._fetchRepo = function _fetchRepo() {
  console.log('Fetching wp-skeleton as ' + this.answers.project);

  exec('git clone git@github.com:ivoke/wp-skeleton.git ' + this.answers.project);

  cd(this.answers.project);

  this.mkdir('__yo_tmp');
  this.write('__yo_tmp/_READ_ME_IMPORTANT.txt', 'This folder is only used temporarily during yeoman generation!\nShould you see this file, it means the clean up process failed.\nYou can safely remove this directory and everything in it now.');

  var saltURL = 'https://api.wordpress.org/secret-key/1.1/salt';
  console.log("Fetching salts from: " + saltURL)
  exec("curl -o __yo_tmp/salts.txt " + saltURL);

  this.answers.salts = this.readFileAsString('__yo_tmp/salts.txt');
};

IvkWordpressGenerator.prototype._setupWorkingDirectory = function _setupWorkingDirectory() {
  this.copy('_package.json', 'package.json');
  this.copy('_bower.json', 'bower.json');
  this.copy('_config.rb', 'cap/config/config.rb');
  this.copy('_env_local.php', 'env_local.php');
  this.copy('_production.rb', 'cap/config/production.rb');
  this.copy('editorconfig', '.editorconfig');
  this.copy('jshintrc', '.jshintrc');
  this.copy('ruby-version', '.ruby-version');

  this.template('_Gemfile', 'Gemfile');
};

IvkWordpressGenerator.prototype._vagrantUp = function _vagrantUp() {
  if(this.answers.booting) {
    console.log('Booting vagrant box.');
    exec('vagrant up');
  } else {
    console.log('Skipping vagrant up.');
  }
};

IvkWordpressGenerator.prototype._installGems = function _installGems() {
    console.log("Installing gem dependencies");
    exec("bundle install");
};


// Right now, the rake task is already initializing and committing
// but this task should be moved here, because we generate additional files we want in our initial commit

// IvkWordpressGenerator.prototype.gitSetup = function gitSetup() {
//   console.log("Initializing git and setting remote");

//   exec("git init");
//   exec("git remote add origin " + this.gitDetails['url']);
//   exec("git add -A");
//   exec("git commit -am 'Initial Commit'");
// };


IvkWordpressGenerator.prototype.tempCleanup = function tempCleanup() {
  console.log("Cleaning up temporary directory");

  rm('-rf', '__yo_tmp');

  exec("git init");
  exec("git remote add origin " + this.answers.git.url);
  exec("git add -A");
  exec("git commit -am 'Initial Commit'");

  if(this.answers.booting) {
    console.log('New Wordpress site available at: ' + chalk.green('http://192.168.33.10/') + ' (If you booted the vagrant box)');
  }
};

// Helper functions
IvkWordpressGenerator.prototype._printHelp = function(msg) {
  console.log(chalk.green(msg));
};

IvkWordpressGenerator.prototype._printInstructions = function(messages) {
  var log = console.log,
      that = this,
      separator = "--------------------------------------------------------------------------------";

  log(separator);
  _.each(messages, function(msg) {
    that._printHelp(msg);
  });
  log(separator);

  this._awaitConfirmation();
};


IvkWordpressGenerator.prototype._awaitConfirmation = function _awaitConfirmation() {
  var cb = this.async();

  this.prompt([{
    type: 'confirm',
    name: '__tmp',
    message: 'OK?',
    default: true
  }], function(__tmp) {
    cb();
  }.bind(this));

};
