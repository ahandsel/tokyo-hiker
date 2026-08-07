# Scripts

Utility scripts for the tokyo-hiker repository.


## Table of contents <!-- omit in toc -->

* [cleanup-temp-files.sh](#cleanup-temp-filessh)
* [generate-site-structure.mjs](#generate-site-structuremjs)
* [index.sh](#indexsh)
* [md-lint.sh](#md-lintsh)
* [replace-curly-quotes.sh](#replace-curly-quotessh)
* [setup.sh](#setupsh)
* [setup-brew.sh](#setup-brewsh)
* [setup-node.sh](#setup-nodesh)
* [setup-pre-commit.sh](#setup-pre-commitsh)
* [setup-takumi-guard.sh](#setup-takumi-guardsh)


## cleanup-temp-files.sh

> Source: [cleanup-temp-files.sh](cleanup-temp-files.sh)

Search and list temporary files, delete empty ones, and optionally delete all matching files after confirmation.
Files matching `temp-*`, `temp.*`, `temp`, `import.csv`, `import.md`, and `.DS_Store` are considered temporary (excluding `node_modules`), along with `.pnpm-store` directories.

```shell
./scripts/cleanup-temp-files.sh [-y | --yes]
# or
pnpm cleanup
```

* `-y`, `--yes` - auto-confirm the deletion prompt


## generate-site-structure.mjs

> Source: [generate-site-structure.mjs](generate-site-structure.mjs)

Generate a `notes/site-structure.md` file containing a tree view of the `contents/` folder.
File enumeration uses `git ls-files`, so gitignored files are never listed.
The top-level `.vitepress` folder is dropped, because it holds the site configuration rather than published content.

```shell
node scripts/generate-site-structure.mjs
# or
pnpm tree
```

Options:

* `-h`, `--help` - show the help message and exit.


## index.sh

> Source: [index.sh](index.sh)

List all pnpm scripts defined in the nearest `package.json`, printing each script name alongside its command.
JSON is parsed with pure zsh, so no `jq` dependency is required.

```shell
./scripts/index.sh [-h | --help] [-V | --version]
# or
pnpm index
```

* `-h`, `--help` - show the help message and exit
* `-V`, `--version` - print the script version and exit


## md-lint.sh

> Source: [md-lint.sh](md-lint.sh)

Lint the Markdown files in a directory with markdownlint, writing results to a log file.
Predates the authoring rules below, so it has no `--help` flag and uses a plain comment header instead of a notes block.
For everyday linting, prefer `pnpm md-lint`, which runs `markdownlint-cli2` across the repo with the shared config.

```shell
./scripts/md-lint.sh [directory] [config_file]
```

* `directory` - where to search for Markdown files (default: the current working directory)
* `config_file` - markdownlint configuration file (optional, defaults to `.markdownlint.json`)


## replace-curly-quotes.sh

> Source: [replace-curly-quotes.sh](replace-curly-quotes.sh)

Replace curly quotes with straight quotes across the Markdown files in a directory, enforcing the repo writing style.
Predates the authoring rules below, so it has no `--help` flag.

```shell
./scripts/replace-curly-quotes.sh [directory]
```

* `directory` - where to search for Markdown files (default: the current working directory)


## setup.sh

> Source: [setup.sh](setup.sh)

Run the full repository setup in order: `setup-brew` (skipped when no `Brewfile` is present), `setup-node`, `pnpm install`, and `setup-pre-commit`.
Each step can also be run separately via its own `pnpm run setup-*` script.

```shell
./scripts/setup.sh [-h | --help] [-V | --version]
# or
pnpm run setup-full
```

* `-h`, `--help` - show the help message and exit
* `-V`, `--version` - print the script version and exit


## setup-brew.sh

> Source: [setup-brew.sh](setup-brew.sh)

Install project dependencies from [Brewfile](../Brewfile) using Homebrew.
Safe to re-run, because Homebrew skips already-installed formulae.
Requires [Homebrew](https://brew.sh).

```shell
./scripts/setup-brew.sh [-h | --help]
# or
pnpm run setup-brew
```

* `-h`, `--help` - show the help message and exit


## setup-node.sh

> Source: [setup-node.sh](setup-node.sh)

Install and activate the Node.js version specified in `.node-version` using nodenv.
Reads the target version from the project root and skips installation when the version is already present.
Requires [nodenv](https://github.com/nodenv/nodenv) and the [node-build](https://github.com/nodenv/node-build) plugin.

```shell
./scripts/setup-node.sh [-h | --help] [-i | --install]
# or
pnpm run setup-node
```

* `-h`, `--help` - show the help message and exit
* `-i`, `--install` - install prerequisites (nodenv, node-build, pnpm) via Homebrew


## setup-pre-commit.sh

> Source: [setup-pre-commit.sh](setup-pre-commit.sh)

Install or uninstall the Git pre-commit hook that runs `pnpm lint` (prettier and markdownlint) before every commit.
Prefers corepack pnpm when available and falls back to plain pnpm.
Safe to re-run, because it prompts before overwriting an existing hook.

```shell
./scripts/setup-pre-commit.sh [-h | --help] [-u | --uninstall] [-s | --status]
# or
pnpm run setup-pre-commit
```

* `-h`, `--help` - show the help message and exit
* `-u`, `--uninstall` - remove the pre-commit hook
* `-s`, `--status` - show whether the hook is installed


## setup-takumi-guard.sh

> Source: [setup-takumi-guard.sh](setup-takumi-guard.sh)

Configure Takumi Guard (a security-focused npm registry proxy) in your global pnpm config.
Prompts for your Takumi Guard API token, sets the registry and auth token, and optionally verifies the setup by checking that a known malicious test package is blocked.
The token is written to your global pnpm config, never to this repository.

```shell
./scripts/setup-takumi-guard.sh [-h | --help] [-i | --install] [-e | --edit]
# or
pnpm run setup-takumi-guard
```

* `-h`, `--help` - show the help message and exit
* `-i`, `--install` - install pnpm via Homebrew if not already installed
* `-e`, `--edit` - open the global pnpm config file in VS Code


## Authoring rules

* Default to Node.js ES modules (`.mjs`) or zsh. Python is banned, because managing Python environments across machines is not worth the overhead. Other JavaScript flavors and other shells are allowed but are not the default.
* Every script supports `--help` and prints clear usage.
* Every script carries a notes section near the top covering general notes (what it does), usage (how to invoke it), output (what it returns or generates), and a reverse-chronological version history with a date and a summary per version.
* Bump the version and add a version-history entry whenever you change a script, and name the script and its new version in the commit title, for example `✨ setup-node.sh v1.2.3: add new feature`.
* Use status emojis in output: ✅ for success, ⚠️ for warnings, and ❌ for errors.
* Do not split a sentence across a line break. When wrapping text, break only at sentence boundaries so each line contains whole sentences.
