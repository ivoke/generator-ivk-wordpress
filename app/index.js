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

IvkWordpressGenerator.prototype.askForRepo = function askForRepo() {
  var cb = this.async();

  var prompts = [{
    type: 'input',
    name: 'repoURI',
    message: 'What is the location of your repository? [' + chalk.yellow.bold('user/repo') + ']:'
  }];

  this.prompt(prompts, function (props) {
    var repoURI = props.repoURI,
        extractedData = repoURI.split('/');

    this.gitDetails = {
      url: "git@github.com:" + repoURI + ".git",
      username: extractedData[0],
      repo: extractedData[1]
    };

    this.projectName = this.gitDetails['repo'];

    cb();
  }.bind(this));
};

IvkWordpressGenerator.prototype.fetchSkeleton = function fetchSkeleton() {
  console.log("Fetching wp-skeleton as " + this.projectName);

  exec("git clone git@github.com:ivoke/wp-skeleton.git " + this.projectName);
};

IvkWordpressGenerator.prototype.setupWorkingDirectory = function setupWorkingDirectory() {
  cd(this.projectName);

  this.copy('_package.json', 'package.json');
  this.copy('_bower.json', 'bower.json');
  this.copy('editorconfig', '.editorconfig');
  this.copy('jshintrc', '.jshintrc');
  this.copy('ruby-version', '.ruby-version');

  this.template('_Gemfile', 'Gemfile');

  this.mkdir('__yo_tmp');
  this.write('__yo_tmp/_READ_ME_IMPORTANT.txt', 'This folder is only used temporarily during yeoman generation!\nShould you see this file, it means the clean up process failed.\nYou can safely remove this directory and everything in it now.');
};

IvkWordpressGenerator.prototype.installGems = function installGems() {
  console.log("Installing gem dependencies");
  exec("bundle install");
};

IvkWordpressGenerator.prototype.rakeSetupTask = function rakeSetupTask() {
  exec("bundle exec rake install");
};


IvkWordpressGenerator.prototype.wpLocalEnvSetup = function wpLocalEnvSetup() {

  var cb = this.async();

  var prompts = [
    {
      type: 'input',
      name: 'local_db_name',
      message: 'What is the name of your local development database?',
      default: this.projectName + "_development"
    },
    {
      type: 'input',
      name: 'local_db_user',
      message: 'What is the db user?',
      default: 'root'
    },
    {
      type: 'input',
      name: 'local_db_password',
      message: 'What is the password for the user?'
    },
    {
      type: 'input',
      name: 'local_db_host',
      message: 'What is the db host?',
      default: 'localhost'
    },
    {
      type: 'input',
      name: 'table_prefix',
      message: 'Table prefix (specify if you have multiple installs in the same db)',
      default: 'wp_'
    },
    {
      type: 'input',
      name: 'lang',
      message: 'Enter language code, leave blank for American English',
      default: ''
    },
    {
      type: 'confirm',
      name: 'debugging',
      message: 'Enable debugging?',
      default: true
    }
  ];

  this.prompt(prompts, function (props) {
    var local_db_name     = props.local_db_name,
        local_db_user     = props.local_db_user,
        local_db_password = props.local_db_password,
        local_db_host     = props.local_db_host;

    var table_prefix      = props.table_prefix,
        lang              = props.lang,
        debugging         = props.debugging;

    var saltURL = 'https://api.wordpress.org/secret-key/1.1/salt';
    console.log("Fetching salts from: " + saltURL)

    exec("curl -o __yo_tmp/salts.txt " + saltURL);

    var salts = this.readFileAsString('__yo_tmp/salts.txt');

    this.wpConfig = this.wpConfig || {};

    _.merge(this.wpConfig, {
      db: {
        name: local_db_name,
        user: local_db_user,
        password: local_db_password,
        host: local_db_host
      },
      security: {
        salts: salts
      },
      language: lang,
      tablePrefix: table_prefix,
      debuggingEnabled: debugging
    });

    console.log("writing env_local.php file");
    this.template('_env_local.php', 'env_local.php');

    cb();
  }.bind(this));

};


// Right now, the rake task is already initializing and committing
// but this task should be moved here, because we generate additional files we want in our initial commit

// IvkWordpressGenerator.prototype.gitSetup = function gitSetup() {
//   console.log("Initializing git and setting remote");

//   rm('-rf', '.git');
//   exec("git init");
//   exec("git remote add origin " + this.gitDetails['url']);
//   exec("git add -A");
//   exec("git commit -am 'Initial Commit'");
// };


IvkWordpressGenerator.prototype.tempCleanup = function tempCleanup() {
  console.log("Cleaning up temporary directory");

  rm('-rf', '__yo_tmp');
};


// private helper functions below
// needed them on the prototype, else we're losing context
// functions with a leading _ will NOT be run by yeoman as steps

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
