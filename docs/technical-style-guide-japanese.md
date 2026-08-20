# Technical document writing style guide for Japanese content

This guide defines documentation-specific writing rules for Japanese help documentation.
It supplements the [general style guide](./general-style-guide-japanese.md), which covers baseline language, grammar, character usage, punctuation, and word usage.

**Audience:** Human writers and AI writing agents contributing to the Japanese content in this repository.

**Scope:** Rules in this guide apply to help documentation only (how-to guides, reference documents, tutorials, and explanations). Refer to the general style guide for baseline Japanese writing rules.

**Priority:** When this guide and the general style guide conflict, this guide takes precedence for help and technical documentation.


## 目次 / Table of contents <!-- omit in toc -->

* [言葉づかいと文法ルール / Language and grammar](#言葉づかいと文法ルール--language-and-grammar)
* [表現 / Expressions](#表現--expressions)
* [手順の書き方 / Procedural steps](#手順の書き方--procedural-steps)
* [文の構造 / Sentence structure](#文の構造--sentence-structure)
* [フォーマットルール / Inline formatting](#フォーマットルール--inline-formatting)
* [記号の用法 / Punctuation](#記号の用法--punctuation)
* [バナーの用法 / Alert banners](#バナーの用法--alert-banners)


## 言葉づかいと文法ルール / Language and grammar


### である調、ですます調の使い分け

* 見出しはである調、本文はですます調で書く。
* 見出しの例：ページタイトル、セクションタイトル、サブセクションタイトル、バナータイトル


### 句読点ルール

* 句点「。」は原則として使う。見出しと不完全文には句点を使わない。


### リスト項目の文末の句点ルール

* リスト項目の末尾は統一する。完全な文なら句点あり、断片・体言止めなら句点なし。同一リスト内で混在させないこと。


### 行為者を主語にした能動態を優先する / Use active voice with the actor as the subject

* 行為者を主語にした能動態を優先する。文が平易になり、誰が何をするのかが明確になるため、読み手にとって理解しやすくなる。
* 例えば、以下の 2 つの文では、行為者を主語にした能動態の文の方が短く端的で、誰が何をするのかが明確になっている。
  * 例 1：`管理者は、専用のダッシュボードからお知らせの作成、管理、追跡ができます。`
  * 例 2：`管理者向けには、お知らせの作成、管理、追跡を行える専用のダッシュボードを提供しています。`


## 表現 / Expressions


### 見出しの表記ルール / Headings

* 見出しに使う表現は、ドキュメントのテンプレートに従うこと。
* ドキュメントのテンプレート：
  * [手順ガイド](./templates/how-to-guides-template-structure.md#japanese-template-for-the-how-to-guide)
  * [リファレンスドキュメント](./templates/reference-document-template-structure.md#japanese-template-for-the-reference-document)


### 小見出しと親見出し / Subheadings and parent headings

* 小見出しは、親見出しから文脈が明らかな場合、親見出しの語句を繰り返さずに、親見出しの内容を補足する表現にすること。
* 例：
  * 親見出し：`アプリのインストール方法`
  * 小見出し：
    * OK ✅: `App Storeからインストールする`、`メール通知からインストールする`
    * NOT ❌: `App Storeからアプリをインストールする`


### 日英表記ルール / Japanese-English notation

* 日本語と英語の表記の使い分けは以下のルールに従うこと。
  * UI 要素は、日本語版を使う。
  * 機能名、サービス名、製品名で、日本語表記は存在するが英語表記も広く使われている場合は、日英併記する。
    * 例：管理者ポータル（Admin Portal）
  * 技術用語で、英語が一般的に使われている場合は英語表記を優先する。
    * 例：OIDC、SAML、API、System for Cross-domain Identity Management (SCIM)
* 外部の記事のリンクを貼る場合、日本語版が存在する場合は日本語版を使用する。


## 手順の書き方 / Procedural steps


### 手順で番号を振るのはユーザーの操作のみ / Reserve numbered steps for user actions

「設定完了しました」「次の画面が表示されます」など、システムの反応や操作の結果といったユーザーの操作を含まない説明は手順として記載しない。

**OK ✅:**

```md
4. **保存する**をクリックします。

お知らせが保存され、お知らせ一覧に表示されます。
```

**NOT ❌:**

```md
4. **保存する**をクリックします。
5. お知らせが保存され、お知らせ一覧に表示されます。
```


## 文の構造 / Sentence structure


### 1 文につき 1 つのポイントを伝える / Express one key point per sentence

1 文または 1 節に含めるポイントは 1 つにする。複数のポイントを含む文は、分割して別々の文や節にすること。

**OK ✅:**

```md
すべてのお知らせは、お知らせフィードページに表示され、ワークスペース内のすべてのユーザーが閲覧できます。
```

**NOT ❌:**

```md
すべてのお知らせは、ワークスペース内のすべてのユーザーに対してお知らせのフィードページに表示されます。
```

この文は、どこにお知らせが表示されるかと誰が閲覧できるかの 2 つのポイントを 1 つの節にまとめているため、ポイントがぼやけてしまう。


## フォーマットルール / Inline formatting

ヘルプドキュメントでは、以下のフォーマットルールを使用する。

| フォーマットルール | 用途                                                     | 例                                                                                                         |
| ------------------ | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **太字**           | UI 要素（ボタン名、フィールドラベル、メニュー項目など）  | **保存**ボタンをクリックして、お知らせを保存します。                                                       |
| `コードフォント`   | ユーザーが入力する文字列、コマンド、またはキーボードキー | 内容フィールドに`/`と入力して、スラッシュメニューを開きます。属性値欄には`userPrincipalName`と入力します。 |
| 「引用」           | システムメッセージ（エラー、確認メッセージなど）         | 「権限がありません」というエラーメッセージが表示されます。                                                 |

> [!TIP]
> 太字およびイタリック体は強調する目的では使用しないこと。


## 記号の用法 / Punctuation


### ダッシュ (-) / Dash

ヘルプドキュメントの用語集セクションでは、用語と定義を区切るのにダッシュ（-）を使用する。

**OK ✅:**

```md
## 用語集

**ポータル** - ユーザーがカスタマイズできるホームページ。
```

**NOT ❌:**

```md
## 用語集

**ポータル**: ユーザーがカスタマイズできるホームページ。
```


## バナーの用法 / Alert banners


### バナーの種類 / Types of banners

| バナーの種類   | ラベル | 用途                                                 | 例                                                                                                                                                                                                          |
| -------------- | ------ | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `[!NOTE]`      | 補足   | 読み手に必ず届けたい、設定時に役立つ情報を記載する。 | 「設定変更が反映されるまでに最大 24 時間かかることがあります。」「処理が完了する前にブラウザを閉じると、設定が正しく反映されないことがあります。」「ここで取得した〇〇は、Step X の〇〇設定で使用します。」 |
| `[!TIP]`       | ヒント | ベストプラクティスや推奨事項を記載する。             | 「〇〇に自分のアカウントを追加しておくと、変更があった場合に通知を受け取れます。」                                                                                                                          |
| `[!IMPORTANT]` | 重要   | 手順を完了するために必要な情報を記載する。           | 「手順に入る前に、管理ポータルでディレクトリ連携の設定を完了させておく必要があります。」「現在管理ポータルがサポートしているプロトコルは OIDC のみです。」                                                  |
| `[!CAUTION]`   | 注意   | 操作の結果、起こり得るマイナスの影響を記載する。     | 「〇〇の設定を行なうと、すべてのユーザーのデータが上書きされます。もとに戻すことはできません。」                                                                                                            |

`[!CAUTION]` および `[!IMPORTANT]` と混同されるおそれがあるため、`[!WARNING]` は使用しない。

* 想定される不利益や悪影響に関する注意喚起には、`[!CAUTION]` を使用する。
* 成功に不可欠な重要情報には、`[!IMPORTANT]` を使用する。


### 一行バナー / Single-line banners

一行で表現できる内容であり、リンクや箇条書きなどのテキスト装飾を必要としない場合は、バナーの内容を一行で記載すること。以下のフォーマットを使用すること。

[バナーの種類] ラベル：内容（完全文で書き、句点も使用する）

```md
> [!NOTE] 補足：お知らせの公開または下書き保存するにはタイトルが必須です。
```


### 複数行バナー / Multi-line banners

一行で内容がおさまらない場合や、リンクや箇条書きなどのテキスト装飾が必要な場合は、バナーの内容を複数行で記載すること。以下のフォーマットを使用すること。

[バナーの種類] ラベル：見出し（句点はつけない）
内容（完全文で書き、句点も使用する）

```md
> [!NOTE] 補足：お知らせの公開または下書き保存するにはタイトルが必須
> お知らせのタイトルは、ユーザーがお知らせフィードでお知らせを見つけるための重要な手がかりとなります。タイトルがないと、お知らせが保存できないため、必ずタイトルを入力してください。
```
