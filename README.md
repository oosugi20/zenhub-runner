# 概要

ZenHubで運用していく上でのタスクランナー。

- 月内にcloseしたけどestimateがついてないIssueのチェック
- 月時まとめIssueの整理


# タスク

## check-no-estimate-issues

```
$ zenhub-runner check-no-estimate-issues <ownerName> <repoName>
```

- `<ownerName>` - Organizationやユーザー名。 ex. oosugi20/zenhub-runner の oosugi20
- `<repoName>` - リポジトリ名。 ex. oosugi20/zenhub-runner の zenhub-runner

月内にcloseしたけど、estimateが付いていないIssueを確認し、
見つかったIssueのURLを一覧で吐き出す。

プロンプトで一覧から任意のURLを選ぶとブラウザで開く。
cli上では、続けて次のURLを選ぶことが可能。
プロンプトに表示される一覧を更新するには、プロンプトの選択肢の `[UPDATE]` を選ぶ。

これは、以下の流れを想定している。

1. タスクを実行してチェックする
2. 見つかったIssueを選んでブラウザで開く
3. ブラウザ上でもろもろ確認した上でestimateをつける
4. ターミナルに戻る
5. 2に戻る or 更新して2に戻る

なにもしないで抜ける場合には、プロンプトの選択肢の `[QUIT]` を選ぶ。


## cleanup-monthly-epic

```
$ zenhub-runner cleanup-monthly-epic <ownerName> <repoName> <issueNumber>
```

- `<ownerName>` - Organizationやユーザー名。 ex. oosugi20/zenhub-runner の oosugi20
- `<repoName>` - リポジトリ名。 ex. oosugi20/zenhub-runner の zenhub-runner
- `<issueNumber>` - 整理したい月時まとめEpicのissue number（Githubの `#000` の数字部分）

前提として、本来の作業用のIssueやEpicとは別に、その月に消化したIssueをまとめておくEpicを作って運用している。
Issueをcloseするときに、この月時まとめEpicの子としてcloseするIssueを関連付ける。
そうすることで、その月に消化したIssueがまとめられ、確認しやすくなり、作業報告書的にも使える。

ただ、以下のようなIssueがあったとして、

- #1 yyyy年mm月まとめ [Epic]
- #2 aa画面作成 [Epic]
- #3 aa画面: bb機能作成
- #4 aa画面: cc機能作成

前述の手順で進めていると、 #2, #3, #4すべてに #1 が親として関連付けることになる。
そうすると、ZenHubのもともとの機能によりブラウザ上で表示される子Issueの状態一覧部分が以下のようになる。

```
Closed
#3 aa画面: bb機能作成
#4 aa画面: cc機能作成
#2 aa画面作成 [Show epic issues]
 | #3 aa画面: bb機能作成
 | #4 aa画面: cc機能作成
```

このままでも、estimateの合計値などは、重複して計算されることはないが、Issueが多くなると見づらい。

ので、 #3 #4 からは #1 の月時まとめを親として関連付けしたものを外し、 #2 だけ #1 がの月時まとめを親とする状態にし、

```
Closed
#2 aa画面作成 [Show epic issues]
 | #3 aa画面: bb機能作成
 | #4 aa画面: cc機能作成
```

と表示されるようにしたい。

が、手作業でやるのは面倒。

これを自動化したものが、このタスクで、以下のことを行う。

月時まとめEpicのissueNumberを指定して実行する。
関連付けられたIssue群の中から、Epicになっているもの（中Epic）を探す。
中EpicがもつIssue群がすべて月内にcloseされているかどうか確認する。
すべて月内に閉じられている場合、子Issueからは月時まとめEpicへの関連付けを外す。

### 注意

複数のリポジトリをまたぐEpicには対応していない。


# 利用準備

1. このリポジトリをクローン
1. Githubのtokenを `./config/token/github` として置く
1. ZenHubのtokenを `./config/token/zenhub` として置く
