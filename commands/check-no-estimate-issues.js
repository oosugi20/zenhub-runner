const _ = require('lodash');
const inquirer = require('inquirer');
const opener = require('opener');

const runner = require('../main.js');

exports.command = 'check-no-estimate-issues <ownerName> <repoName>';
exports.desc = 'estimateが設定されていないIssueがないか確認する';
exports.builder = {};
exports.handler = async function(argv) {
  const filteredIssues = await runner.noEstimateIssues(argv.ownerName, argv.repoName);
	//console.log('aa %s bb', argv.repoName);
  const urls = _.map(filteredIssues, (issue) => issue.getHtmlUrl());

  const questions = [
    {
      type: 'list',
      name: 'selectedUrl',
      message: 'select url',
      choices: _.concat(urls, new inquirer.Separator(), 'QUIT'),
    }
  ];

  itr();

  //let quitFlag = false;

  function itr() {
    inquirer.prompt(questions).then(answers => {
      if (answers.selectedUrl === 'QUIT') {
        //quitFlag = true;
        return;
      }
      opener(answers.selectedUrl);
      itr();
    });
  }
};
