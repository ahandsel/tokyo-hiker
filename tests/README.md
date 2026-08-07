# Tests

Node test-runner tests for this repository.
Run them all with `pnpm test`, which invokes `node --test "tests/**/*.test.mjs"`.


## Contents

* [vendored-mermaid-css.test.mjs][] - asserts that the vendored plugin stylesheet in [vitepress-mermaid-renderer.css][] is still a verbatim copy of the CSS the installed `vitepress-mermaid-renderer` package ships.


## Authoring rules

* Name a test file `<subject>.test.mjs`, using `lowercase-with-dashes`, so the `pnpm test` glob picks it up.
* Write tests as Node.js ES modules against the built-in `node:test` and `node:assert/strict`. No separate test runner is installed.
* Open each file with a notes section that states what the test guards and how to fix a failure, matching the convention the helper scripts follow. See [scripts/README.md][].
* CI runs `pnpm test` on every non-draft pull request through [pr-linter.yml][].


## Fixing a vendored Mermaid CSS failure

`vendored-mermaid-css.test.mjs` fails after a `vitepress-mermaid-renderer` upgrade, because the vendored block no longer matches what the plugin ships.
Re-copy both parts of the vendored block as the banner comment in [vitepress-mermaid-renderer.css][] describes, then run `pnpm test` again.
The comparison ignores formatting, so a Prettier reformat of the vendored copy alone never fails the test.

[pr-linter.yml]: ../.github/workflows/pr-linter.yml
[scripts/README.md]: ../scripts/README.md
[vendored-mermaid-css.test.mjs]: vendored-mermaid-css.test.mjs
[vitepress-mermaid-renderer.css]: ../contents/.vitepress/theme/vitepress-mermaid-renderer.css
