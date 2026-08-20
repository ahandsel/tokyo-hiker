# General writing style guide for English content

This guide defines the baseline English writing rules that apply across all content.

**Audience:** Human writers and AI writing agents creating or reviewing English content in this repository.

**Scope:** Read this guide before writing or editing any English content. For help-documentation-specific rules, also read the [technical style guide](./technical-style-guide-english.md), which supplements and takes precedence over this guide.


## Change log

* 2026-04-27 - Revamped the structure to separate UX/technical writing rules and general style rules into different documents


## Table of contents <!-- omit in toc -->

* [Change log](#change-log)
* [References](#references)
  * [Japanese content style guide](#japanese-content-style-guide)
  * [Third-party references](#third-party-references)
    * [Product comparison list](#product-comparison-list)
* [Language and grammar](#language-and-grammar)
  * [General rules](#general-rules)
  * [Active vs passive voices - default to active voice](#active-vs-passive-voices---default-to-active-voice)
    * [Exceptions](#exceptions)
  * [Negative vs positive sentences](#negative-vs-positive-sentences)
  * [First- vs second-person pronouns](#first--vs-second-person-pronouns)
  * [Contractions](#contractions)
  * [Abbreviations](#abbreviations)
    * [Spelling out abbreviations](#spelling-out-abbreviations)
    * [Pluralizing abbreviations](#pluralizing-abbreviations)
  * [Use of emojis - emojis not allowed](#use-of-emojis---emojis-not-allowed)
* [Capitalization](#capitalization)
  * [General rules](#general-rules-1)
* [Punctuation and symbols](#punctuation-and-symbols)
  * [Periods `.`](#periods-)
    * [Periods at the end of sentences](#periods-at-the-end-of-sentences)
    * [Periods with lists](#periods-with-lists)
    * [Periods with lists that use run-in headings](#periods-with-lists-that-use-run-in-headings)
  * [Exclamation marks `!`](#exclamation-marks-)
  * [Slashes `/`](#slashes-)
  * [Colons `:`](#colons-)
  * [Parentheses `( )`](#parentheses--)
  * [Curly brackets `{ }`](#curly-brackets--)
  * [Ampersand `&`](#ampersand-)
  * [Punctuations not recommended for use](#punctuations-not-recommended-for-use)
* [Inclusive language](#inclusive-language)
  * [Inclusive jokes](#inclusive-jokes)
  * [Do not solely rely on sensory characteristics](#do-not-solely-rely-on-sensory-characteristics)
  * [Use gender-neutral pronouns](#use-gender-neutral-pronouns)
  * [Use person-first language](#use-person-first-language)
* [Writing for a global audience](#writing-for-a-global-audience)
  * [Use global English](#use-global-english)
  * [Be clear and concise](#be-clear-and-concise)
  * [Use consistent terminology](#use-consistent-terminology)
* [Formatting](#formatting)
  * [Date and time formats](#date-and-time-formats)
    * [Relative date and time](#relative-date-and-time)
    * [Date only](#date-only)
    * [Date and time together](#date-and-time-together)
  * [Time format](#time-format)
  * [Supplementary information: Implementation](#supplementary-information-implementation)
* [App types](#app-types)
* [Word list](#word-list)
  * [sign-in (noun or adjective), sign in (verb)](#sign-in-noun-or-adjective-sign-in-verb)
  * [single sign-on (noun), single sign-on (adjective), SSO (abbreviation)](#single-sign-on-noun-single-sign-on-adjective-sso-abbreviation)
  * [username](#username)
  * [continue](#continue)
  * [next](#next)
  * [email](#email)
  * [example / e.g., / i.e.,](#example--eg--ie)
  * [emoji](#emoji)
  * [they](#they)
  * [activate / activated / deactivate / deactivated](#activate--activated--deactivate--deactivated)
  * [invite / invitation](#invite--invitation)
  * [link vs. URL](#link-vs-url)
  * [⚠️ please](#️-please)
  * [⚠️ admin vs. administrator](#️-admin-vs-administrator)
  * [⚠️ account](#️-account)
    * [User account settings exceptions](#user-account-settings-exceptions)
    * [Adding an account exception](#adding-an-account-exception)
  * [⚠️ hyphen vs dash](#️-hyphen-vs-dash)
  * [⚠️ Inactive vs Deactivated](#️-inactive-vs-deactivated)
  * [⚠️ limit reached vs limit exceeded](#️-limit-reached-vs-limit-exceeded)
  * [⚠️ let's](#️-lets)
  * [🚫 login (noun or adjective), log in (verb)](#-login-noun-or-adjective-log-in-verb)
  * [🚫 log out](#-log-out)
  * [🚫 sign into](#-sign-into)
  * [🚫 sign-on, sign on](#-sign-on-sign-on)
  * [🚫 sign-up (noun or adjective), sign up (verb)](#-sign-up-noun-or-adjective-sign-up-verb)
  * [🚫 user name](#-user-name)
  * [🚫 account name](#-account-name)
  * [🚫 input (user inputting value)](#-input-user-inputting-value)
  * [roles vs. privileges vs. permissions](#roles-vs-privileges-vs-permissions)


## References


### Japanese content style guide

* [Content style guide - Japanese][japanese-style-guide]

[japanese-style-guide]: ./general-style-guide-japanese.md


### Third-party references

If this guide does not provide explicit guidance, consult these third-party references, depending on the nature of your question.

* **Spelling**: Follow [Merriam-Webster][merriam-webster].
* **Non-technical style**: Follow the [AP Stylebook][ap-stylebook].
  * **Reason**: The AP Stylebook is generally more casual than the Chicago Style, making it a better fit for our "conversational voice."
  * Reference (Ref): [AP vs. Chicago style: the key differences you should know - Lingoda][ap-vs-chicago-lingoda])
* **Technical style**: Follow the [Google Developer Documentation Style Guide][google-dev-style].

[merriam-webster]: https://www.merriam-webster.com/
[ap-stylebook]: https://www.apstylebook.com/
[ap-vs-chicago-lingoda]: https://blog.lingoda.com/en/ap-vs-chicago-style/
[google-dev-style]: https://developers.google.com/style


#### Product comparison list

When comparing writing style or terminology, refer to the following products as they are our primary competitors.

For English copies (conversational tone; friendly voice):

| Product              | Description                                                        |
| -------------------- | ------------------------------------------------------------------ |
| [Slack][]            | Corporate messaging app that promotes integrations and workflows   |
| [Google Workspace][] | Google's productivity suite (Admin Console, Workspace, Chat, etc.) |
| [Airtable][]         | Cloud collaboration service that organizes data in a spreadsheet   |

[Slack]: https://slack.com/
[Google Workspace]: https://workspace.google.com/
[Airtable]: https://airtable.com/

For Japanese copies:

| Product   | Description                                                           |
| --------- | --------------------------------------------------------------------- |
| [LINE][]  | Communication app for the general public that offers various services |
| [freee][] | Cloud-based accounting software for small businesses.                 |

[LINE]: https://line.me/
[freee]: https://www.freee.co.jp/


## Language and grammar


### General rules

* Write in a conversational tone by using simple, everyday language. Keep sentences short and to the point. Avoid using terms or phrases that non-native speakers may not understand.
  * Example: "set a password" instead of "define a password"


### Active vs passive voices - default to active voice

* Use active voice when the subject (doer) of the action is the user.
* > In passive voice, it's easy to neglect to indicate who or what is performing a particular action. In this kind of construction, it's often hard for readers to figure out who's supposed to do something (such as the reader, the computer, the server, an end user, or a visitor to a web page).
* Ref: [Active voice | Google developer documentation style guide][google-active-voice]

[google-active-voice]: https://developers.google.com/style/voice


#### Exceptions

It is okay to use passive voice in the following cases:

* When we want to emphasize the object over the action.
  * Example: "The data is restored."
* When we want to de-emphasize who has performed the action.
  * Example: "Message delivery failed." instead of "You failed to deliver the message."
* When we do not need to tell the readers who's responsible for the action.
  * Example: "This feature is added in the January feature update."


### Negative vs positive sentences

* Use positive sentences over negative sentences when telling users what they can or should do.
  * OK: "You can still proceed even if you skip this step."
  * NOT: "Skipping this step does not prevent you from proceeding."
* Use negative sentences when describing cautions, restrictions, or errors. In these cases, we want to tell users what they cannot or should not do clearly and concisely.
* Avoid double negatives and use clear and direct language.
  * OK:
    * "If you do not select any users, an invitation will not be sent to anyone."
      * OR "Select at least one user to send an invitation to them."
    * "You can still proceed even if you do not complete this step."
      * OR "You can complete this step later."
  * NOT:
    * "Not selecting users here will not send an invitation to them."
    * "Not completing this step will not prevent you from proceeding."


### First- vs second-person pronouns

In general, use second-person pronouns (you, your) to address the user directly. This approach clarifies that the text refers to the user's actions and not to any other entity.

First-person pronouns (I, my, me) should only be used when there is a clear reason for it. Appropriate contexts for using first-person pronouns include the following:

* Proper nouns, such as feature names, service names, and setting names.
* Situations where it is necessary to distinguish the signed-in user from others.
  * For example, filter labels like `Edited by me` and `Edited by others`.
* Situations where we want users to have ownership in agreements or acknowledgments.
  * For example, confirmation checkboxes like `I agree to the terms and conditions` and `Yes, I want to delete this item`.

Avoid combining first-person pronouns (me or my) with second-person pronouns (you or your) in the same context, as this can create confusion about whom the text is addressing.

Ref:

* [Second person and first person | Google developer documentation style guide][google-second-first-person]
* [Pronouns | Material Design][material-pronouns]

[google-second-first-person]: https://developers.google.com/style/person
[material-pronouns]: https://m3.material.io/foundations/content-design/style-guide/word-choice


### Contractions

* Use common contractions to create a friendly, informal tone.
  * Don't
  * Didn't
  * Can't
  * Couldn't
  * Isn't
  * Wasn't
  * You're
  * That's
* Documentation - do not use contractions.
* UX writing - okay to use contractions in general
  * Do not use contractions when writing a change (positive ↔ negative).
    * Use **bold** formatting instead.
    * Example: We went from supporting this feature to **not** supporting this feature.


### Abbreviations

Abbreviations are intended to save the audience time. Avoid using specialized or technical abbreviations that the intended audience may not understand.

* Ref: [Abbreviations | Google developer documentation style guide][google-abbreviations]

[google-abbreviations]: https://developers.google.com/style/abbreviations


#### Spelling out abbreviations

* When introducing a new abbreviation, spell it out the first time it is used with the abbreviation in parentheses.
  * Example: "An identity provider (IdP) is a service that authenticates users."

Exceptions:

* If the first use is in a heading or title, you can spell it out in the first mention in the body text that follows.
* Do not spell out common abbreviations that are recognized as common words (more than abbreviations) by the audience.
  * Examples of common abbreviations: API, URL, PDF, XML, DVD, PC, TV, USB


#### Pluralizing abbreviations

* Generally, treat acronyms and other abbreviations as regular words when making them plural.
  * Example: APIs, URLs, DVDs, USBs


### Use of emojis - emojis not allowed

* In general, do not use emojis in UX copy.
* If emojis are used, follow the rules below:
  * Insert a space between a word and an emoji.
  * Emojis should be placed after the period.
    * OK: `Oops, our servers messed up. 😵‍💫`
    * NOT: `Oops, our servers messed up 😵‍💫.`
  * Emojis should be placed at the end of the message.
  * Alt-Text - turn off the alt-text for emojis
    * Since emojis are not icons, we do not want to use alt-text for emojis.


## Capitalization

* Use [TitleCaseConverter.com][tool-titlecase]'s AP style for capitalization.

[tool-titlecase]: https://titlecaseconverter.com/


### General rules

Use sentence case for everything except proper nouns, quotations, and text that follows a label such as "Note:" or "Caution:".

* Ref: [Capitalization in titles and headings | Google developer documentation style guide][google-capitalization]

[google-capitalization]: https://developers.google.com/style/capitalization#capitalization-in-titles-and-headings


## Punctuation and symbols


### Periods `.`


#### Periods at the end of sentences

Append a period at the end of a sentence if it is an independent clause.

* This applies to all messages including dialog messages, error messages, and banner messages.
* ℹ️ An independent clause is a clause that can form a complete sentence standing alone, having a subject and a predicate.

  Exception:

* If the sentence serves as a heading, title, or menu name, a period is not required.
* Example: The bolded sentence (Your sign-in link has expired) serves as a header, thus no period is used.


#### Periods with lists

Start each list item with a capital letter unless the case is an important piece of information (for example, glossary terms). End each item with a period or other appropriate sentence-ending punctuation.

* Exceptions:
  * If the item consists of a single word, do not add end punctuation.
  * If the item does not include a verb, do not add end punctuation.
  * If the item is entirely in code font, do not add end punctuation.
  * If the item is entirely link text or a document title, do not add end punctuation.


#### Periods with lists that use run-in headings

In general, do not use a period (`.`) at the end of the list when starting with a colon (`:`).

* Example:
  * `Members: Genji, Alex, Sam`
  * `Seb created this discussion and added the following users: Genji, Alex, Sam`

If the list is a complete sentence, use a period at the end.

* Example:
  * `Procedure: open the app, sign in, and go to account settings.`
  * `Seb created this discussion and added the following users: Genji, Alex, Sam, and 7 other members.`


### Exclamation marks `!`

* Avoid using exclamation marks in general. They can appear overly emphatic, alarming, or unprofessional.
* Exception:
  * When necessary for code syntax (e.g., `!=` operator).
  * When a significant milestone or achievement is reached.
* Caution:
  * Overuse of exclamation marks can diminish their impact. Always question if an exclamation mark is truly necessary.


### Slashes `/`

* Do not use a slash to mean "or" or "and". A slash is ambiguous because the reader cannot tell whether you mean one option, the other, or both. Write the word out instead.
  * OK: `coffee or tea`, `imported and exported goods`, `read or write access`
  * NOT: `coffee/tea`, `imported/exported goods`, `read/write access`
  * For the specific case of "and/or", state which you mean. Usually "or" already covers both, so prefer "or".
    * OK: `Invite users by email or username.` (either or both work)
    * NOT: `Invite users by email and/or username.`
* Use for dates, file paths, and URLs.
  * Example: `2023/06/15`, `C:/example/example/example`, `https://example.example/`
* Do not use for fractions because it can be interpreted in multiple ways.
  * Example: `1/2` can be interpreted as "one-half" or "one or two"


### Colons `:`

* Use to introduce a list. In this case, the text that precedes the colon should be a complete sentence.
  * Example:
    * OK: `Required information: full name, email, password`, `The required information is as follows: full name, email, and password.`
    * NOT: `The required information is: full name, email, password`
* Use for time and ratios.
  * Example: `3:00 PM`, `1:2`


### Parentheses `( )`

Use to add _helpful_ but _not vital_ information.

* Do not put vital information in parentheses as some readers may ignore it.
* Examples of helpful but non-vital information: examples, clarifications, abbreviations.
  * Example:
    * OK: Enter an 8-digit PIN (for example, 12345678), and then click OK. This PIN will be required when you sign-in on a new device.
    * NOT: Enter an 8-digit PIN (required when you sign-in on a new device), and then click OK.
* When including parentheses in the middle of a sentence, keep the parenthetical phrase as short as possible so as not to affect readability. Otherwise, consider breaking the sentence into two.
  * Example:
    * OK: Enter a recognizable name (for example, "Development Team"), and then move on to the next step.
    * NOT: Enter a recognizable name (for example, if you are creating a team for developers, you can name it "Development Team"), and then move on to the next step.

Ref: [Parentheses | Google developer documentation style guide][google-parentheses]

[google-parentheses]: https://developers.google.com/style/parentheses


### Curly brackets `{ }`

Use for placeholders, where a variable is inserted by the system.

* Example: `Are you sure you want to remove {{userName}} from the {{groupName}} group?`


### Ampersand `&`

* Don't use `&` instead of "and".


### Punctuations not recommended for use

When writing for user interfaces, there are some punctuations that are not recommended for use due to screen reader compatibility issues. Refer to a separate accessible name style guide for use of punctuation marks and special characters in UI copy.


## Inclusive language


### Inclusive jokes

When including jokes in copies, ensure they are understandable by anyone, regardless of the reader's background or knowledge. Avoid jokes that are only relatable or funny to specific groups.

* Do not use "reference" jokes that rely on familiarity with particular movies, books, or other media.
* Puns and wordplay can be included, provided they are easily understood by anyone who understands the language.


### Do not solely rely on sensory characteristics

Do not rely only on sensory characteristics to convey information. Due to their abilities or devices, these characteristics can be ambiguous or misleading to some users.

* User ability example: A visually impaired user may not perceive color, shape, or size as expected.
* User device example: The same user on a mobile device, screen reader, or desktop may perceive visual location or orientation differently.

Sensory characteristics include color, shape, size, visual location, orientation, or sound. In addition to sensory characteristics, provide information that can be understood independently of the user's ability to perceive these characteristics to ensure accessibility for all users.

* OK: `Fields with an asterisk (*) are required.`, `Fields marked with a red asterisk (*) are required.`
* NOT: `Fields highlighted in red are required.`


### Use gender-neutral pronouns

Use the singular "they" when referring to a person or group. It is an effective and inclusive way to refer to any individual. Avoid gender-specific pronouns unless the person you are referring to is actually that gender.

Use they instead of a combination of he or she.

* OK: `they`
* NOT: `he or she`, `he/she`, `s/he`


### Use person-first language

When describing a group of people, put the person first and the description second.

If you have a specific context, it is even better to improve your descriptions by carefully selecting relevant details instead of relying on short, trait-based phrases.

ℹ️ Referring to someone by just one characteristic can suggest that they can be defined solely by that trait. Even if it is not intended to be harmful, it can feel limiting.

* OK:
  * `people with disabilities`
  * `people with visual disabilities`
    * OK: `Accessible names help people with visual disabilities understand the content.`
    * Better: `Accessible names help people who use screen readers understand the content.`
      * Not all people with visual disabilities use screen readers, so it is more accurate to use a more detailed description in this context.
  * `people with dyslexia`
* NOT:
  * `disabled people`
  * `visually impaired people`
  * `dyslexic`
  * `elderly people`, `the aged`, `seniors`

<!--
WRITING_NOTES: Commenting this section out due to sensitive of the topic. Will revisit this section later if needed.
#### Exceptions

In some cases, people prefer to be referred to by their identity first to emphasize their identity. In these cases, it is important to respect their preferences. Consider this in mind when writing content.

* Example:
  * OK: `People with Japanese nationality living in the United States`
  * Better: `Japanese people living in the United States`
    * When referring to ethnic groups, it is often more straightforward to use specific terms.

Reference: [Inclusive language - Content - Atlassian Design System][atlassian-inclusive]

[atlassian-inclusive]: https://atlassian.design/content/inclusive-writing#how-to-describe-people
-->

## Writing for a global audience


### Use global English

Global English is a style of writing designed to be easily understood by non-native readers. This is achieved by avoiding idioms, slang, and regional expressions. It also avoids complex vocabulary and long sentences. Instead, the language used is precise, logical, and literal.

Using global English is important as it makes content accessible to as many people as possible. Also, global English will make the translation process easier and smoother.


### Be clear and concise

Use clear and straightforward language to prevent misunderstandings. Keep in mind that the content will be translated into several languages.

If you're uncertain about the clarity of your writing, try using a machine translation tool to translate the text into another language and then translate it back to English. This can help you assess the precision of your content.

* Use short sentences and paragraphs.
* Avoid using too many modifiers before a noun. Try rephrasing the sentence to make the structure more straightforward.
  * Example:
    * OK: `Private groups that you most recently joined`
    * NOT: `Your most recently joined private groups`
* Remember that participle constructions can often be ambiguous and challenging to translate. Avoid using them unless they are necessary.
  * Example:
    * OK: `Enable passkeys as an alternative sign-in option for your users. This option allows them to sign in without a password.`
    * NOT: `Enable passkeys as an alternative sign-in option for your users, allowing them to sign in without a password.`
      * It is unclear whether the intention is to emphasize enabling passkeys for passwordless sign-in or to describe the features of passkeys.
* Make sure antecedents are clear.
  * Example:
    * OK: `When you click the "Save" button, a new window opens.`
    * NOT: `When you click the "Save" button, it will open a new window.`
* Use helper words and optional pronouns to clarify the meaning of a sentence.
  * Helper word examples:
    * Click the "Save" button, **and** then close the window.
    * If no option is selected, the system assumes **that** "None" is selected.
    * Ensure **that** the file is saved before closing the window.
  * Optional pronoun example:
    * You can also select other options **that are** listed in the table.


### Use consistent terminology

Use the same terms consistently throughout the content to avoid confusion.

However, it is acceptable to use different expressions if doing so aids user understanding. In such cases, ensure that users recognize that the expressions convey the same meaning.


## Formatting


### Date and time formats

Use the following three formats for date and time:

| Format                                            | Template                                                                     | Example                      |
| ------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------- |
| [Relative date and time](#relative-date-and-time) | `Today {12-hour time}`                                                       | `Today 2:18 PM`              |
| [Date only](#date-only)                           | `{Day of week (3-letter)}, {Month (3-letter)} {Day}, {Year}`                 | `Tue, May 20, 2025`          |
| [Date and time together](#date-and-time-together) | `{Day of week (3-letter)}, {Month (3-letter)} {Day}, {Year}, {12-hour time}` | `Tue, May 20, 2025, 2:18 PM` |

If none of the three formats are applicable, follow [Dates and times - Google developer documentation style guide][google-date-times].

For details on the implementation, refer to the [Supplementary information: Implementation](#supplementary-information-implementation) section.

[google-date-times]: https://developers.google.com/style/dates-times


#### Relative date and time

* Use `Today` as the relative date.
* Do not use terms such as tomorrow, yesterday, or one month ago as relative dates.
* All other dates should use the absolute date format.
* Do not include a comma between the date and time to maintain a consistent format across English and Japanese. This reduces development costs.
* For details on the time format, refer to the [Time format](#time-format) section.


#### Date only

Template: {Day of week (3-letter)}, {Month (3-letter)} {Day}, {Year}

Examples:

* Wed, Sep 27, 2019
* Thu, May 28, 2023
* Mon, Jan 1, 2024

> [!NOTE]  
> As of July 2025, no products support use cases for displaying the date-only format.


#### Date and time together

Template: {Day of week (3-letter)}, {Month (3-letter)} {Day}, {Year}, {12-hour time}

Examples:

* Wed, Sep 27, 2019, 3:00 PM
* Thu, May 28, 2023, 2:18 AM

For details on the time format, refer to the [Time format](#time-format) section.


### Time format

* Use the 12-hour clock unless a 24-hour time format is required.
  * The 12-hour clock format is the standard used in the United States, our primary market.
  * When the scope allows, use the 24-hour format for other regions.
* Use hyphens (-) in time ranges. Do not add spaces before or after the hyphens.
  * Example: `9:00-10:00 AM`
* Capitalize AM and PM, and leave one space between the suffix and the time.
  * Example: `3:45 PM`
* Remove the minutes from round hours (except in time ranges).
  * Example: `3 PM`

<!-- * International (ISO): YYYY-MM-DD, at HH:MM (24-hour clock) -->
<!--   * Example: 2019-09-27, at 15:00 -->

### Supplementary information: Implementation

* Library: i18next
  * [DateTime - i18next documentation](https://www.i18next.com/translation-function/formatting#datetime)
* Browser native API used for date and time formatting: ECMAScript
  * [Intl.DateTimeFormat (English)](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
  * [Intl.DateTimeFormat (Japanese)](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)

The following code snippet shows how to format the date and time using the ECMAScript API.

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


## App types

| Internal term          | External term | Notes                   |
| ---------------------- | ------------- | ----------------------- |
| All apps               | apps          | Titles; default wording |
| 1st party              | native apps   | Identifying badge       |
| 3rd party              | other apps    | Section title           |
| 3rd party & verified   | verified apps | Identifying badge       |
| 3rd party & unverified | other apps    |                         |


## Word list


### sign-in (noun or adjective), sign in (verb)

Not "login" or "log in".


### single sign-on (noun), single sign-on (adjective), SSO (abbreviation)

Not "sign-on" or "sign on". Do not use either form on its onw. Use the hyphenated version as part of "single sign-on".


### username

Not "user name" nor "account name".


### continue

* Use `continue` to indicate that the operation has not yet been completed and that the user must proceed.
  * For example, when the user is in the middle of a process.
* Note that `next` is used differently from `continue`! See [next](#next) for more details.


### next

* Use `next` to indicate that the action is completed and the user can move to the next step.
  * For example, when the user has completed the current step and is ready to move on.
* Note that `continue` is used differently from `next`! See [continue](#continue) for more details.


### email

* Do not use `e-mail`, `Email`, or `E-mail`.
* Use `email` in lowercase (as specified in the AP style manual as of March 2011).


### example / e.g., / i.e.,

Following the AP style guide's rule for these abbreviations:

* `i.e.,` will refer to "that is."
* `e.g.,` will refer to "for example."
* A comma following these abbreviations is required.

Do not use `ex/` or `ex.` for `example`.


### emoji

* Emojis is the plural form of emoji.


### they

* Use the singular they as a gender-neutral pronoun.
* ⚠️ Do not use gender-specific pronouns unless the person you are referring to is actually that gender (he, him, his, she, or her).


### activate / activated / deactivate / deactivated

* ⚠️ Avoid using: suspend or suspended
* When describing settings or users, use activated or deactivated.
* When describing the action, use activate or deactivate.
  * Reason: The wording implies punishment for misbehavior.


### invite / invitation

* According to Merriam-Webster, "invite" is both a noun and a verb.
* Use `invite` instead when referring specifically to the `invite email` or `invitation email`.
  * Example: "The invite has been sent. Check your email."
* Use "invitation" instead when referring to the higher-level concept.


### link vs. URL

* In general, use `link` as it is more general-audience-friendly.
* Use `link` when referring to a clickable text that directs users to another page.
* Use `URL` when referring specifically to the address of a web page.


### ⚠️ please

* Do not use "please" in the normal course of explaining how to use a product, even if you are explaining a difficult task.
* Use "please" only when the user is asked to take action because of a system error, a product limitation, or something the product is to blame for.
  * This includes situations such as exceeding system-imposed limits, recovering from a failed operation, or working around a known constraint.

OK:

* `Please shorten the password to 64 characters or less.` - The system's character limit forces the user to change their input.
* `Please try again later.` - A system error requires the user to retry.

NOT:

* `Please enter your email address.` - This is a standard instruction, not a system-imposed inconvenience.
* `Please create a password that is at least 8 characters long.` - This is a standard input requirement, not a system limitation the user needs to work around.

* Ref: [Error Messages: Please vs No Please - Medium][medium-err-please].

[medium-err-please]: https://medium.com/the-devil-wears-product/error-messages-please-vs-no-please-90cebdfb2ea5#:~:text=Microsoft%20releases%20their%20UX%20guidelines,to%20blame%20for%20the%20situation


### ⚠️ admin vs. administrator

* Use `admin` when writing to a regular end-user.
  * Example: "If the error persists, contact your admin for a new invitation."
  * Use sentence case.
* Use `Administrator` when writing to a powerful user trying to manage settings.
  * By default, use sentence case.
  * When referring to a specific administrator type (for example, `Super Administrator`), use title case.
* Logic: `admin` is casual, shorter, and less intimidating. The word `Administrator` should be used when the user SHOULD be aware that their actions have consequences.


### ⚠️ account

* If possible, avoid using `account` as it is too generic.
* Be specific by using `user account` or `user profile`.
* Do not refer to a user as an `account` from the end-user's perspective.
  * Use `account` only when referring from the admin's perspective.
  * Or if the user is managing multiple accounts.


#### User account settings exceptions

* `User settings` vs. `User account settings`
* User settings -> what the user can control
  * Genji changing the language to English.
* User account settings -> what admins can control
  * Admin limiting Genji's ability to change the language setting.


#### Adding an account exception

* Specifically related to adding an account.


### ⚠️ hyphen vs dash

* A dash is a punctuation mark used to insert an interjection or pause in a sentence.
* A hyphen is a punctuation mark used to join words.
* For group code, we will refer to `-` as a hyphen.


### ⚠️ Inactive vs Deactivated

* A user's own inaction makes their account "Inactive."
* An Admin can "deactivate" a user. (A user cannot deactivate themselves.)


### ⚠️ limit reached vs limit exceeded

* Use "reached" when the user is at the limit and can no longer perform the action.
  * Example scenario: 10 items are selected, which is the maximum allowed. When the user tries to select the 11th item, the system prevents the action until they deselect one of the currently selected items.
* Use "exceeded" when the user is over the limit.
  * Example scenario: 11 items are selected when the limit is 10, and the user submits the form. The system prompts the user to reduce their selection to 10 items or fewer in order to proceed.
* Example wording:
  * "Limit reached":
    * `You have reached the limit of 6 conditions. To add another, delete an existing one to free up a slot.`
    * `You have reached the daily limit of 10 email verification attempts. You will be able to resend the verification email in 24 hours.`
  * "Limit exceeded":
    * Title: `10,000 user limit exceeded`, body: `You have selected 12,340 users. Please adjust your conditions to continue.`


### ⚠️ let's

* "Let's" conveys a casual, friendly tone that fosters a sense of partnership, making users feel guided through a process together. Use it when that tone aligns with the context.
* Avoid using "Let's" where users need clear and concise instructions or where the language should be action-efficient and action-oriented.

Example of when to use "Let's":

* During onboarding flows that aim for a warm, guiding tone.
* In chatbots or interactive guides that are designed to feel conversational and supportive.
* At the start of a multi-step process.

Example of when to avoid "Let's":

* In professional tools or task-focused scenarios where speed and clarity are more important than being friendly.


### 🚫 login (noun or adjective), log in (verb)

Do not use. Instead, use "sign in" and "sign-in".


### 🚫 log out

Do not use. Instead, use "sign out".


### 🚫 sign into

Do not use. Instead, use "sign in to".


### 🚫 sign-on, sign on

Do not use either form on its own. Use the hyphenated version as part of "single sign-on".


### 🚫 sign-up (noun or adjective), sign up (verb)

Do not use. Instead, use "Create an account".


### 🚫 user name

Do not use. Instead, use "username".


### 🚫 account name

Do not use. Instead, use "username".

* If possible, avoid using `account` as it is too generic.
* Exceptions: User account settings
* User settings vs User account settings
* User settings -> what the user can control
  * Genji changing the language to English
* User account settings -> what admins can control
  * Admin limiting Genji's ability to change the language setting.


### 🚫 input (user inputting value)

Do not use. Instead, use "enter" when referring to the user entering text or value into a field.

Example: In the name field, enter your full name.


### roles vs. privileges vs. permissions

* Roles > Privileges > Permissions
* Roles = Set of privileges that can be granted to a user
  * Example Roles: Admin role, Manager role, end-user role
* Privileges = Permission to perform an action that is granted to a user
  * Example Privileges: User has the privilege to manage users
* Permission = Property of an object {files & settings}
  * Example Permissions: Permission to delete a user
