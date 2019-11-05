const _ = require('lodash');
const inquirer = require('inquirer');
const opener = require('opener');
const CliSpinner = require('cli-spinner').Spinner;
const chalk = require('chalk');

const runner = require('../main.js');

const UPDATE_KEY = '[UPDATE]';
const QUIT_KEY = '[QUIT]';

exports.command = 'check-all-closed-has-in-monthly <repoPath> <issueNumber>';
exports.desc = '今月closeされたIssueが月次まとめEpicに紐付けられているか確認する';
exports.builder = {};
exports.handler = async function(argv) {
  const cliSpinner = new CliSpinner('%s processing...');
  cliSpinner.setSpinnerString('⢹⢺⢼⣸⣇⡧⡗⡏');

  const repoPathArr = argv.repoPath.split('/')
  const ownerName = repoPathArr[0];
  const repoName = repoPathArr[1];
  const issueNumber = parseInt(argv.issueNumber.replace(/^#/, ''), 10);

  const urls = await check();
  cliSpinner.stop(true);

  if (!urls.length) {
    console.log('今月closeされたIssueはすべて月次まとめEpicに紐付けられています。');
    return;
  }

  console.log(`
以下のIssueは、月時まとめEpic #${issueNumber} に含まれません。
`);
  console.log(chalk.bold('==================================================='));
  urls.forEach(function(url) {
    console.log(url);
  });
  console.log(chalk.bold('==================================================='));

  itr(urls);


  async function check() {
    const results = await runner.checkAllClosedHasInMonthly(
      ownerName,
      repoName,
      issueNumber
    );
    return _.map(results, (result) => result.getHtmlUrl());
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
      const newUrls = await check();
      cliSpinner.stop(true);
      await itr(newUrls);
      return;
    }

    opener(answers.selectedUrl);

    await itr(urls);
  }

};
