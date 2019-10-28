const _ = require('lodash');
const Octokit = require('@octokit/rest');

const fs = require('fs');
const path = require('path');
const githubToken = fs.readFileSync(path.resolve(__dirname + '/../config/token/github'), 'utf-8').trim();
const zenhubToken = fs.readFileSync(path.resolve(__dirname + '/../config/token/zenhub'), 'utf-8').trim();

module.exports = async function(ownerName, repoName) {
  const octokit = new Octokit({
    auth: githubToken
  });

  const today = new Date();
  const thisMonthDate = new Date([
    today.getFullYear(),
    today.getMonth() + 1,
    '01'
  ].join('-'));

  const options = octokit.issues.listForRepo.endpoint.merge({
    owner: ownerName,
    repo: repoName,
    filter: 'all',
    state: 'all',
    sort: 'updated',
    direction: 'desc',
    since: thisMonthDate.toISOString(),
    per_page: 100,
  });
  const issues = await octokit.paginate(options);

  const repoRes = await octokit.repos.get({
    owner: ownerName,
    repo: repoName,
  });

  const filtered = _.filter(issues, (issue) => !issue.pull_request);

  filtered.forEach(function(issue) {
    issue.repository = repoRes.data;
  });

  return filtered;
};
