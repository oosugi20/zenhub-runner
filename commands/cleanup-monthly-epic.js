const CliSpinner = require('cli-spinner').Spinner;
const runner = require('../main.js');

exports.command = 'cleanup-monthly-epic <repoPath> <issueNumber>';
exports.desc = '月時まとめEpicを整理する';
exports.builder = {};
exports.handler = async function(argv) {
  const cliSpinner = new CliSpinner('%s processing...');
  cliSpinner.setSpinnerString('⢹⢺⢼⣸⣇⡧⡗⡏');
  cliSpinner.start();

  const repoPathArr = argv.repoPath.split('/')
  const ownerName = repoPathArr[0];
  const repoName = repoPathArr[1];
  const issueNumber = parseInt(argv.issueNumber.replace(/^#/, ''), 10);

  const results = await runner.cleanupMonthlyEpic(
    ownerName,
    repoName,
    issueNumber
  );

  cliSpinner.stop(true);

  if (!results.length) {
    console.log('変更されたIssueなし');
    return;
  }

  console.log(`
以下のIssueは、月時まとめEpic #${issueNumber} 内のcloseされた子Epicに含まれるため、
#${issueNumber}への関連付けを外しました。
`);

  results.forEach(function(result) {
    result.removedIssues.forEach(function(removedIssue) {
      const url = removedIssue.getHtmlUrl();
      console.log(url);
    });
  });

};
