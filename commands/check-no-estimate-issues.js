const _ = require('lodash');
const inquirer = require('inquirer');
const opener = require('opener');

const runner = require('../main.js');

const UPDATE_KEY = '[UPDATE]';
const QUIT_KEY = '[QUIT]';

exports.command = 'check-no-estimate-issues <ownerName> <repoName>';
exports.desc = 'estimateが設定されていないIssueがないか確認する';
exports.builder = {};
exports.handler = async function(argv) {
  const urls = await fetchUrls();
  console.log(urls);


  await itr(urls);


  async function fetchUrls() {
    const filteredIssues = await runner.noEstimateIssues(argv.ownerName, argv.repoName);
    return _.map(filteredIssues, (issue) => issue.getHtmlUrl());
  }

  async function itr(urls) {
    const questions = [
      {
        type: 'list',
        name: 'selectedUrl',
        message: 'select url',
        choices: _.concat(urls, new inquirer.Separator(), UPDATE_KEY, QUIT_KEY),
      }
    ];
    const answers = await inquirer.prompt(questions);

    if (answers.selectedUrl === QUIT_KEY) {
      return;
    }

    if (answers.selectedUrl === UPDATE_KEY) {
      const newUrls = await fetchUrls();
      await itr(newUrls);
      return;
    }

    opener(answers.selectedUrl);

    await itr(urls);
  }
};
