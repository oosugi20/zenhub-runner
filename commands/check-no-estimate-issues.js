const _ = require('lodash');
const inquirer = require('inquirer');
const opener = require('opener');
const CliSpinner = require('cli-spinner').Spinner;
const chalk = require('chalk');

const runner = require('../main.js');

const UPDATE_KEY = '[UPDATE]';
const QUIT_KEY = '[QUIT]';

exports.command = 'check-no-estimate-issues <repoPath>';
exports.desc = 'estimateが設定されていないIssueがないか確認する';
exports.builder = {};
exports.handler = async function(argv) {
  const cliSpinner = new CliSpinner('%s processing...');
  cliSpinner.setSpinnerString('⢹⢺⢼⣸⣇⡧⡗⡏');
  cliSpinner.start();

  const repoPathArr = argv.repoPath.split('/')
  const ownerName = repoPathArr[0];
  const repoName = repoPathArr[1];

  const urls = await fetchUrls();
  cliSpinner.stop(true);

  // TODO なかったときのログと処理
  console.log(chalk.bold('=== No estimate issues ============================'));
  urls.forEach(function(url) {
    console.log(chalk.blue(url));
  });
  console.log(chalk.bold('==================================================='));


  await itr(urls);


  async function fetchUrls() {
    const filteredIssues = await runner.noEstimateIssues(ownerName, repoName);
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
      cliSpinner.start();
      const newUrls = await fetchUrls();
      cliSpinner.stop(true);
      await itr(newUrls);
      return;
    }

    opener(answers.selectedUrl);

    await itr(urls);
  }
};
