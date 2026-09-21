# grillsay

> It's like `cowsay`, but the entire neighborhood has opinions.

Fourteen characters with matching artwork and their own quote pools. Pass a
message, pipe text in, or let a randomly selected character speak for
themselves.

## Usage

Requires Deno with `--unstable-raw-imports` support (tested with Deno 2.9.5).

```sh
deno task grillsay
deno task grillsay "You call this a brisket?"
deno task grillsay --enabled-characters boomer
deno task grillsay --enabled-characters boomer,fisherman,foreman
deno task grillsay --enabled-characters=informant,interceptor "Nothing to see here."
echo "The fish are listening." | deno task grillsay --enabled-characters fisherman
deno task grillsay --list-characters
deno task grillsay --help
```

`--enabled-characters` takes comma-separated character IDs. All characters are
enabled by default; `--enabled-characters all` explicitly enables everyone. One
name always selects that character. Multiple names form a pool from which one
character is chosen uniformly per invocation. With no message, a quote is chosen
from that character's pool. Custom messages also use the selected artwork.

Names are case-insensitive; whitespace around names is ignored and duplicates
are removed. Repeated flags use the last list. Missing or empty lists, unknown
names, and mixing `all` with named characters exit with status 1.

Nonempty piped input takes priority over positional text. Empty or
whitespace-only stdin falls back to positional text, then a character quote. Use
`--` before literal message text that starts with a dash:

```sh
deno task grillsay --enabled-characters clerk -- --please-hold
```

## Characters

| ID              | Voice                                                |
| --------------- | ---------------------------------------------------- |
| `artho`         | Art-school critique, gallery openings, and rent      |
| `boomer`        | Grilling, lawn care, and unsolicited advice          |
| `clerk`         | Forms, queues, and recursive bureaucracy             |
| `cyberhorse`    | Equine firmware and pasture computing                |
| `financebro`    | Vest-clad startup and investment bravado             |
| `fisherman`     | Tall tales, tackle, and one more cast                |
| `foreman`       | Job-site deadlines and clipboard wisdom              |
| `glangley`      | An implausibly ordinary undercover neighbor          |
| `groundskeeper` | Weeds, park maintenance, and turf grievances         |
| `informant`     | Back-alley tips and questionable sources             |
| `interceptor`   | A surveillance van with unconvincing cover stories   |
| `rapper`        | DIY music, wordplay, and cookout bars                |
| `schizo`        | All-caps technobabble and absurd cosmic conspiracies |
| `shrimpcaster`  | Shrimp-bait fishing as a mystical vocation           |

The original Boomer quotes are preserved. Each of the other 13 characters has 16
new quotes (208 new quotes total).

## Build and install

```sh
deno task build
./dist/grillsay --enabled-characters boomer "Gas grills are for quitters."
# Optional system-wide installation:
sudo install -m 755 dist/grillsay /usr/local/bin/grillsay
```

This archive contains source only. Run `deno task build` locally for your platform;
the build needs network access to download Deno's compilation runtime.
Artwork and quotes are embedded, so the executable works without the source tree
and from any working directory.

## Editing content and testing

Artwork lives in `src/art/<id>.txt`; quotes live in `src/quotes/<id>.txt`, one
quote per nonblank line. `src/characters.ts` pairs and statically imports both
files for each character. To add a character, add both files and its imports and
registry entry; the CLI list and default selection follow the registry
automatically. Rebuild the binary after editing assets or code.

```sh
deno task test
deno check --unstable-raw-imports src/main.ts
deno lint
deno fmt --check
```

## License

See `license.txt`.
