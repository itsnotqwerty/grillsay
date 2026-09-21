import { type CharacterId, characterIds } from "./characters.ts";

export interface Options {
  enabledCharacters: CharacterId[];
  message: string;
  help: boolean;
  listCharacters: boolean;
}

export function parseArgs(args: string[]): Options {
  const options: Options = {
    enabledCharacters: [...characterIds],
    message: "",
    help: false,
    listCharacters: false,
  };
  const words: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--") {
      words.push(...args.slice(i + 1));
      break;
    }
    if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg === "--list-characters") options.listCharacters = true;
    else if (
      arg === "--enabled-characters" || arg.startsWith("--enabled-characters=")
    ) {
      const value = arg === "--enabled-characters"
        ? args[++i]
        : arg.slice(arg.indexOf("=") + 1);
      if (!value || value.startsWith("--")) {
        throw new Error(
          "--enabled-characters requires a comma-separated list or 'all'",
        );
      }
      const names = value.split(",").map((name) => name.trim().toLowerCase());
      if (names.length === 1 && names[0] === "all") {
        options.enabledCharacters = [...characterIds];
      } else {
        const invalid = names.filter((name) =>
          !characterIds.includes(name as CharacterId)
        );
        if (invalid.length) {
          throw new Error(
            `Invalid character(s): ${
              invalid.map((name) => name || "(empty)").join(", ")
            }. Choose from: ${characterIds.join(", ")}`,
          );
        }
        options.enabledCharacters = [...new Set(names)] as CharacterId[];
      }
    } else if (arg.startsWith("-")) {
      throw new Error(
        `Unknown option: ${arg}. Use -- before a message beginning with '-'.`,
      );
    } else words.push(arg);
  }
  options.message = words.join(" ");
  return options;
}

export function pick<T>(items: readonly T[], random = Math.random): T {
  if (!items.length) throw new Error("Cannot choose from an empty list");
  return items[Math.floor(random() * items.length)];
}

export function resolveMessage(
  explicit: string,
  stdin: string,
  quotes: string[],
): string {
  return stdin.trim() || explicit || pick(quotes);
}

export const help = `Usage: grillsay [options] [message ...]

  --enabled-characters <names>  Randomly choose from comma-separated character IDs
                               (default: all). One name selects that character.
  --enabled-characters=all      Enable the entire cast
  --list-characters            List available character IDs
  -h, --help                   Show this help
  --                          Treat remaining arguments as message text

Nonempty piped input takes priority over message arguments.
Without a message, a quote from the selected character is used.
Repeated --enabled-characters flags use the last list.

Examples:
  grillsay --enabled-characters boomer
  grillsay --enabled-characters fisherman,shrimpcaster "One more cast."
  echo "Nothing to see here." | grillsay --enabled-characters interceptor

Characters: ${characterIds.join(", ")}`;
