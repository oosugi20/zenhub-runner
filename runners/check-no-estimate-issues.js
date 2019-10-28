const Issues = require('../lib/Issues');

module.exports = async function(ownerName, repoName) {
  const myIssues = new Issues(ownerName, repoName);
  await myIssues.fetch();

  return myIssues.filterClosedAndNoEstimate();
};
