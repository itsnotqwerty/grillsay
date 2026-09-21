import { characterIds, characters } from "./characters.ts";
import { parseArgs, pick, resolveMessage } from "./cli.ts";
import { render } from "./render.ts";

function assert(condition: boolean): asserts condition {
  if (!condition) throw new Error("Assertion failed");
}
Deno.test("all fourteen characters have art and distinct quotes", () => {
  assert(characterIds.length === 14);
  const seen = new Set<string>();
  for (const character of Object.values(characters)) {
    assert(character.art.trim().length > 0);
    assert(character.quotes.length >= 16);
    for (const quote of character.quotes) {
      assert(!seen.has(quote));
      seen.add(quote);
      assert(render(quote, character.art).endsWith(character.art.trimEnd()));
    }
  }
});
Deno.test("default, all, single, subset, deduplication and last flag wins", () => {
  assert(parseArgs([]).enabledCharacters.length === 14);
  assert(
    parseArgs(["--enabled-characters=all"]).enabledCharacters.length === 14,
  );
  assert(
    parseArgs(["--enabled-characters", "boomer"]).enabledCharacters.join() ===
      "boomer",
  );
  const options = parseArgs([
    "--enabled-characters= fisherman,BOOMER,fisherman ",
    "hello",
    "world",
  ]);
  assert(options.enabledCharacters.join() === "fisherman,boomer");
  assert(options.message === "hello world");
  assert(pick(options.enabledCharacters, () => 0) === "fisherman");
  assert(pick(options.enabledCharacters, () => 0.9999) === "boomer");
  assert(
    parseArgs(["--enabled-characters=boomer", "--enabled-characters=clerk"])
      .enabledCharacters.join() === "clerk",
  );
});
Deno.test("reject missing, empty, unknown, and malformed lists", () => {
  for (
    const args of [
      ["--enabled-characters"],
      ["--enabled-characters="],
      ["--enabled-characters", "--help"],
      ["--enabled-characters=nope"],
      ["--enabled-characters=boomer,"],
      ["--enabled-characters=all,boomer"],
      ["--enabled-character=boomer"],
    ]
  ) {
    let threw = false;
    try {
      parseArgs(args);
    } catch {
      threw = true;
    }
    assert(threw);
  }
});
Deno.test("help, list and literal message delimiter", () => {
  assert(parseArgs(["-h"]).help);
  assert(parseArgs(["--help"]).help);
  assert(parseArgs(["--list-characters"]).listCharacters);
  assert(
    parseArgs(["--", "--enabled-characters", "nope"]).message ===
      "--enabled-characters nope",
  );
});
Deno.test("stdin priority and empty stdin fallback", () => {
  assert(resolveMessage("argument", " pipe\n", ["quote"]) === "pipe");
  assert(resolveMessage("argument", " \n", ["quote"]) === "argument");
  assert(resolveMessage("", "", ["quote"]) === "quote");
});
Deno.test("speech bubbles wrap long words, tabs and multiline input", () => {
  for (
    const message of ["", "hello", "a".repeat(95), "one\ntwo", "left\tright"]
  ) {
    const output = render(message, "ART");
    const lines = output.split("\n");
    assert(lines.pop() === "ART");
    assert(lines.every((line) => line.length <= 44));
    assert(!output.includes("\t"));
  }
});
