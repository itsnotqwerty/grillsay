# grillsay

> It's like `cowsay`, but the entire neighborhood has opinions.

Fourteen built-in characters, matching ASCII artwork, and **470 quotes**
spanning food, work, technology, money, fishing, gardening, art, music,
surveillance, and absurd conspiracies. Say something yourself, pipe in a
message, or let the cast speak for itself.

## Quick start

With Deno 2.9.5:

```sh
deno task grillsay
deno task grillsay -c boomer "You call this a brisket?"
deno task grillsay --topic work
deno task grillsay --preview-all
```

After building or installing a binary, replace `deno task grillsay` with
`grillsay`.

## Install and build

```sh
deno task build
./dist/grillsay -c fisherman
# Optional Linux/macOS system-wide installation:
sudo install -m 755 dist/grillsay /usr/local/bin/grillsay
```

On Windows the executable has an `.exe` extension. Compilation downloads Deno's
platform runtime on its first run, so it needs network access. The source CLI
has no external dependencies; built-in art and quotes are embedded in
executables. This archive is source-only.

The included release workflow builds Linux, macOS, and Windows binaries when a
`v*` tag is pushed. Assets are named `grillsay-<os>-<arch>` (plus `.exe` on
Windows), using the native architecture of each GitHub runner. Download the
asset matching your system from your repository's Releases page, verify its hash
against `SHA256SUMS`, then rename it to `grillsay` (or `grillsay.exe`). On
Linux/macOS, run `chmod +x grillsay` and put it on your PATH. Releases become
available after the workflow has run successfully; this source archive does not
itself publish one.

## Options

| Flag                          | Purpose                                                      |
| ----------------------------- | ------------------------------------------------------------ |
| `-c ID`, `--character ID`     | Always select one character                                  |
| `--enabled-characters IDS`    | Random pool: comma-separated IDs or `all`                    |
| `--width N`                   | Bubble content width, 2–1000 terminal columns                |
| `--color auto\|always\|never` | Enable character accent colors                               |
| `--weights ID=N,ID=N`         | Set positive relative selection weights                      |
| `--topic NAME`                | Filter generated quotes by topic                             |
| `--no-repeat`                 | Avoid the previous character and each character's last quote |
| `--state-file PATH`           | Set history location; implies `--no-repeat`                  |
| `--pack DIRECTORY`            | Add a custom character pack; repeat for multiple packs       |
| `--preview-all`               | Gallery of enabled, topic-compatible characters              |
| `--list-characters`           | List all available IDs, including loaded packs               |
| `--list-topics`               | List topics available in the enabled cast                    |
| `-h`, `--help`                | Print help                                                   |
| `--`                          | Treat remaining arguments as literal message text            |

Value-taking long options accept `--flag=value` or `--flag value`. Names are
case-insensitive; whitespace around character names is ignored and duplicate
names are removed. Repeated selection flags use the last selection. Empty lists,
unknown IDs, invalid widths/colors/weights, and unknown flags exit with
status 1.

Nonempty stdin takes precedence over positional text. Empty or whitespace-only
stdin falls back to positional text, then a quote. Help, lists, and the gallery
never read stdin or update history. Discovery modes take precedence in this
order: help, character list, topic list, gallery.

```sh
echo "Nothing to see here." | grillsay -c interceptor
grillsay -c clerk -- --please-hold
```

## Persistent preferences

All characters are enabled by default. Set `GRILLSAY_CHARACTERS` in your shell
configuration to choose your usual pool:

```sh
# ~/.bashrc or ~/.zshrc
export GRILLSAY_CHARACTERS=boomer,fisherman,foreman
# Optional greeting whenever an interactive terminal opens:
grillsay --no-repeat
```

For fish: `set -Ux GRILLSAY_CHARACTERS boomer,fisherman,foreman`. For
PowerShell, set `$env:GRILLSAY_CHARACTERS = 'boomer,fisherman,foreman'` in your
profile. CLI selection flags override the environment, including
`--enabled-characters all` to reset the pool. Custom IDs in the environment
still need their pack supplied with `--pack`.

## Weighted selection and repeat avoidance

```sh
grillsay --enabled-characters boomer,clerk,fisherman --weights boomer=4,clerk=2
grillsay -c fisherman --no-repeat
grillsay --state-file ./my-grillsay-history.json
```

Unspecified characters have weight 1. Weights do not enable characters outside
the selected pool. Topic filtering happens first, repeat avoidance second, and
weighted selection last; the quote is then chosen uniformly from eligible
quotes. A 4:2:1 pool gives those relative probabilities when repeat avoidance is
off. Avoiding the previous character changes those probabilities on the next
run.

History is **opt-in**. With multiple eligible characters, the immediately
previous character is excluded. For each character, its most recently generated
quote is excluded when an alternative exists. A single character or a single
matching quote still works. Custom messages update the last character, but never
overwrite quote history. Gallery and list commands never touch the history file.

Default history locations:

- `$XDG_STATE_HOME/grillsay/history.json`, when set.
- Linux/macOS: `$HOME/.local/state/grillsay/history.json`.
- Windows: `$LOCALAPPDATA/grillsay/history.json`, falling back to
  `$USERPROFILE`.

