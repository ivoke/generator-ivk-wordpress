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

IvkWordpressGenerator.prototype.vagrantUp = function vagrantUp() {
  var cb = this.async();
  var prompts = [
    {
      type: 'confirm',
      name: 'booting',
      message: 'Do you want to boot the vagrant box right now?',
      default: true
    }
  ];
  this.prompt(prompts, function(props) {
    this.booting = props.booting;
    if(this.booting) {
      console.log('Booting vagrant box.');
      exec('vagrant up');// TODO:  We might have to move git init out of the provision script
    } else {
      console.log('Skipping vagrant up.');
      // TODO: Split provision script and exec the part of the script handling git submodules here.
    }
    cb();
  }.bind(this));
};

IvkWordpressGenerator.prototype.installGems = function installGems() {
    console.log("Installing gem dependencies");
    exec("bundle install");
};

IvkWordpressGenerator.prototype.wpLocalEnvSetup = function wpLocalEnvSetup() {
  var cb = this.async();
  var envs = ['local', 'staging', 'production'];
  var questions = [
    {
      name: 'host',
      message: 'What is the server url?',
    }, {
      name: 'db.host',
      message: 'What is the database host?',
      default: 'localhost'
    }, {
      name: 'db.name',
      message: 'What is the database name?',
    }, {
      name: 'db.user',
      message: 'What is the database user?',
      default: 'root'
    }, {
      name: 'db.password',
      message: 'What is the database password?',
    }, {
      name: 'db.prefix',
      message: 'What is the database prefix?',
      default: 'wp_'
    }
  ];
  this.wpConfig = this.wpConfig || {};
  this.sshConfig = this.sshConfig || {};

  var prefixed = {};

  _.forEach(envs, function(env) {
    prefixed[env] = _.map(questions, function(question) {
      question.type = 'input';
      question.default = question.default || '';
      if(env === 'local' && this.booting) {
        switch(question.name) {
          case 'db.name':
          case 'db.user':
            question.default = 'skeleton'
            break;
          case 'db.password':
            question.default = 'secret';
            break;
        }
      }
      return question;
    }.bind(this));
  }.bind(this));

  console.log('Prompting for environment: ' + chalk.yellow('local'));

  this.prompt(prefixed.local, function(answers) {
    _.merge(this.wpConfig, answers);
  });

  console.log('Prompting for environment: ' + chalk.yellow('staging'));

  this.prompt(prefixed.staging, function(answers) {
    _.merge(this.wpConfig, answers);
  }.bind(this));

  console.log('Prompting for environment: ' + chalk.yellow('production'));

  this.prompt(prefixed.production, function(answers) {
    _.merge(this.wpConfig, answers);
    console.log('Writing to capistrano config.rb file:');
    this.template('_config.rb', 'cap/config/config.rb');
    cb();
  }.bind(this));

  this.prompt([
    {
      type: 'input',
      name: 'user',
      message: 'What is the ssh user\'s name?',
      default: ''
    }, {
      type: 'input',
      name: 'host',
      message: 'What is the ssh user\'s url?',
      default: ''
    }
  ], function(answers) {
    _.merge(this.sshConfig, answers);
    console.log('Writing to capistrano production.rb file:');
    this.template('_production.rb', 'cap/config/production.rb');
    cb();
  }.bind(this));

  console.log('Additional ' + chalk.yellow('local') + ' questions:');

  var questions = [
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

  this.prompt(questions, function (answers) {
    var saltURL = 'https://api.wordpress.org/secret-key/1.1/salt';
    console.log("Fetching salts from: " + saltURL)
    exec("curl -o __yo_tmp/salts.txt " + saltURL);

    var salts = this.readFileAsString('__yo_tmp/salts.txt');

    this.wpConfig = this.wpConfig || {};

    _.merge(this.wpConfig, {
      salts: salts,
      language: answers.lang,
      debuggingEnabled: answers.debugging
    });

    console.log("Writing to env_local.php file:");
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

  console.log('New Wordpress site available at: ' + chalk.green('http://192.168.33.10/') + ' (If you booted the vagrant box)');
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
