# General writing style guide for Japanese content

This guide defines the baseline Japanese writing rules that apply across all content.

**Audience:** Human writers and AI writing agents creating or reviewing Japanese content in this repository.

**Scope:** Read this guide before writing or editing any Japanese content. For help-documentation-specific rules, also read the [technical style guide](./technical-style-guide-japanese.md), which supplements and takes precedence over this guide.


## 変更履歴 / Change log

* 2026-04-13 - Word list updated


## 概要 / Table of contents <!-- omit in toc -->

* [変更履歴 / Change log](#変更履歴--change-log)
* [参考リンク / References](#参考リンク--references)
  * [英語用のコンテンツスタイルガイド / English style guide](#英語用のコンテンツスタイルガイド--english-style-guide)
  * [参考にしているガイドライン / Third-party references](#参考にしているガイドライン--third-party-references)
* [言葉づかいと文法ルール / Language and grammar](#言葉づかいと文法ルール--language-and-grammar)
  * [基本ルール / General rules](#基本ルール--general-rules)
  * [冗長表現の回避 / Avoid redundant expressions](#冗長表現の回避--avoid-redundant-expressions)
  * [外来語の安易な使用の回避 / Avoid unnecessary use of katakana-based loanwords](#外来語の安易な使用の回避--avoid-unnecessary-use-of-katakana-based-loanwords)
  * [敬語の使用 / Use of honorifics](#敬語の使用--use-of-honorifics)
  * [能動態と受動態 / Active vs passive voices](#能動態と受動態--active-vs-passive-voices)
  * [否定形と肯定形 / Negative vs positive sentences](#否定形と肯定形--negative-vs-positive-sentences)
  * [略語の使用 / Abbreviations](#略語の使用--abbreviations)
    * [正式名称の併記 / Add full name When using abbreviations](#正式名称の併記--add-full-name-when-using-abbreviations)
  * [絵文字の使用 / Use of emojis](#絵文字の使用--use-of-emojis)
* [表記ルール / Use of different character types](#表記ルール--use-of-different-character-types)
  * [漢字とひらがなの使い分け / Use of kanji and hiragana](#漢字とひらがなの使い分け--use-of-kanji-and-hiragana)
  * [漢字の使用 / Use of kanji](#漢字の使用--use-of-kanji)
  * [算用数字と漢数字の使い分け / Use of arabic and kanji numbers](#算用数字と漢数字の使い分け--use-of-arabic-and-kanji-numbers)
  * [カタカナ語の表記 / Use of katakana terms](#カタカナ語の表記--use-of-katakana-terms)
  * [和欧混植の表記 / Use of alphanumeric characters in Japanese text](#和欧混植の表記--use-of-alphanumeric-characters-in-japanese-text)
* [記号の用法 / Punctuation and symbols](#記号の用法--punctuation-and-symbols)
  * [句点 `。` / Kuten](#句点---kuten)
  * [読点 `、` / Tōten](#読点---tōten)
  * [ピリオド `.` / Periods](#ピリオド---periods)
  * [感嘆符 `！` / Exclamation marks](#感嘆符---exclamation-marks)
  * [カンマ `,` / Commas](#カンマ---commas)
  * [スラッシュ `/` / Slashes](#スラッシュ---slashes)
  * [コロン `:` / Colons](#コロン---colons)
  * [ハイフン `-` / Hyphens](#ハイフン----hyphens)
  * [中黒 `・` / Nakaguro](#中黒---nakaguro)
  * [カギ括弧 `「」` / Quotation marks](#カギ括弧---quotation-marks)
  * [二重カギ括弧 `『』` / Double quotation marks](#二重カギ括弧---double-quotation-marks)
  * [丸括弧 `（）` / Parentheses](#丸括弧---parentheses)
  * [波括弧 `{}` / Curly brackets](#波括弧---curly-brackets)
  * [使用を推奨しない記号 / Punctuations not recommended for use](#使用を推奨しない記号--punctuations-not-recommended-for-use)
* [インクルーシブな言葉遣い / Inclusive language](#インクルーシブな言葉遣い--inclusive-language)
  * [インクルーシブなジョーク / Inclusive jokes](#インクルーシブなジョーク--inclusive-jokes)
  * [感覚的な特徴のみに頼らない表現 / Do not solely rely on sensory characteristics](#感覚的な特徴のみに頼らない表現--do-not-solely-rely-on-sensory-characteristics)
* [国際化を意識した文章 / Writing for a global audience](#国際化を意識した文章--writing-for-a-global-audience)
  * [明瞭簡潔に / Be clear and concise](#明瞭簡潔に--be-clear-and-concise)
  * [一貫した表現を使う / Use consistent terminology](#一貫した表現を使う--use-consistent-terminology)
  * [能動態を使う / Use active voice](#能動態を使う--use-active-voice)
  * [合成名詞を避ける / Avoid using compound nouns](#合成名詞を避ける--avoid-using-compound-nouns)
  * [「的」、「性」、「系」を避ける / Avoid "的", "性", and "系"](#的性系を避ける--avoid-的-性-and-系)
* [定型情報 / Formatting](#定型情報--formatting)
  * [日付と時刻の書き方 / Date and time formats](#日付と時刻の書き方--date-and-time-formats)
    * [相対日時 / Relative date and time](#相対日時--relative-date-and-time)
    * [日付のみ / Date only](#日付のみ--date-only)
    * [日付と時刻 / Date and time together](#日付と時刻--date-and-time-together)
  * [時刻の書き方 / Time format](#時刻の書き方--time-format)
  * [補足：実装について / Supplementary information: Implementation](#補足実装について--supplementary-information-implementation)
* [用事用語集 / Word list](#用事用語集--word-list)
  * [⚠️することができる](#️することができる)
  * [⚠️上限に到達する（達する）vs 上限を超過する（超える）](#️上限に到達する達するvs-上限を超過する超える)
* [対訳集 / Official translations](#対訳集--official-translations)


## 参考リンク / References


### 英語用のコンテンツスタイルガイド / English style guide

* [Content style guide - English](./general-style-guide-english.md)


### 参考にしているガイドライン / Third-party references

* [SmartHR Design System - ライティングスタイル](https://smarthr.design/products/contents/writing-style/)


## 言葉づかいと文法ルール / Language and grammar


### 基本ルール / General rules

* 会話体で書くこと。シンプルで平易な表現で、日常的に使われる言葉を使って書くこと。
  * OK ✅：`しばらくお待ち下さい`
  * NOT ❌：`暫くの間お待ちいただきますよう宜しくお願いいたします`


### 冗長表現の回避 / Avoid redundant expressions

* 動詞の名詞化を避ける。動詞を名詞化すると、冗長な表現になりやすい。
  * OK ✅：`ユーザーを作成します`
  * NOT ❌：`ユーザーの作成を実施します`
* 同一単語の重複に注意する。文脈から意味が明確な場合は省略する。
  * OK ✅：`お知らせアプリを開いて、トップページの「お知らせを作成」ボタンをクリックします`
  * NOT ❌：`お知らせアプリを開いて、お知らせアプリのトップページの「お知らせを作成」ボタンをクリックします`
* 「〜こと」を使う場合は、冗長にならないように注意する。「〜ことができます」「〜ことが可能です」「〜ことに役立ちます」などの表現は、冗長になりやすいので、シンプルな表現に言い換えることを検討する。
  * OK ✅：`この機能を使うと、アカウント管理を一元化できます。`
  * NOT ❌：`この機能を使うことで、アカウント管理を一元化することができます。`
  * NOT ❌：`この機能は、アカウント管理を一元化することを可能にします。`


### 外来語の安易な使用の回避 / Avoid unnecessary use of katakana-based loanwords

* 日本語で自然に表現できる場合は、安易にカタカナ語を使わないこと。
  * OK ✅：`ユーザーを作成します`
  * NOT ❌：`ユーザーアカウントをプロビジョニングします`
  * OK ✅：`このアプリは、従業員に重要な情報を届けるために作られています。`
  * NOT ❌：`このアプリは、従業員に重要な情報を届けるためにデザインされています`
  * NOT ❌：`このアプリは、従業員に重要な情報を届けるためにデザインされたソリューションです`


### 敬語の使用 / Use of honorifics

* 冗長な日本語にならないよう、敬語の多用は避ける。
  * OK ✅：`〜を確認してください。`
  * NOT ❌：`〜をご確認いただけますようお願いいたします。`


### 能動態と受動態 / Active vs passive voices

行為者に焦点を当てたい場合は能動態を使い、行動の結果に焦点を当てたい場合は受動態を使う。

⚠️注意：受動態を使うと誰が何を行うべきかがわかりにくくなり、翻訳時に問題が生じうるため、受動態を使う場合は適切な文脈かどうかを確認すること。

使い分けの例：

* `アカウントを作成します。`
  * ユーザーが動作主で、ユーザーに何かを行ってもらう場合は能動態を使う。主語は行為者。
  * ⚠️注意：このようなケースで受動態を使うと、誰が何を行うべきかがわかりにくくなる。
  * 文脈に応じて「アカウントを作成しましょう」や「アカウントを作成してください」と同じニュアンスになる。
* `アカウントが作成されます。`
  * 結果どうなるかに焦点を当てるために受動態を使う。主語は結果。
* `「作成」をクリックすると、アカウントが作成されます。`
  * 能動態と受動態を組み合わせて使うことで、ユーザーの行動とその結果を明示することができる。
  * NOT ❌：`「作成」がクリックされると、アカウントが作成されます。`


### 否定形と肯定形 / Negative vs positive sentences

* 肯定形で表現できることは肯定形で表現する。
* 注意、制限、禁止事項を伝えるときは、「できないこと」「してはいけないこと」を明確に伝えるために否定形を使う。
* 二重否定形は、意味が逆転し混乱を招く恐れがあるので、避けること。
* 例：
  * OK ✅：正しく設定すると、正常に動作します。
  * OK ✅：設定に失敗すると、正常に動作しません。
  * NOT ❌：正しく設定しないと、正常に動作しません。


### 略語の使用 / Abbreviations

長い名称や繰り返し使う用語を略語にすると、読みやすい文章にすることができ、読み手にとって時短になる。一方、専門的な略語を使用するとかえって読み手の負担になってしまう恐れがあるため、本当に使用すべきどうかを十分に検討すること。


#### 正式名称の併記 / Add full name When using abbreviations

* 略語が読み手にとって馴染みのないものである場合、初出時に正式名称を記載し、括弧書きで略語を添えること。
  * 例：「シングルサインオン（SSO）を利用すると、一度の認証で複数のサービスにサインインできます。」

例外：

* 略語の初出箇所がタイトルや見出しである場合、その場では正式名称を使用しなくても OK。本文中での初出時に正式名称を併記すること。
* 一般的な用語として広く使われている略語は、正式名称を使用するとかえってわかりにくくなるため、略語のみを使うこと。
  * 例：API、URL、PDF、CSV、XML、DVD、PC、TV、USB


### 絵文字の使用 / Use of emojis

* 絵文字は使わない。
* 特別な事情により絵文字を使う場合は、以下のルールに従う。
  * 絵文字は最後の一文のみに使う。
  * 文と絵文字の間にはスペースを入れない。
  * 絵文字をつけた文には句点をつけない。


## 表記ルール / Use of different character types


### 漢字とひらがなの使い分け / Use of kanji and hiragana


### 漢字の使用 / Use of kanji

* 常用漢字表にない読み方は使わない。（特別な理由がある場合はその限りではない。）
  * 例：
    * OK ✅：`思い`、`古い`
    * NOT ❌：`想い`、`旧い`
  * 参考：[文科省の常用漢字一覧表](https://www.bunka.go.jp/kokugo_nihongo/sisaku/joho/joho/kakuki/14/pdf/jyouyou_kanjihyou.pdf)
* ひらがなにしたほうが読みやすい漢字はひらがなで書く。
  * 例：
    * OK ✅：`メンテナンス中のため、しばらくの間ご利用いただけません。`
    * NOT ❌：`メンテナンス中の為、暫くの間ご利用頂けません。`
  * 参考：[ひらがなで書くべき漢字のまとめ：企業サイトで使用する「ひらく漢字」「ひらかない漢字」｜コリス](https://coliss.com/articles/build-websites/operations/notational-convention-for-writing.html)
* その他参考にする書籍：
  * [日本語スタイルガイド（第 3 版） - 一般社団法人テクニカルコミュニケーター協会編著](https://jtca.org/learn-tc/publication/guide_jsg/)


### 算用数字と漢数字の使い分け / Use of arabic and kanji numbers

* 数えられる場合や任意の数に置き換えても通用する語句の場合は半角の算用数字を使う。
  * 日付：2023 年 7 月 29 日
  * 数値：5 億 6,000 万
  * 金額：定価は 36,530 円
  * 助数詞付きの数字：3 つの事柄、2 台の車両、3 回目で合格、第 10 回大会、組み合わせは 20 通り
  * 期間：3 か月経ったら
* 熟語や固有名詞には漢数字を使う。
  * 熟語、成句：世界一、一進一退、一部分、二言目、二の舞、二の足
  * 固有名詞：九州、二条城、三軒茶屋
  * 概数：数十倍、数百回
  * 貨幣：千円札、五百円玉
  * 副詞：一般的に、一応、一切
  * 形容詞：四角い


### カタカナ語の表記 / Use of katakana terms

* 外来語の語尾の長音記号は基本的に省略しない。
  * OK ✅：ユーザー、サーバー、プリンター、フッター、メモリー、モニター、ドライバー
* ただし、固有名称や専門用語など、すでに定義されており一般的に普及している表現はその限りではない。
  * 例：音声ブラウザ、サードパーティ


### 和欧混植の表記 / Use of alphanumeric characters in Japanese text

英数字と日本語文字を併用した文章では、英数字と文字の前後に半角スペースは入れない。

* OK ✅：`保存済みのPDFファイル（3件）を開く`
* NOT ❌：`保存済みの PDF ファイル（3 件）を開く`


## 記号の用法 / Punctuation and symbols


### 句点 `。` / Kuten

* 文の終わりを示す。


### 読点 `、` / Tōten

* 文の途中の切れ目や同格の語句の並列に使う。
  * 同格の語句の並列の例：`カンガルー、コアラ、ワラビー`


### ピリオド `.` / Periods

* 小数点を示す。半角で表記する。
  * 例：`3.141`
* 3 つ続けて使い、動作が進行していることを示す。半角で表記する。
  * 例：`読み込み中...`、`CSVファイルを作成中...`
* URL やメールアドレスに使用する。
  * 例：`https://example.example/`、`
* ⚠️注意：句点の代わりには使わない。
  * NOT ❌：`保存しました.`


### 感嘆符 `！` / Exclamation marks

* 演算子の一部として使用する。
  * 例：`!=`演算子
* 強調や感情を表すために使用することは避ける。過度に強調されているような印象を与える恐れがあるため。
  * NOT ❌：`おめでとうございます！設定完了です。`
* 英語で使用されている場合であっても、日本語では使用しないこと。


### カンマ `,` / Commas

* 数値の桁区切りに使う。半角で表記する。
  * 例：`1,000,000`
* ⚠️注意：読点の代わりには使わない。
  * NOT ❌：`保存しました,次のステップに進んでください。`、`カンガルー,コアラ,ワラビー`


### スラッシュ `/` / Slashes

* 「または」「および」の意味でスラッシュを使わない。一方だけなのか、両方なのか、読み手が判断できず曖昧になるため、語句を書き出すこと。
  * OK ✅：`コーヒーまたは紅茶`、`読み取りまたは書き込み権限`
  * NOT ❌：`コーヒー/紅茶`、`読み取り/書き込み権限`
* 日付、ファイルパス、URL に使用する。半角で表記する。
  * 例：`2023/06/15`、`C:/example/example/example`、`https://example.example/`
* ⚠️注意：分数を表す用法は、分数、「または」、日付など複数の意味で解釈できてしまうため、避けること。特別な理由がある場合は、分数を表す用法であることが明確になるように表現すること。
  * 例：`1/2`


### コロン `:` / Colons

* 時刻や比率を示す。この用法では、半角で表記する。
  * 例：`17:30`、`1:1`、`1:2`
* 例示や意味を記載する際に使う。この用法では、全角で表記する。
  * 例：`例：カンガルー、コアラ、ワラビー`
  * ⚠️ 注意：例示には`例）`や`（例）`は使わない。


### ハイフン `-` / Hyphens

* 住所や電話番号の区切りに使う。半角で表記する。
  * 例：`東京都〇〇区〇〇1-2-3`、`12-3456-7890`


### 中黒 `・` / Nakaguro

* 単語を並列し、まとまった概念を示す。
  * 例：`小・中学校`、`東海道・山陽新幹線`、`食品・雑貨売り場`、`新機能の有効・無効`
* 外来熟語の単語の区切りとして使う。
  * 例：`ドラッグ・アンド・ドロップ`

⚠️注意：以下の用法は避ける。

* 文章内で同格の語句の並列
  * 係り受けの関係が曖昧になるため、この用法は避ける。
    * OK ✅：`このボタンは、ユーザーの追加画面、ユーザーの削除画面、ユーザー情報の編集画面に表示されます。`
    * NOT ❌：`このボタンは、ユーザーの追加・削除・情報の編集画面に表示されます。`
* 箇条書き記号の代わり
  * 実装上箇条書き記号として扱われず、音声ブラウザやスクリーンリーダーで箇条書きとして読み上げられない。箇条書きにしたい場合は箇条書きとして実装するのが良い。


### カギ括弧 `「」` / Quotation marks

* 引用を示す。
  * 例：`「再度お試しください」というメッセージが表示されます。`
* 特別な用法を示す、物事の呼称を定める、用語を定義する。
  * `「システム管理者」とは、システムの設定や管理を行うユーザーを指します。`


### 二重カギ括弧 `『』` / Double quotation marks

* カギ括弧の中にさらにカギ括弧を使用したい場合に使う。
  * 例： `「『保存』ボタンをクリックしてください」というメッセージが表示されます。`


### 丸括弧 `（）` / Parentheses

* 直前の内容を補足説明する場合に使う。あくまで補足であり、省略しても文が成立するようにする。
* 基本的に全角で表記するが、計算式や API トークンの括弧と、日付表記の曜日の括弧は半角で表記する。
  * 例：`1+(3*2)`、`{年}年{月}月{日}日({曜日})`

⚠️注意：

* 重要な情報は丸括弧で表現せず、別の文として表現すること。丸括弧で表現すると、読み飛ばしてしまう可能性があるため。
  * 例：
    * OK ✅：`8桁の数字（例：12345678）を入力してください。`
    * NOT ❌：`8桁の数字（必須）を入力してください。`
* 丸括弧を文中に含める場合は、読みやすさが損なわれないよう、括弧内の内容をできるだけ短くする。長くなってしまう場合は、文を分けることを検討する。
  * 例：
    * OK ✅：`グループ名（例：「開発本部」）を入力し、次のステップに進んでください。`
    * NOT ❌：`グループ名（例：「開発本部」や「営業本部」など、覚えやすく認識しやすい名前）を入力し、次のステップに進んでください。`


### 波括弧 `{}` / Curly brackets

* 変数を示す。半角で表記する。


### 使用を推奨しない記号 / Punctuations not recommended for use

* 米印`※`
  * 「※」は日本独自の記号で、多言語翻訳時に問題が生じる可能性がある。
  * 「※」は音声ブラウザやスクリーンリーダーで認識されないことがあるため、注釈を示す場合は「注意」「注」などの言葉を使うのが良い。
* 引用符（ダブルクオートおよびシングルクオート）`""``''`
  * 日本語では馴染みがないため使用しない。引用にはカギ括弧か二重カギ括弧を使う。
* 隅付き括弧`【】`
  * 他の記号と用法が重複するため、使用しない。
    * 補足の場合は丸括弧を使う。
    * 強調の場合はスタイル（例：太字）で表現する。
* 角括弧 `[]`
  * 他の記号と用法が重複するため、使用しない。
    * 補足の場合は丸括弧を使う。
* アンドマーク `&`
  * 使わない。文脈に応じて、「と」や「そして」などの適切な表現に書き下す。

UI 文言の場合、スクリーンリーダー対応を考慮し、上記以外にも使用を推奨しない記号がある。詳細は、別途用意されているアクセシブルネームのスタイルガイドを参照のこと。


## インクルーシブな言葉遣い / Inclusive language


### インクルーシブなジョーク / Inclusive jokes

ジョークを取り入れる場合、それが誰にでも伝わるものであることを確認すること。

* 書籍や映画に関するジョークなど、特定の文化的知識を持っている人にだけ伝わるジョークは使わない。
* ダジャレなど、その言語がわかれば誰でも理解できるジョークは使っても良い。


### 感覚的な特徴のみに頼らない表現 / Do not solely rely on sensory characteristics

色、形、大きさ、位置、方向、音などの感覚的な特徴に頼った表現は避けること。
このような特徴にのみ頼った表現を用いると、ユーザーの特性や使用されるデバイスによっては意味が不明確になったり誤解を招いたりする可能性がある。感覚的な特徴を説明に使うこと自体は問題ないが、どんなユーザーにも伝わる表現になっているかを確認の上で使用すること。

* ユーザーの特性の例：視覚障がいのあるユーザーの中には、色、形、大きさを認識できない場合がある。
* 端末の例：モバイル端末とデスクトップ端末では画面上の要素の位置や方向が異なる可能性がある。スクリーンリーダーを使用した場合も同様。

* OK ✅：`編集アイコン`、`オプションボタン（⋮）`、`行の左端`、`赤い文字で表示されるエラー`、`緑の成功バナー`
* NOT ❌：`鉛筆のアイコン`、`三点ボタン`、`行の端`、`赤い文字`、`緑のバナー`


## 国際化を意識した文章 / Writing for a global audience


### 明瞭簡潔に / Be clear and concise

日本語は、文脈の共有度が高かったり、省略可能な文構成要素も多かったりと、曖昧さが生じやすい言語である。

多言語翻訳された場合にもメッセージが正しく伝わるよう、明瞭で簡潔な表現を心がけること。


### 一貫した表現を使う / Use consistent terminology

同じ意味のものを別の単語や言い回しで表現をするのは避け、一貫した表現を使うこと。

ただし、ユーザーの理解を促すために別の表現に言い換える場合は、意図的なものなのでその限りではない。この場合、同じ意味であることが十分に明確かどうか確認すること。


### 能動態を使う / Use active voice

行動の結果に焦点を当てたい場合は受動態を使うのが良いが、受動態を使うと動作主の情報が省略され、誰が何を行うべきかがわかりにくくなる。

翻訳時に問題が生じうるため、受動態を使う場合は適切な文脈かどうかを確認すること。

詳細は、[能動態と受動態](#能動態と受動態--active-vs-passive-voices)を参照のこと。


### 合成名詞を避ける / Avoid using compound nouns

複数の名詞を独自に組み合わせて合成名詞を作ると、定義されていないゆえに違う解釈で意味が取れることもある。

曖昧さをなくすため、特段の理由なく合成名詞を作るのは避けること。

ただし、固有名称や専門用語など、定義されているものを使うのは OK。


### 「的」、「性」、「系」を避ける / Avoid "的", "性", and "系"

「〜的」、「〜性」、「〜系」といった接尾辞は曖昧な表現なので、できるだけ避ける。


## 定型情報 / Formatting


### 日付と時刻の書き方 / Date and time formats

現在、以下の 3 つの表記が利用可能。

| 表記                                              | テンプレート                              | 例                        |
| ------------------------------------------------- | ----------------------------------------- | ------------------------- |
| [相対日時](#相対日時--relative-date-and-time)     | `今日 {24時間表記}`                       | `今日 14:18`              |
| [日付のみ](#日付のみ--date-only)                  | `{年}年{月}月{日}日({曜日})`              | `2025年5月20日(火)`       |
| [日付と時刻](#日付と時刻--date-and-time-together) | `{年}年{月}月{日}日({曜日}) {24時間表記}` | `2025年5月20日(火) 14:18` |


#### 相対日時 / Relative date and time

* 相対日時に使用する表現は`今日`に限る。明日、昨日、1 か月前など、その他の表現は使用しないこと。
* `今日`と時刻の間には半角スペースを入れる。
* 時刻の表記についての詳細は、[時刻の書き方](#時刻の書き方--time-format)を参照のこと。


#### 日付のみ / Date only

* 年、月、日を漢字で表記する。スラッシュやハイフンを用いた表記（例：2025/02/10、2025-02-10）は使用しない。
* 曜日は括弧書きで表記する。括弧は半角を使用する。

> [!NOTE]  
> 2025 年 7 月時点では、日付のみの表記を使用している製品はない。


#### 日付と時刻 / Date and time together

* [日付のみ](#日付のみ--date-only)に記載の表記に続けて、24 時間表記の時刻を記載する。
* 日付と時刻の間には半角スペースを入れる。
* 時刻の表記についての詳細は、[時刻の書き方](#時刻の書き方--time-format)を参照のこと。


### 時刻の書き方 / Time format

* 日本語では、24 時間表記を使用する。12 時間表記は使用しない。
* 時刻の範囲を示す場合は、半角のハイフン（-）を使用する。ハイフンの前後には半角スペースを入れない。
  * 例：`14:00-15:00`


### 補足：実装について / Supplementary information: Implementation

* ライブラリ：i18next
  * [DateTime - i18next documentation](https://www.i18next.com/translation-function/formatting#datetime)
* 日付と時刻の表記に使用する API：ECMAScript
  * [Intl.DateTimeFormat (English)](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
  * [Intl.DateTimeFormat (Japanese)](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)

実装されているコード：

```js
console.log(
  new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZone: 'America/Los_Angeles',
  }).format(date),
);
```


## 用事用語集 / Word list


### ⚠️することができる

冗長になるため、できるだけ避ける。「`できる`」を使う。


### ⚠️上限に到達する（達する）vs 上限を超過する（超える）

上限に達してそれ以上アクションができない状態を表す場合、「上限に到達する（達する）」を使う。上限を超えている状態を表す場合、「上限を超過する（超える）」を使う。

具体例：

* 「上限に到達する（達する）」：上限の 10 件が選択されている状態は、「上限に到達した」と表現できる。11 件目を選択しようとすると、システムがアクションを許可せず、選択済みの 10 件のうちどれかを選択解除するまで 11 件目を選択できない状態も「上限に到達した」と表現できる。
* 「上限を超過する（超える）」：10 件まで選択できるフォームで 11 件選択されている状態は、「上限を超過している」と表現できる。この状態でフォームを送信しようとすると、システムがフォームの送信を許可せず、選択されている件数を 10 件以下に減らすよう促す状態も「上限を超過している」と表現できる。

文言の例：

* 「上限に到達する（達する）」：
  * `一日の送信回数が上限の10回に達しました。24時間後に再度送信できるようになります。`
  * `サーバーの処理の上限に達したため、操作を完了できませんでした。しばらく時間をおいて再度お試しください。`
* 「上限を超過する（超える）」：
  * 見出し：`対象範囲のユーザーが上限の10,000人を超えています`、本文：`現在12,400人が選択されています。上限におさまるように条件を変更してください。`
  * `文字数制限を超過しています。{{overCount}}文字減らしてください。`


## 対訳集 / Official translations

[glossary](./glossary.yaml)を参照のこと。