Missing history starts fresh. Corrupt or inaccessible history produces a warning
and does not prevent rendering. Writes use a temporary file and atomic rename;
concurrent invocations can still select the same output because selection is not
locked. Remove the history file to reset it. `--state-file` overrides the path.

## Width, Unicode, and color

On a terminal the default bubble width is the terminal width minus four columns
(up to 1000). Redirected output defaults to 40; `--width` overrides either.
Artwork retains its original shape and can exceed the terminal width.

Wrapping and padding use grapheme clusters and terminal cell widths, preserving
combining accents and common emoji sequences, including flags and joined emoji.
CJK characters count as two columns. Ambiguous-width characters count as one;
actual rendering still depends on your terminal's font and Unicode support. ANSI
controls in incoming messages and artwork are removed before layout.

`--color auto` colors terminal output only. Setting `NO_COLOR` disables
automatic color, even if its value is empty. `--color always` explicitly forces
color, including in pipes; `--color never` always disables it. Each built-in has
an accent color, and custom characters default to cyan. Colors reset after every
output.

## Topics and the gallery

```sh
grillsay --list-topics
grillsay --topic technology --enabled-characters cyberhorse,clerk,financebro
grillsay --topic food --preview-all
grillsay --preview-all "Welcome to the neighborhood."
```

Topic names are case-insensitive. Only characters with matching quotes are
eligible; no matching quotes is an error. A custom message bypasses topic
filtering because it does not use the quote pool. Gallery output labels every
enabled character and uses its first matching quote, or the supplied message.
Weights do not hide gallery entries. Topics are metadata, never printed as part
of a quote.

## Characters

| ID              | Voice                                              | Quotes |
| --------------- | -------------------------------------------------- | -----: |
| `artho`         | Art-school critique, galleries, and rent           |     32 |
| `boomer`        | Grilling, lawn care, and unsolicited advice        |     54 |
| `clerk`         | Forms, queues, and recursive bureaucracy           |     32 |
| `cyberhorse`    | Equine firmware and pasture computing              |     32 |
| `financebro`    | Startup and investment bravado                     |     32 |
| `fisherman`     | Tall tales, tackle, and one more cast              |     32 |
| `foreman`       | Job-site deadlines and clipboard wisdom            |     32 |
| `glangley`      | An implausibly ordinary undercover neighbor        |     32 |
| `groundskeeper` | Weeds, park maintenance, and turf grievances       |     32 |
| `informant`     | Back-alley tips and questionable sources           |     32 |
| `interceptor`   | A surveillance van with unconvincing cover stories |     32 |
| `rapper`        | DIY music, wordplay, and cookout bars              |     32 |
| `schizo`        | All-caps technobabble and cosmic conspiracies      |     32 |
| `shrimpcaster`  | Shrimp-bait fishing as a mystical vocation         |     32 |

All earlier quotes are retained, with topic metadata added. This upgrade adds
224 quotes across all 14 characters.

## Custom character packs

No code changes or rebuilding needed:

```sh
grillsay --pack ./examples/pack -c barista
grillsay --pack ./my-pack --pack ./another-pack --preview-all
```

Each directory contains matching `art/<id>.txt` and `quotes/<id>.txt` files. See
`examples/pack` for a working Barista. Artwork is UTF-8 text. Quotes are one per
nonblank line, with optional comma-separated topic tags:

```text
[food,work] Your coffee is ready. Your inbox is still your problem.
A plain line belongs to the general topic.
```

IDs must start with a lowercase letter and contain only lowercase letters,
digits, underscores, or hyphens. `all`, `constructor`, and `prototype` are
reserved. Topics use the same letter/digit/underscore/hyphen syntax. Packs are
loaded in flag order; IDs cannot collide with built-ins or earlier packs. Empty
artwork/quote files, missing counterparts, malformed topic names, and duplicate
IDs are errors. Duplicate quote text is merged, retaining all its topic tags.
Loaded characters join the default `all` pool. Pack loading reads text only and
never executes scripts. It is not recursive.

## Development and release automation

```sh
deno task check
deno task build
deno task release-build
```

`check` runs formatting, linting, type checks, unit tests, and source CLI
integration checks. Integration tests exercise all built-in artwork and quotes,
preferences, colors, topic filtering, gallery output, custom packs, and
persistent history in a temporary directory outside the source tree.
`release-build` compiles for the current platform and runs the same smoke checks
against the actual executable.

CI runs checks and compilation on Linux, macOS, and Windows. To publish from
your repository after merging the changes:

```sh
git tag v1.1.0
git push origin v1.1.0
```

All three builds must pass before the release job uploads binaries and a
combined `SHA256SUMS` file. The workflow uses the repository's `GITHUB_TOKEN`;
no additional release secret is required. GitHub Actions must be enabled and
repository policy must allow the release job's `contents: write` permission.

The source run/compile tasks grant read permission for custom packs, write
permission for optional history, and access to the six documented environment
variables. They do not grant runtime network or subprocess access. The
test/build helper tasks need broader permissions to launch Deno and compiled
executables.

Built-ins are statically registered in `src/characters.ts`, using
`src/art/<id>.txt` and `src/quotes/<id>.txt`. Rebuild after editing built-in
assets. Custom packs are read on each invocation.

## License

See `license.txt`.
