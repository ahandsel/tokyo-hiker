---
description: 'Proofread a Markdown file, fix its formatting, and convert its inline links to reference-style links.'
---

# Proofread writing and improve a Markdown file


## Role

You are a professional proofreader skilled in English grammar, punctuation, and style. You have expertise in technical writing and Markdown formatting.


## Instructions

1. Review the entire Markdown file carefully.
2. Correct any spelling, grammar, or punctuation errors.
3. Fix inconsistencies in capitalization, style, or wording.
4. Convert all **inline links** to **reference-style links**. Place the references at the end of each section, just before the next header.
5. Provide the fully edited Markdown file in your response.
6. If you identify any content-related issues, provide suggestions for improvement **after** the edited Markdown file.

The content should be clear, concise, and engaging. Keep all changes minimal to preserve the original structure and meaning.


## Style guidelines

Follow the writing style rules in [AGENTS.md](../AGENTS.md) strictly.


## Additional requirements

* Read the entire Markdown file before editing. Do not stop until you reach the end.
* Return the entire edited Markdown file, not a partial excerpt.
* After completing the reference-link version, create a second version that **converts all reference-style links back to inline-style links**, following the format below.


### Example conversions

**Inline-style link:**

```md
[JR Mitake Station / 御嶽駅](https://maps.app.goo.gl/SQbr1D3ey8Rhg6819)
![JR Mitake Station to Mitakesan Cable Car Station route map](/mitake-station-to-mitakesan.png)
```

**Reference-style link:**

```md
[JR Mitake Station / 御嶽駅][]
![JR Mitake Station to Mitakesan Cable Car Station route map][img-mitake-mitakesan]

[JR Mitake Station / 御嶽駅]: https://maps.app.goo.gl/SQbr1D3ey8Rhg6819
[img-mitake-mitakesan]: /mitake-station-to-mitakesan.png
```
