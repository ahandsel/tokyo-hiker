# Reference document structure and template

This document outlines the structure and template for the reference document.

Reference documents are **technical descriptions** of the software and how to operate it. Reference document is **information-oriented**.


## Change log

* 2026-02-18 - Made the Change log section optional.


## Table of contents <!-- omit in toc -->

* [Change log](#change-log)
* [Structure for the reference document](#structure-for-the-reference-document)
* [English template for the reference document](#english-template-for-the-reference-document)
* [Japanese template for the reference document](#japanese-template-for-the-reference-document)


## Structure for the reference document

* Title (h1)
* {Internal} Change log (h2)
  * Date - Description of changes made to the document.
* Overview (h2)
  * 3 to 4 bullet points introducing and summarizing the document.
  * Clearly state the purpose of the document.
  * Topic: Explain what the reader will learn.
  * Target audience: Specify who should read the document.
* Table of contents (h2)
  * Lists h2 and h3 headings that follow.
  * Do not include the "{Internal} Change log" or "Table of contents" sections.
* Important notice (h2) (optional)
  * For warnings or crucial information.
  * Maximum of one to two sentences; include only critical restrictions.
* Change log (h2) (optional)
  * Date - Description of changes made to the product or document.
* Preparations (h2) (optional)
  * Instructions readers must follow before acting on the information (e.g., API token generation).
* Main topic (h2)
  * Point A
  * Point B
  * Subtopic 1 (h3)
    * Point 1-A
    * Point 1-B
  * Subtopic 2 (h3)
    * Point 2-A
    * Point 2-B
* Additional information (h2)
  * Extra details or helpful tips.
* Restrictions (h2)
  * Clearly outline any limitations on feature availability or support.
* Troubleshooting (h2)
  * Common issue (h3)
    * Solution
* FAQs (h2)
  * Question (h3)
    * Answer
* Glossary (h2) (optional)
  * Definitions of terms used in the document.
  * Format each glossary entry as `**Term** - Definition`.


## English template for the reference document

<!-- prettier-ignore -->
```md
# Title - Reference Document Template


## {Internal} Change log <!-- omit in toc -->

* Date - Description of changes made to the document.


## Overview

* 3-4 bullet points introducing and summarizing the document.
* Clearly state the purpose of the document.
* Highlight main topics covered and key insights.
* Mention any unique aspects or important points of the document.
* Topic: Explain what the reader will learn.
* Target audience: Specify who should read the document.


## Table of contents <!-- omit in toc -->

* [Change log](#change-log)
* [Structure for the reference document](#structure-for-the-reference-document)
* [English template for the reference document](#english-template-for-the-reference-document)
* [Japanese template for the reference document](#japanese-template-for-the-reference-document)


## Important notice (optional)

> Add this section only when readers need critical context before or during the task.

<br>

> [!NOTE] Note: Highlights useful information that helps readers complete or understand the task.
> Example: "It can take up to 24 hours for configuration changes to be reflected."

<br>

> [!TIP] Tip: Shares best practices or recommendations.
> Example: "Add your account to notifications so you can track future changes."

<br>

> [!IMPORTANT] Important: Provides critical requirements needed to complete the task.
> Example: "Before you start this setup, complete the directory synchronization configuration in directory sync."

<br>

> [!CAUTION] Caution: Warns readers about possible negative outcomes, such as data loss.
> Example: "This action overwrites all user data and cannot be undone."


## Change log (optional)

* Date - Description of changes made to the product or document.


## Preparations (optional)

Before using the information in this document, ensure the following:

1. **[Preparation step 1]** - Brief description (e.g., generating an API token).


## Main topic

Briefly introduce the main topic.


### Subtopic 1

* Point 1-A - Explanation or details about point 1-A.
* Point 1-B - Explanation or details about point 1-B.


### Subtopic 2

* Point 2-A - Explanation or details about point 2-A.
* Point 2-B - Explanation or details about point 2-B.


## Additional information

Provide any supplementary details, insights, or best practices relevant to the topic.


## Restrictions

This [feature] is **[mention extent of availability or supported scenarios]**. Be aware of the following limitations:

* Restriction 1
* Restriction 2


## Troubleshooting

Address common issues encountered when using this reference information:


### Common issue 1

* Solution or guidance to resolve common issue 1.


## FAQs

Here are some frequently asked questions about **[relevant topics]**:


### Question 1

* Answer or detailed explanation.


## Glossary (optional)

* *[Term 1][]** - Definition


[Term 1]: https://www.example.com/term1


```


## Japanese template for the reference document

<!-- prettier-ignore -->
```md
 # タイトル


## 変更履歴 <!-- omit in toc -->

* [日付] - [変更内容]


## 概要

* 箇条書き 3〜4 行で、ページの内容を完結に紹介します。以下のような点を含めてください。
  * 何の設定をするためのページなのか
  * 何ができるようになるのか
* ページの内容を読む前に知っておくべき内容があれば、ここに記載しても OK です。
* 想定読者を記載しておくと、読み手が自分に必要な情報かどうか判断しやすくなります。
* ですます調を使います。


## 目次 <!-- omit in toc -->

* [Change log](#change-log)
* [Structure for the reference document](#structure-for-the-reference-document)
* [English template for the reference document](#english-template-for-the-reference-document)
* [Japanese template for the reference document](#japanese-template-for-the-reference-document)
* [Overview](#overview)
* [Important notice (optional)](#important-notice-optional)
* [Change log (optional)](#change-log-optional)
* [Preparations (optional)](#preparations-optional)
* [Main topic](#main-topic)
* [Additional information](#additional-information)
* [Restrictions](#restrictions)
* [Troubleshooting](#troubleshooting)
* [FAQs](#faqs)
* [Glossary (optional)](#glossary-optional)


## 注意事項（任意）

注意事項があれば記載します。注意事項がなければ、このセクションは省略します。
以下のバナー表示を使用しても OK です。使用する場合、内容に合ったバナーを選んでください。（バナーは、「注意事項」セクションのほか、ページ内のどこにでも配置できます。必要に応じて活用してください。）

> [!NOTE] 補足：読み手に必ず届けたい、設定時に役立つ情報を記載します。
> 例：「設定変更が反映されるまでに最大 24 時間かかることがあります。」「処理が完了する前にブラウザを閉じると、設定が正しく反映されないことがあります。」「ここで取得した〇〇は、Step X の〇〇設定で使用します。」

> [!TIP] Tips/ヒント：ベストプラクティスや推奨事項を記載します。
> 例：「〇〇に自分のアカウントを追加しておくと、変更があった場合に通知を受け取れます。」

> [!IMPORTANT] 重要：手順を完了するために必要な情報があれば記載します。
> 例：「手順に入る前に、管理ポータルでディレクトリ連携の設定を完了させておく必要があります。」「現在 管理ポータルがサポートしているプロトコルは OIDC のみです。」

> [!CAUTION] 注意：操作の結果、起こり得るマイナスの影響を記載します。
> 例：「〇〇の設定を行なうと、すべてのユーザーのデータが上書きされます。もとに戻すことはできません。」


## 変更履歴（任意）

* [日付] - [変更内容]


## 事前準備（任意）

手順に入る前に必要な準備があれば記載します。事前準備がなければ、このセクションは省略します。
見出しはである調、本文はですます調で書きます。


### [事前準備その 1]

簡潔な説明を記載します。

### [事前準備その 1]

簡潔な説明を記載します。

## トピック

簡潔にトピックを紹介します。


### サブトピック 1


### サブトピック 2


## 追加情報（任意）

Provide any supplementary details, insights, or best practices relevant to the topic.


## 制限事項

### 制限事項 1

制限事項の内容を記載します。必要に応じて箇条書きで記載しても OK です。


### 制限事項 2

制限事項の内容を記載します。必要に応じて箇条書きで記載しても OK です。


## トラブルシューティング

よくある問題とその解決方法を紹介します。


### よくある問題 1(例：〇〇の設定ができない)

解決方法を記載します。必要に応じて箇条書きで記載しても OK です。


### よくある問題 2(例：〇〇の設定を行うとエラーが出る)

解決方法を記載します。必要に応じて箇条書きで記載しても OK です。


## よくある質問）（FAQ）

〇〇の時によくある質問を紹介します。


### 質問 1（例：〇〇の設定はどこから行えますか？）

解答を記載します。必要に応じて箇条書きで記載しても OK です。


### 質問 2（例：〇〇するには？）

解答を記載します。必要に応じて箇条書きで記載しても OK です。


## 用語集（任意）

* *[用語 1][]** - 定義
* *[用語 2][]** - 定義
```
