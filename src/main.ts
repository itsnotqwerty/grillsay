import { characterIds, characters } from "./characters.ts";
import { help, parseArgs, pick, resolveMessage } from "./cli.ts";
import { render } from "./render.ts";

export async function main(args: string[]): Promise<void> {
  const options = parseArgs(args);
  if (options.help) {
    console.log(help);
    return;
  }
  if (options.listCharacters) {
    console.log(characterIds.join("\n"));
    return;
  }
  const character = characters[pick(options.enabledCharacters)];
  const stdin = Deno.stdin.isTerminal()
    ? ""
    : await new Response(Deno.stdin.readable).text();
  const message = resolveMessage(options.message, stdin, character.quotes);
  console.log(render(message, character.art));
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
