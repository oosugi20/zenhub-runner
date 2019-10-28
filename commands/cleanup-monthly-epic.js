const CliSpinner = require('cli-spinner').Spinner;
const runner = require('../main.js');

exports.command = 'cleanup-monthly-epic <ownerName> <repoName> <issueNumber>';
exports.desc = '月時まとめEpicを整理する';
exports.builder = {};
exports.handler = async function(argv) {
  const cliSpinner = new CliSpinner('%s processing...');
  cliSpinner.setSpinnerString('⢹⢺⢼⣸⣇⡧⡗⡏');
  cliSpinner.start();

  const results = await runner.cleanupMonthlyEpic(
    argv.ownerName,
    argv.repoName,
    argv.issueNumber
  );

  cliSpinner.stop(true);

  if (!results.length) {
    console.log('変更されたIssueなし');
    return;
  }

  console.log(`
以下のIssueは、月時まとめEpic #${argv.issueNumber} 内のcloseされた子Epicに含まれるため、
#${argv.issueNumber}への関連付けを外しました。
`);

  results.forEach(function(result) {
    result.removedIssues.forEach(function(removedIssue) {
      const url = removedIssue.getHtmlUrl();
      console.log(url);
    });
  });

};
