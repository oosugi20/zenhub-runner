const _ = require('lodash');
const Octokit = require('@octokit/rest');
const readToken = require('./read-token');
const getThisMonthFirstDayISOString = require('./getThisMonthFirstDayISOString');
const token = readToken('github');
const octokit = new Octokit({
  auth: token
});

module.exports = {
  fetchThisMonthIssues: async function(ownerName, repoName) {
    const since = getThisMonthFirstDayISOString();

    const options = octokit.issues.listForRepo.endpoint.merge({
      owner: ownerName,
      repo: repoName,
      filter: 'all',
      state: 'all',
      sort: 'updated',
      direction: 'desc',
      since,
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
  }
};
