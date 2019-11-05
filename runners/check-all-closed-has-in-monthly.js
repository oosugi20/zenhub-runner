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
    const isIncludes = _.some(childs, (child) => {
      // TODO 月次Issueに紐づけているけど、先月closeしたものだったりした場合の対策
      if (!child || !issue) {
        return false;
      }
      return child.getId() === issue.getId()
    });

    if (!isIncludes) {
      results.push(issue);
    }
  });

  return results;
};
