const CliSpinner = require('cli-spinner').Spinner;
const runner = require('../main.js');

exports.command = 'cleanup-monthly-epic <ownerName> <repoName> <issueNumber>';
exports.desc = '月時まとめEpicを整理する';
exports.builder = {};
exports.handler = async function(argv) {
  const cliSpinner = new CliSpinner('%s processing...');
  cliSpinner.setSpinnerString('⢹⢺⢼⣸⣇⡧⡗⡏');
  cliSpinner.start();

  const res = await runner.cleanupMonthlyEpic(
    argv.ownerName,
    argv.repoName,
    argv.issueNumber
  );
  
  cliSpinner.stop(true);

  // TODO 変更した一覧のログ

};
