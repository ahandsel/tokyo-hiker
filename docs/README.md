# Docs

Repository documentation.
Published site content lives in `contents/`, not here.
This folder became free for documentation when the published pages moved to `contents/`.


## Contents

* [site-structure.md][] - tree view of the `contents/` folder. Generated output, so do not edit it by hand.


## Regenerating site-structure.md

Run `pnpm tree`, which calls [generate-site-structure.mjs][].
File enumeration uses `git ls-files`, so gitignored files never appear.
Run it after adding, moving, or renaming content, then run `pnpm lint` before finishing.


## What belongs here

* Repository documentation: reference material about how this repository is built and maintained.
* Notes, audits, and reports go in `notes/` instead. See [notes/README.md][].
* Reusable prompt files go in `prompts/`. See [prompts/README.md][].
* Repository rules live in [AGENTS.md][] at the repository root.

[AGENTS.md]: ../AGENTS.md
[generate-site-structure.mjs]: ../scripts/generate-site-structure.mjs
[notes/README.md]: ../notes/README.md
[prompts/README.md]: ../prompts/README.md
[site-structure.md]: site-structure.md
