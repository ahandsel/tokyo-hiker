# How-to guides structure and template

This document outlines how the "how-to guide" help documentation should be structured, along with a template to follow.


## Change log

* 2026-02-24 - Polished JA and EN templates to sync with each other.


## Table of contents <!-- omit in toc -->

* [Change log](#change-log)
* [Structure for the how-to guide](#structure-for-the-how-to-guide)
* [English template for the how-to guide](#english-template-for-the-how-to-guide)
* [Japanese document writing style guide](#japanese-document-writing-style-guide)
* [Japanese template for the how-to guide](#japanese-template-for-the-how-to-guide)


## Structure for the how-to guide

| Section in English       | Section in Japanese           | Heading level | Required?                        | Guidance                                                                                               |
| ------------------------ | ----------------------------- | ------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Title                    | `タイトル`                    | H1            | Yes                              | Guide title should clearly indicate the task.                                                          |
| Overview                 | `概要`                        | H2            | Yes                              | 3 to 4 bullets introducing the guide; clearly state the task; include goal and target audience.        |
| Table of contents        | `目次`                        | H2            | Yes                              | List following H2 headings only                                                                        |
| Important notice         | `重要なお知らせ` / `注意事項` | H2            | Optional                         | For warnings or crucial information; keep to one to two sentences with only critical restrictions.     |
| Change log               | `変更履歴`                    | H2            | Optional                         | Use `Date - Description of changes made to the product or document.`                                   |
| Preparations             | `事前準備`                    | H2            | Optional                         | List what readers need to do before continuing with the steps.                                         |
| Steps to complete [task] | `[タスク]を完了する手順`      | H2            | Yes                              | Main procedure section.                                                                                |
| Step 1                   | `ステップ1`                   | H3            | Yes (under steps)                | Add a brief step summary and include `SubStep 1`.                                                      |
| Additional information   | `補足情報`                    | H2            | Optional                         | Extra details or helpful tips.                                                                         |
| Restrictions             | `制限事項`                    | H2            | Optional                         | Outline any limitations or constraints related to the task or feature.                                 |
| Troubleshooting          | `トラブルシューティング`      | H2            | Optional                         | Section to cover common issues and solutions.                                                          |
| Common issue 1           | `よくある問題1`               | H3            | Optional (under troubleshooting) | Use a clear issue title.                                                                               |
| FAQs                     | `よくある質問`                | H2            | Optional                         | Section for frequently asked questions about the topic or task.                                        |
| Question 1               | `質問1`                       | H3            | Optional (under FAQs)            | Use a clear question title.                                                                            |
| Glossary                 | `用語集`                      | H2            | Optional                         | Use `**Term** - Definition` format to define key terms. <br> Link terms to external sources as needed. |


## English template for the how-to guide

<!-- prettier-ignore -->
```md
# Title - How-to guide template

## {Internal} Change log <!-- omit in toc -->

* Date - Description of changes made to the document.

## Overview

* 3-4 bullet points introducing and summarizing the guide.
* Highlight key takeaways or main objectives.
* Mention any unique aspects of this guide.
* Clearly state the task that the guide covers.
* Goal: Explain what the reader will achieve.
* Target audience: Specify who should read the guide.

## Table of contents <!-- omit in toc -->

* [Overview](#overview)
* [Important notice (optional)](#important-notice-optional)
* [Change log (optional)](#change-log-optional)
* [Preparations (optional)](#preparations-optional)
* [Steps to complete \[task\]](#steps-to-complete-task)
* [Additional information](#additional-information)
* [Restrictions](#restrictions)
* [Troubleshooting](#troubleshooting)
* [FAQs](#faqs)
* [Glossary (optional)](#glossary-optional)

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

Before beginning, ensure the following:

1. **[Preparation step 1]** - Brief description.

## Steps to complete [task]

### Step 1

> Brief summary of step 1.

1. **SubStep 1** - Brief description.

## Additional information

Provide any supplementary details, insights, or best practices relevant to the topic.

## Restrictions

This [feature] is **[mention extent of availability or supported scenarios]**. Be aware of the following limitations:

* Restriction 1
* Restriction 2

## Troubleshooting

Address common issues encountered when using this reference information:

### Common issue 1

* Solution

## FAQs

Here are some frequently asked questions about **[topic or task]**:

### Question 1

* Answer

## Glossary (optional)


**[Term 1][term-1]** - Definition

[term-1]: https://www.example.com/term1

```

---


## Japanese document writing style guide

* Refer to [Japanese technical document writing style guide][] for writing style rules.
* For additional information, refer to [Documentation content style guide - Japanese][].

[Japanese technical document writing style guide]: ../technical-style-guide-japanese.md
[Documentation content style guide - Japanese]: ../general-style-guide-japanese.md


## Japanese template for the how-to guide

<!-- prettier-ignore -->
```md
# タイトル

## 変更履歴 <!-- omit in toc -->

* [日付] - [変更内容]

## 概要

> * 箇条書き 3〜4 行で、設定ガイドの内容を簡潔に紹介します。以下のような点を含めてください。
>   * 何の設定をするためのページなのか
>   * 例：「この設定ガイドでは、〇〇する手順を説明します。」
>   * 何ができるようになるのか
>     * 例：「この設定を行うことで、〇〇が可能になります。」「最終ゴールは、〇〇できるようにすることです。」
> * 手順に入る前に知っておくべき内容があれば、ここに記載しても OK です。
>   * 例：「設定には、Microsoft Entra ID の管理者権限が必要です。」「手順には、Microsoft Entra ID での操作が含まれます。」
> * 想定読者を記載しておくと、読み手が自分に必要な情報かどうか判断しやすくなります。
>   * 例： 「この設定ガイドは、Microsoft Entra ID の管理者の方を対象としています。」「〇〇を実現したい〇〇者向けです。」
> * ですます調を使います。

## 目次 <!-- omit in toc -->

* [概要](#概要)
* [注意事項（任意）](#注意事項任意)
* [変更履歴（任意）](#変更履歴任意)
* [事前準備（任意）](#事前準備任意)
* [〇〇の手順](#〇〇の手順)
* [追加情報（任意）](#追加情報任意)
* [制限事項](#制限事項)
* [トラブルシューティング](#トラブルシューティング)
* [よくある質問（FAQ）](#よくある質問faq)
* [用語集（任意）](#用語集任意)

## 注意事項（任意）

> 注意事項があれば記載します。注意事項がなければ、このセクションは省略します。
> 以下のバナー表示を使用しても OK です。使用する場合、内容に合ったバナーを選んでください。（バナーは、「注意事項」セクションのほか、ページ内のどこにでも配置できます。必要に応じて活用してください。）

<br>

> [!NOTE] 補足：読み手に必ず届けたい、設定時に役立つ情報を記載します。
> 例：「設定変更が反映されるまでに最大 24 時間かかることがあります。」「処理が完了する前にブラウザを閉じると、設定が正しく反映されないことがあります。」「ここで取得した〇〇は、Step X の〇〇設定で使用します。」

<br>

> [!TIP] Tips/ヒント：ベストプラクティスや推奨事項を記載します。
> 例：「〇〇に自分のアカウントを追加しておくと、変更があった場合に通知を受け取れます。」

<br>

> [!IMPORTANT] 重要：手順を完了するために必要な情報があれば記載します。
> 例：「手順に入る前に、管理ポータルでディレクトリ連携の設定を完了させておく必要があります。」「現在 管理ポータルがサポートしているプロトコルは OIDC のみです。」

<br>

> [!CAUTION] 注意：操作の結果、起こり得るマイナスの影響を記載します。
> 例：「〇〇の設定を行なうと、すべてのユーザーのデータが上書きされます。もとに戻すことはできません。」

## 変更履歴（任意）

* [日付] - [変更内容]

## 事前準備（任意）

> 手順に入る前に必要な準備があれば記載します。事前準備がなければ、このセクションは省略します。
> 見出しはである調、本文はですます調で書きます。
>
> * 例：見出し「必要な管理権限を確認する」「〇〇が設定済みであることを確認する」
> * 例：本文「以下のアカウントをお持ちであることを確認してください。」「〇〇が設定済みであることを確認してください。」

### [事前準備その 1]

簡潔な説明を記載します。

### [事前準備その 2]

簡潔な説明を記載します。

...

## 〇〇の手順

> 具体的な手順を記載します。手順の番号は「Step 1」「Step 2」のように英語で表記します。
> 見出しはである調、本文はですます調で書きます。

### Step 1：〇〇する

簡潔な説明を記載します。

> 例：「このステップでは、〇〇を取得します。取得した〇〇は Step X の〇〇設定で使用します。」

1. [Step 1-1 の内容]
2. [Step 1-2 の内容]
3. ...

> 複数の操作を一つにまとめて記載するのではなく、操作 1 つに対して 1 つの番号を割り当てるようにします。特に、画面が変わる場合、操作するデバイス（PC、スマホなど）やサービス（管理ポータル、Poll、Entra ID など）が変わる場合は、Step を分けるようにしてください。
> 操作を含まない説明は、手順として記載しません。（「設定が完了しました」「次の画面が表示されます」など）

### Step 2：〇〇する

## 追加情報（任意）

> 補足情報があれば記載します。補足情報がなければ、このセクションは省略します。
> 例：動作環境の情報、他社のドキュメントへのリンク（チュートリアル）、ベストプラクティスなど

## 制限事項

### 制限事項 1

制限事項の内容を記載します。必要に応じて箇条書きで記載しても OK です。

### 制限事項 2

制限事項の内容を記載します。必要に応じて箇条書きで記載しても OK です。

## トラブルシューティング

よくある問題とその解決方法を記載します。

### よくある問題 1(例：〇〇の設定ができない)

解決方法を記載します。必要に応じて箇条書きで記載しても OK です。

### よくある問題 2(例：〇〇の設定を行うとエラーが出る)

解決方法を記載します。必要に応じて箇条書きで記載しても OK です。

## よくある質問（FAQ）

〇〇の時によくある質問を紹介します。

### 質問 1（例：〇〇の設定はどこから行えますか？）

解答を記載します。必要に応じて箇条書きで記載しても OK です。

### 質問 2（例：〇〇するには？）

解答を記載します。必要に応じて箇条書きで記載しても OK です。

## 用語集（任意）

**[用語 1][term-1]** - 定義

[term-1]: https://www.example.com/term1
```
