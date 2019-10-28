const runner = require('../main.js');

exports.command = 'cleanup-monthly-epic <issueNumber>';
exports.desc = '月時まとめEpicを整理する';
exports.builder = {};
exports.handler = async function(argv) {
  const res = await runner.cleanupMonthlyEpic(argv.issueNumber);
  //console.log(res.data.issues);
};
