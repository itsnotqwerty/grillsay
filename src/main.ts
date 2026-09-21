import { characters } from "./characters.ts";
import { help, parseArgs, validateSelection } from "./cli.ts";
import { loadPacks } from "./packs.ts";
import { eligible, emptyHistory, select } from "./selection.ts";
import {
  defaultStatePath,
  readEnv,
  readHistory,
  writeHistory,
} from "./history.ts";
import { render, resolveWidth, useColor } from "./render.ts";

export async function main(args: string[]): Promise<void> {
  const options = parseArgs(args, readEnv("GRILLSAY_CHARACTERS"), null);
  if (options.help) {
    console.log(help);
    return;
  }
  const registry = await loadPacks(characters, options.packs);
  validateSelection(options, Object.keys(registry));
  if (options.listCharacters) {
    console.log(Object.keys(registry).join("\n"));
    return;
  }
  if (options.listTopics) {
    console.log(
      [
        ...new Set(
          options.enabledCharacters.flatMap((id) =>
            registry[id].entries.flatMap((q) => q.topics)
          ),
        ),
      ].sort().join("\n"),
    );
    return;
  }
  const terminal = Deno.stdout.isTerminal();
  let columns: number | undefined;
  if (terminal) {
    try {
      columns = Deno.consoleSize().columns;
    } catch { /* Redirected console. */ }
  }
  const width = resolveWidth(options.width, columns);
  const color = useColor(
    options.color,
    terminal,
    readEnv("NO_COLOR") !== undefined,
  );
  const draw = (id: string, message: string) =>
    render(
      message,
      registry[id].art,
      width,
      color ? registry[id].color : undefined,
    );
  if (options.previewAll) {
    for (const id of eligible(registry, options, options.message)) {
      const quote = registry[id].entries.find((q) =>
        !options.topic || q.topics.includes(options.topic)
      );
      console.log(`${id}\n${draw(id, options.message || quote!.text)}\n`);
    }
    return;
  }
  const stdin = Deno.stdin.isTerminal()
    ? ""
    : await new Response(Deno.stdin.readable).text();
  const customMessage = stdin.trim() || options.message;
  let path: string | undefined;
  if (options.noRepeat) path = options.stateFile ?? defaultStatePath();
  const history = path ? await readHistory(path) : emptyHistory();
  const result = select(registry, options, customMessage, history);
  console.log(draw(result.id, result.message));
  if (path) await writeHistory(path, result.history);
}
if (import.meta.main) {
  try {
    await main(Deno.args);
  } catch (error) {
    console.error(
      `grillsay: ${error instanceof Error ? error.message : String(error)}`,
    );
    Deno.exit(1);
  }
}
