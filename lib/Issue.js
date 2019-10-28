const _ = require('lodash');
const ZenHub = require('./util/zenhub.js');
const fs = require('fs');
const path = require('path');
const zenhubToken = fs.readFileSync(path.resolve(__dirname + '/../config/token/zenhub'), 'utf-8').trim();
const zenhub = new ZenHub(zenhubToken);

module.exports = class Issue {
  constructor(issues, githubIssue) {
    this.issues = issues;
    this.githubIssueData = githubIssue;
    this.zenhubIssueData = null;
    this.zenhubEpicData = null;
  }

  async fetchZenhubData() {
    const repoId = this.githubIssueData.repository.id;
    const issueNumber = this.githubIssueData.number;
    const zenhubRes = await zenhub.getIssueData(repoId, issueNumber);
    this.zenhubIssueData = zenhubRes.data;

    if (this.zenhubIssueData.is_epic) {
      const zenhubEpicRes = await zenhub.getEpicData(repoId, issueNumber)
      this.zenhubEpicData = zenhubEpicRes.data;
    }
  }

  async updateZenhubAssociation({ removeIssues, addIssues }) {
    const repoId = this.githubIssueData.repository.id;
    const issueNumber = this.githubIssueData.number;
    const res = await zenhub.updateEpicAssociation(repoId, issueNumber, { removeIssues, addIssues });

    // 手持ちのデータからも削除
    _.remove(this.zenhubEpicData.issues, (issue) => {
      return _.some(removeIssues, (removeIssue) => removeIssue.issue_number === issue.issue_number);
    });

    // 追加は現状想定してないから処理しない
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

  getHtmlUrl() {
    return this.githubIssueData.html_url;
  }

  hasChildsOtherThanThisMonth() {
    if (!this.isEpic()) {
      return false;
    }

    const childs = this.getChilds();

    return _.some(childs, (child) => _.isUndefined(child));
  }

  hasOpenedChilds() {
    if (!this.isEpic()) {
      return false;
    }

    const childs = this.getChilds();
    return _.some(childs, (child) => child.isOpened() === true);
  }
}
