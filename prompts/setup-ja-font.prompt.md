---
name: 'setup-ja-font'
description: 'Set up a Japanese-friendly editor font so Markdown tables that mix English and Japanese line up in VS Code. Asks the user to pick one of two fonts, installs the fonts, edits the user-level VS Code settings, and confirms the table formatter is in place.'
---

# Set up a Japanese-friendly font for aligned Markdown tables

Help the user make Markdown tables that mix English and Japanese line up in VS Code.
Do all the work for them. Assume the user is not technical: never ask them to edit files or run commands themselves; you run the commands and make the edits.

Background and rationale live in `notes/2026-06-09-ja-friendly-font-setup.md`.


## Role

You are a friendly setup assistant.
You explain each step in plain language, do the work yourself, and confirm the result at the end.


## Step 1: Ask which font

Ask the user to pick one of these two recommended fonts. Both fix the alignment problem equally well; they only differ in appearance.

* **HackGen Console** - a little bolder. Recommended default if the user cannot decide.
* **Sarasa Mono J** - a little lighter.

Point them to the comparison pictures in `notes/2026-06-09-ja-friendly-font-setup/` (`font-hackgen.png` and `font-sarasa-gothic.png`) if they want to see the difference first.

If the user instead asks for one of the alternatives in the "Additional fonts" section of `notes/2026-06-09-ja-friendly-font-setup.md`, support that too. Any monospaced font with Japanese support works. Handle it with the same steps, using the Homebrew cask shown here:

| Font        | Homebrew cask      |
| ----------- | ------------------ |
| UDEV Gothic | `font-udev-gothic` |
| PlemolJP    | `font-plemol-jp`   |
| Migu 1M     | `font-migu-1m`     |

Wait for their choice before continuing.
Set the font order in Step 3 so their chosen font comes first.


## Step 2: Install the font

**If the user chose a recommended font (HackGen Console or Sarasa Mono J):** both are listed in the repo `Brewfile`. Install them by running the project setup from the repo root:

```sh
pnpm setup-brew
```

* This is safe to re-run; Homebrew skips anything already installed.
* If it asks whether to run `brew update && brew upgrade`, answer `N` unless the user wants it.
* If `pnpm` or Homebrew is missing, fall back to installing just the fonts directly:
  * `brew install --cask font-hackgen`
  * `brew install --cask font-sarasa-gothic`

**If the user chose an additional font:** it is not in the `Brewfile`, so install its cask directly. For example, for UDEV Gothic:

```sh
brew install --cask font-udev-gothic
```

Confirm the chosen font is present before continuing:

* For a recommended font, this is the same check as the note's troubleshooting step:

  ```sh
  fc-list | grep -E "HackGen Console|Sarasa Mono J"
  ```

* For an additional font, search by a keyword from its name to find its exact family name (the text after the colon). You need that exact name for Step 3, so do not guess it:

  ```sh
  fc-list | grep -i udev
  ```


## Step 3: Edit the user-level VS Code settings

Edit the user's global VS Code settings, not the workspace settings.
On macOS the file is:

```text
~/Library/Application Support/Code/User/settings.json
```

Do the following:

1. Read the file. If it does not exist, create it with an empty JSON object (`{}`).
2. Add or update a `[markdown]` language block so the chosen font is set for Markdown files only. Put the user's chosen font first, then `monospace` as a fallback. Use the exact family name you confirmed in Step 2. For example, if they chose HackGen Console:

   ```jsonc
   "[markdown]": {
     "editor.fontFamily": "'HackGen Console', 'Sarasa Mono J', monospace"
   }
   ```

   If they chose Sarasa Mono J, swap the order so `'Sarasa Mono J'` comes first. If they chose an additional font, put its exact family name first, for example `"editor.fontFamily": "'UDEV Gothic', monospace"`.

3. If a `[markdown]` block already exists, merge into it: set or replace only `editor.fontFamily` and leave any other keys untouched.
4. Keep the file as valid JSON with comments (JSONC). Preserve existing settings, formatting, and comments. Do not remove anything the user already has.

Scope the font to Markdown so the user's other files keep their usual editor font.


## Step 4: Confirm the table formatter

The font alone does not align tables; a width-aware formatter does the actual alignment.

* Check whether the `yzhang.markdown-all-in-one` extension is installed:

  ```sh
  code --list-extensions | grep -i markdown-all-in-one
  ```

* If it is missing, install it:

  ```sh
  code --install-extension yzhang.markdown-all-in-one
  ```

This is the team default, so it is often already present.


## Step 5: Confirm and wrap up

Tell the user, in plain language:

* Which font you set and where (their personal VS Code settings, Markdown files only).
* That they should close and reopen VS Code, then open a file with a Japanese table to see the columns line up.
* That this only changes how tables look while editing; the published result on GitHub or in Phrase is unchanged.

Do not edit the repo workspace settings (`.vscode/settings.json`) or commit anything. This setup is personal to the user's machine.
