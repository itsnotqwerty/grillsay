import { characters } from "./characters.ts";
import { parseArgs, validateSelection } from "./cli.ts";
import { character } from "./model.ts";
import { loadPacks } from "./packs.ts";
import { defaultStatePath, readHistory, writeHistory } from "./history.ts";
import { emptyHistory, select, weightedPick } from "./selection.ts";
import {
  displayWidth,
  render,
  resolveWidth,
  useColor,
  wordWrap,
} from "./render.ts";
function assert(value: unknown, message = "Assertion failed"): asserts value {
  if (!value) throw new Error(message);
}
function throws(fn: () => unknown) {
  let failed = false;
  try {
    fn();
  } catch {
    failed = true;
  }
  assert(failed);
}
Deno.test("environment pool, CLI precedence, aliases and strict flags", () => {
  assert(
    parseArgs([], "boomer,clerk").enabledCharacters.join() === "boomer,clerk",
  );
  assert(
    parseArgs(["-c", "fisherman"], "not-real").enabledCharacters.join() ===
      "fisherman",
  );
  assert(parseArgs(["--character=CLERK"]).enabledCharacters[0] === "clerk");
  for (
    const args of [
      ["-c", "all"],
      ["-c", "boomer,clerk"],
      ["--width=1"],
      ["--width=Infinity"],
      ["--width=3.2"],
      ["--width=1001"],
      ["--color=blue"],
      ["--weights=clerk=0"],
      ["--weights=clerk=-1"],
      ["--weights=nope=3"],
      ["--preview-all=true"],
    ]
  ) throws(() => parseArgs(args));
  assert(parseArgs(["--width=60", "--color=always"]).width === 60);
  assert(parseArgs(["--state-file", "custom.json"]).noRepeat);
});
Deno.test("weighted boundaries, defaults, huge finite weights", () => {
  const ids = ["boomer", "clerk"];
  assert(weightedPick(ids, { boomer: 3 }, () => 0.74999) === "boomer");
  assert(weightedPick(ids, { boomer: 3 }, () => 0.75) === "clerk");
  assert(
    weightedPick(ids, { boomer: 1e308, clerk: 1e308 }, () => 0.75) === "clerk",
  );
});
Deno.test("topics filter eligible characters; custom messages bypass topics", () => {
  const registry = {
    a: character("A", "[work] A job\n[food] A lunch"),
    b: character("B", "[food] B lunch"),
  };
  const options = parseArgs(["--topic=work"], "", ["a", "b"]);
  const result = select(registry, options, "", emptyHistory(), () => 0.99);
  assert(result.id === "a" && result.message === "A job");
  options.topic = "missing";
  throws(() => select(registry, options));
  assert(
    select(registry, options, "custom", emptyHistory(), () => 0.99).id === "b",
  );
});
Deno.test("repeat avoidance excludes last character and each character's last quote", () => {
  const registry = { a: character("A", "A1\nA2"), b: character("B", "B1\nB2") };
  const options = parseArgs(["--no-repeat"], "", ["a", "b"]);
  const first = select(registry, options, "", emptyHistory(), () => 0);
  const second = select(registry, options, "", first.history, () => 0);
  const third = select(registry, options, "", second.history, () => 0);
  assert(first.id === "a" && second.id === "b" && third.id === "a");
  assert(first.message === "A1" && third.message === "A2");
  const custom = select(registry, options, "mine", first.history, () => 0);
  assert(custom.history.quotes.a === "A1" && !custom.history.quotes.b);
  const singleton = { a: character("A", "only") };
  const single = parseArgs(["--no-repeat"], "", ["a"]);
  assert(select(singleton, single, "", first.history).message === "only");
});
Deno.test("Unicode columns, ANSI input, tabs and grapheme-safe wrapping", () => {
  for (
    const [value, width] of [
      ["你好", 4],
      ["e\u0301", 1],
      ["👩‍💻", 2],
      ["🇺🇸", 2],
      ["1️⃣", 2],
      ["👍🏽", 2],
      ["\x1b[31mred\x1b[0m", 3],
    ] as const
  ) assert(displayWidth(value) === width, value);
  const message = "你好 👩‍💻 e\u0301 🇺🇸 👍🏽 1️⃣ mixed words\nleft\tright";
  for (const width of [2, 6, 20]) {
    const output = render(message, "ART", width).split("\n");
    output.pop();
    const body = output.slice(1, -1);
    assert(body.every((line) => displayWidth(line) === displayWidth(body[0])));
    assert(output.every((line) => displayWidth(line) <= width + 4));
  }
  assert(wordWrap("👩‍💻👩‍💻", 2).join("|") === "👩‍💻|👩‍💻");
  assert(
    wordWrap("e\u0301e\u0301e\u0301", 2).join("|") === "e\u0301e\u0301|e\u0301",
  );
  assert(!render("\x1b[31mhello\x1b[0m", "ART").includes("\x1b"));
});
Deno.test("width defaults and color policy", () => {
  assert(resolveWidth(undefined, 80) === 76);
  assert(resolveWidth(undefined, 20) === 16);
  assert(resolveWidth() === 40);
  assert(resolveWidth(60, 20) === 60);
  assert(!useColor("auto", false, false));
  assert(!useColor("auto", true, true));
  assert(useColor("auto", true, false));
  assert(useColor("always", false, true));
  assert(!useColor("never", true, false));
  assert(render("hello", "ART", 40, 31).endsWith("\x1b[0m"));
});
Deno.test("pack loading, tags, all selection and collisions", async () => {
  const dir = await Deno.makeTempDir();
  try {
    await Deno.mkdir(`${dir}/art`);
    await Deno.mkdir(`${dir}/quotes`);
    await Deno.writeTextFile(`${dir}/art/tester.txt`, "TEST");
    await Deno.writeTextFile(
      `${dir}/quotes/tester.txt`,
      "[work,technology] Tests passed.\nPlain quote.",
    );
    const registry = await loadPacks(characters, [dir]);
    const options = parseArgs(["-c", "tester"], "", null);
    validateSelection(options, Object.keys(registry));
    assert(registry.tester.entries[0].topics.includes("technology"));
    assert(registry.tester.entries[1].topics.includes("general"));
    const all = parseArgs([], "", null);
    validateSelection(all, Object.keys(registry));
    assert(all.enabledCharacters.length === 15);
    let failed = false;
    try {
      await loadPacks(registry, [dir]);
    } catch {
      failed = true;
    }
    assert(failed);
    await Deno.remove(`${dir}/quotes/tester.txt`);
    failed = false;
    try {
      await loadPacks(characters, [dir]);
    } catch {
      failed = true;
    }
    assert(failed);
  } finally {
    await Deno.remove(dir, { recursive: true });
  }
});
Deno.test("history roundtrip, absent file, corrupt file and platform paths", async () => {
  const dir = await Deno.makeTempDir();
  try {
    const path = `${dir}/sub/history.json`;
    assert(!(await readHistory(path)).lastCharacter);
    const history = {
      version: 1 as const,
      lastCharacter: "boomer",
      quotes: { boomer: "hello" },
    };
    await writeHistory(path, history);
    assert((await readHistory(path)).quotes.boomer === "hello");
    await writeHistory(path, { ...history, lastCharacter: "clerk" });
    assert((await readHistory(path)).lastCharacter === "clerk");
    await Deno.writeTextFile(path, "corrupt");
    assert(!(await readHistory(path)).lastCharacter);
  } finally {
    await Deno.remove(dir, { recursive: true });
  }
  assert(
    defaultStatePath((k) => k === "XDG_STATE_HOME" ? "/state" : undefined) ===
      "/state/grillsay/history.json",
  );
  assert(
    defaultStatePath(
      (k) => k === "LOCALAPPDATA" ? "C:/Local" : undefined,
      "windows",
    ) ===
      "C:/Local/grillsay/history.json",
  );
});
Deno.test("expanded builtin quotes retain diversity and topic coverage", () => {
  const quotes = Object.values(characters).flatMap((c) => c.quotes);
  assert(quotes.length === 470 && new Set(quotes).size === 470);
  for (const c of Object.values(characters)) {
    assert(c.quotes.length >= 32);
    assert(new Set(c.entries.flatMap((q) => q.topics)).size >= 3);
    assert(c.quotes.every((q) => !q.startsWith("[")));
  }
});

Deno.test("duplicate pack quotes merge topics and cannot exhaust repeat selection", () => {
  const registry = {
    tester: character("ART", "[food] Same quote.\n[work] Same quote."),
  };
  assert(registry.tester.entries.length === 1);
  assert(registry.tester.entries[0].topics.join() === "food,work");
  const options = parseArgs(["--no-repeat"], "", ["tester"]);
  const first = select(registry, options);
  assert(
    select(registry, options, "", first.history).message === "Same quote.",
  );
});
