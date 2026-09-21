// Works against the source CLI or a compiled executable. No remote imports.
import { characters } from "../src/characters.ts";
const decoder = new TextDecoder();
const source = decodeURIComponent(
  new URL("../src/main.ts", import.meta.url).pathname,
).replace(/^\/([A-Za-z]:\/)/, "$1");
const binary = Deno.args[0];
const prefix = binary ? [] : [
  "run",
  "--unstable-raw-imports",
  "--allow-read",
  "--allow-write",
  "--allow-env",
  source,
];
const command = binary ?? Deno.execPath();
const cwd = await Deno.makeTempDir();
async function run(
  args: string[],
  input = "",
  env: Record<string, string> = {},
) {
  const child = new Deno.Command(command, {
    args: [...prefix, ...args],
    cwd,
    stdin: "piped",
    stdout: "piped",
    stderr: "piped",
    env: { GRILLSAY_CHARACTERS: "all", NO_COLOR: "1", ...env },
  }).spawn();
  const writer = child.stdin.getWriter();
  await writer.write(new TextEncoder().encode(input));
  await writer.close();
  const result = await child.output();
  return {
    code: result.code,
    out: decoder.decode(result.stdout),
    err: decoder.decode(result.stderr),
  };
}
function assert(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message);
}
try {
  for (const [id, character] of Object.entries(characters)) {
    const result = await run(["-c", id, "hello"]);
    assert(
      result.code === 0 && result.out.includes("< hello >") &&
        result.out.trimEnd().endsWith(character.art.trimEnd()),
      `Art mismatch: ${id}: ${result.err}`,
    );
    const quote = await run(["-c", id, "--width=1000"]);
    assert(
      quote.code === 0 &&
        character.quotes.some((text) => quote.out.includes(text)),
      `Quote mismatch: ${id}`,
    );
  }
  assert(
    (await run(["--list-characters"])).out.trim().split("\n").length === 14,
    "List",
  );
  assert((await run(["--help"])).code === 0, "Help");
  assert(
    (await run(["-c", "clerk", "argument"], "piped")).out.includes("< piped >"),
    "stdin precedence",
  );
  assert(
    (await run(["-c", "clerk", "argument"])).out.includes("< argument >"),
    "empty stdin fallback",
  );
  assert((await run(["-c", "bad"])).code === 1, "invalid character status");
  assert(
    (await run([], "", { GRILLSAY_CHARACTERS: "clerk" })).out.trimEnd()
      .endsWith(characters.clerk.art.trimEnd()),
    "Environment pool",
  );
  assert(
    (await run(["-c", "boomer"], "", { GRILLSAY_CHARACTERS: "bad" })).code ===
      0,
    "CLI env override",
  );
  const gallery = await run([
    "--enabled-characters=boomer,clerk",
    "--preview-all",
  ]);
  assert(
    gallery.out.includes(characters.boomer.art.trimEnd()) &&
      gallery.out.includes(characters.clerk.art.trimEnd()),
    "Gallery",
  );
  assert(
    !(await run(["-c", "clerk"])).out.includes("\x1b"),
    "Redirected color",
  );
  assert(
    (await run(["-c", "clerk", "--color=always"])).out.includes("\x1b["),
    "Forced color",
  );
  assert((await run(["--topic=nonexistent"])).code === 1, "Invalid topic");
  assert(
    (await run(["--topic=nonexistent", "custom"])).code === 0,
    "Custom topic bypass",
  );
  const state = `${cwd}/history.json`;
  const args = ["-c", "clerk", "--state-file", state, "--width=1000"];
  const first = await run(args);
  const second = await run(args);
  assert(
    first.code === 0 && second.code === 0 && first.out !== second.out,
    "Repeat avoidance across processes",
  );
  const before = await Deno.readTextFile(state);
  await run(["--preview-all", "--state-file", state]);
  assert(
    await Deno.readTextFile(state) === before,
    "Gallery must not update history",
  );
  await Deno.mkdir(`${cwd}/pack/art`, { recursive: true });
  await Deno.mkdir(`${cwd}/pack/quotes`);
  await Deno.writeTextFile(`${cwd}/pack/art/tester.txt`, "CUSTOM-ART");
  await Deno.writeTextFile(
    `${cwd}/pack/quotes/tester.txt`,
    "[testing] custom quote",
  );
  const packed = await run([
    "--pack",
    `${cwd}/pack`,
    "-c",
    "tester",
    "--topic=testing",
  ]);
  assert(
    packed.code === 0 && packed.out.includes("custom quote") &&
      packed.out.includes("CUSTOM-ART"),
    `Pack: ${packed.err}`,
  );
  console.log(
    `CLI smoke checks passed (${
      binary ? "compiled executable" : "source"
    }, outside source directory).`,
  );
} finally {
  await Deno.remove(cwd, { recursive: true });
}
