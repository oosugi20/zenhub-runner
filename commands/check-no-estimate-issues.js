const _ = require('lodash');
const runner = require('../main.js');

exports.command = 'check-no-estimate-issues <ownerName> <repoName>';
exports.desc = 'estimateが設定されていないIssueがないか確認する';
exports.builder = {};
exports.handler = async function(argv) {
  const filteredIssues = await runner.noEstimateIssues(argv.ownerName, argv.repoName);
	//console.log('aa %s bb', argv.repoName);
  const urls = _.map(filteredIssues, (issue) => issue.getHtmlUrl());
  console.log(urls);
};
