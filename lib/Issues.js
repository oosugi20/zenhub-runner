const _ = require('lodash');
const github = require('./util/github');
const Issue = require('./Issue');

module.exports = class Issues {
  constructor(ownerName, repoName) {
    this.items = [];
    this._ownerName = ownerName;
    this._repoName = repoName;
  }

  async fetch() {
    const githubIssues = await github.fetchThisMonthIssues(this._ownerName, this._repoName);

    const progress = [];

    githubIssues.forEach((githubIssue) => {
      const issue = new Issue(this, githubIssue);
      this.items.push(issue);
      progress.push(issue.fetchZenhubData());
    });


    await Promise.all(progress);
  }

  getByIssueNumber(issueNumber) {
    return _.find(this.items, (item) => item.getNumber() === issueNumber);
  }

  /**
   * @param {string} status - 'opened' | 'closed'
   */
  filterByStatus(status) {
    switch (status) {
      case 'opened':
        return _.filter(this.items, (item) => item.isOpened());
        break;

      case 'closed':
        return _.filter(this.items, (item) => !item.isOpened());
        break;
    }
  }

  filterClosedAndNoEstimate() {
    const closedIssues = this.filterByStatus('closed');
    return _.filter(closedIssues, (closedIssue) => closedIssue.isNoEstimate());
  }
}
