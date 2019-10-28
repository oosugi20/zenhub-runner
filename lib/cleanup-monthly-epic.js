const Octokit = require('@octokit/rest');
const ZenHub = require('./util/zenhub');

const filterEpics = require('./filter-epics');
const findIssue = require('./find-issue');

const Issues = require('./Issues');


const fs = require('fs');
const path = require('path');
const githubToken = fs.readFileSync(path.resolve(__dirname + '/../config/token/github'), 'utf-8').trim();
const zenhubToken = fs.readFileSync(path.resolve(__dirname + '/../config/token/zenhub'), 'utf-8').trim();


module.exports = async function(ownerName, repoName, issueNumber) {
  const myIssues = new Issues(ownerName, repoName);
  await myIssues.fetch();

  const monthlyEpic = myIssues.getByIssueNumber(issueNumber);

  // zenhubのepicに紐付けられたissuesは、別のリポジトリの可能性がある。
  //
  // Rみたいに、いくつかのリポジトリのまとめIssueを作ってると、
  // myIssuesでは指定のリポジトリの内容しか取ってきてないので、
  // なんとかする必要がある。
  //
  // ひとまず、いちリポジトリの月時まとめを想定し、
  // 月時まとめEpicの子Issuesに別のリポジトリのIssueが入らない想定とする。
  //
  // TODO また、先月のIssueとかがあると、取得できてない気がする
  const childEpics = monthlyEpic.getChildEpics();

  // 先に子に親の情報紐付けておいた方がいい？
  childEpics.forEach(function(childEpic) {
    console.log('hasOpenedChilds:', childEpic.hasOpenedChilds());

    if (childEpic.hasOpenedChilds()) {
      return;
    }

    // openedがないなら === 全部閉じられてるなら、
    // childEpic自体にmonthlyEpicを紐付け ==> 先月のIssueとか持ってたら？
    // childEpic自体をclose => closeは手動でやらせたほうがいいかも
    // childEpicのchildsからmonthlyEpicを外す

    if (childEpic.hasChildsOtherThanThisMonth()) {
      return;
    }

    const removeIssues = childEpic.zenhubEpicData.issues; // 全部入れてるけど必要なのは repo_id issue_numberだけ
    const addIssues = [];

    // 全部今月でcloseされてるなら、子からmonthlyEpicはずす
    // 子は親Epic情報を持っていないので、
    // monthlyEpic側から子の関連付けを外す
    monthlyEpic.updateZenhubAssociation({ removeIssues, addIssues });
    
  });




  //const octokit = new Octokit({
  //  auth: githubToken
  //});

  //const zenhub = new ZenHub(zenhubToken);

  //const owner = 'oosugi20';
  //const repo = 'test';

  //const repoRes = await octokit.repos.get({
  //  owner,
  //  repo,
  //});

  //const issues = await fetchIssues();
  //const epics = filterEpics(issues);
  //console.log(epics);

  //for (epic in epics) {
  //  const epicData = await zenhub.getEpicData(repoRes.data.id, epic.number);

  //  for (issueData in epicData.issues) {
  //    if (issueData.is_epic) {
  //      continue;
  //    }

  //    // issueのgithubdataとる
  //    const issue = findIssue(issues, issueData.issue_number);

  //    if (!issue.closed_at) {
  //      continue;
  //    }

  //    // issueに関連付けられたEpicがなにかIssueからはわからない
  //  }
  //}



  // 1.紐付いているclosed Epic群取る
  // 2.1に紐付いてるissuesごとに
  // 3.epicなら、全部closeかどうか
     // closedなら:
  // 4.issueなら、、、


  // 親をまとめに関連付けてないパターン
  // 両方関連付けてるパターン
  // が、あるから、Issueごとに処理して、親のEpicがcloseされてたら外して親を、、で良さそう

  // ただ、子は親を知らない

  // 親をcloseするルールなら、

  // 月内で終わった子と前月に終わった子がいたら、、、

  // ので、Epicごとに処理して、子が全部月内closeだったら、子からまとめ外してにEpicに関連付ける

  //return epicData;
};
