const runner = require('../main.js');

exports.command = 'cleanup-monthly-epic <ownerName> <repoName> <issueNumber>';
exports.desc = '月時まとめEpicを整理する';
exports.builder = {};
exports.handler = async function(argv) {
  const res = await runner.cleanupMonthlyEpic(
    argv.ownerName,
    argv.repoName,
    argv.issueNumber
  );
  //console.log(res.data.issues);
};
