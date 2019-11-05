const _ = require('lodash');
const Issues = require('../lib/Issues');


module.exports = async function(ownerName, repoName, issueNumber) {
  const myIssues = new Issues(ownerName, repoName);
  await myIssues.fetch();

  const monthlyEpic = myIssues.getByIssueNumber(issueNumber);

  const childs = monthlyEpic.getChilds();
  const closedIssues = myIssues.filterByStatus('closed');

  const results = [];

  closedIssues.forEach(function(issue, index) {
    const isIncludes = _.some(childs, (child) => child.getId() === issue.getId());
    if (isIncludes) {
      results.push(issue);
    }
  });

  return results;
};
