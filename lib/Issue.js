const _ = require('lodash');
const zenhub = require('./util/zenhub');

module.exports = class Issue {
  constructor(issues, githubIssue) {
    this.issues = issues;
    this.githubIssueData = githubIssue;
    this.zenhubIssueData = null;
    this.zenhubEpicData = null;
  }

  async fetchZenhubData() {
    const repoId = this.getRepoId();
    const issueNumber = this.getNumber();
    const zenhubRes = await zenhub.fetchIssueData(repoId, issueNumber);
    this.zenhubIssueData = zenhubRes.data;

    if (this.zenhubIssueData.is_epic) {
      const zenhubEpicRes = await zenhub.fetchEpicData(repoId, issueNumber)
      this.zenhubEpicData = zenhubEpicRes.data;
    }
  }

  async updateEpicAssociation({ removeIssues, addIssues }) {
    const repoId = this.getRepoId();
    const issueNumber = this.getNumber();
    const res = await zenhub.updateEpicAssociation(repoId, issueNumber, { removeIssues, addIssues });

    // 手持ちのデータからも削除
    _.remove(this.zenhubEpicData.issues, (issue) => {
      return _.some(removeIssues, (removeIssue) => removeIssue.issue_number === issue.issue_number);
    });

    // 追加は現状想定してないから処理しない

    const removedIssues = _.map(res.data.removed_issues, (removed_issue) => {
      return this.issues.getByIssueNumber(removed_issue.issue_number)
    });
    return { removedIssues };
  }

  isEpic() {
    return this.zenhubIssueData.is_epic;
  }

  isOpened() {
    return !this.githubIssueData.closed_at;
  }

  isNoEstimate() {
    return _.isUndefined(this.zenhubIssueData.estimate);
  }

  getRepoId() {
    return this.githubIssueData.repository.id;
  }

  getChilds() {
    if (!this.isEpic()) {
      return [];
    }

    const childs = this.zenhubEpicData.issues;
    // ここで、先月閉じられたIssueが含まれてると、getできなくてundefinedが入るはず
    return _.map(childs, (child) => this.issues.getByIssueNumber(child.issue_number));
  }

  getChildEpics() {
    const childs = this.getChilds();
    return _.filter(childs, (child) => child.isEpic() === true);
  }

  getNumber() {
    return this.githubIssueData.number;
  }

  getHtmlUrl() {
    return this.githubIssueData.html_url;
  }

  toDataForRemove() {
    const repo_id = this.getRepoId();
    const issue_number = this.getNumber();
    return { repo_id, issue_number };
  }

  hasChildsOtherThanThisMonth() {
    if (!this.isEpic()) {
      return false;
    }

    const childs = this.getChilds();

    return _.some(childs, (child) => _.isUndefined(child));
  }

  hasInChilds(issueNumber) {
    const childs = this.getChilds();
    return _.some(childs, (child) => child.getNumber() === issueNumber);
  }

  hasOpenedChilds() {
    if (!this.isEpic()) {
      return false;
    }

    const childs = this.getChilds();
    return _.some(childs, (child) => child.isOpened() === true);
  }
}
