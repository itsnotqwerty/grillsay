import { characterIds } from "./characters.ts";
import { idPattern } from "./model.ts";

export interface Options {
  enabledCharacters: string[];
  message: string;
  help: boolean;
  listCharacters: boolean;
  listTopics: boolean;
  previewAll: boolean;
  width?: number;
  color: "auto" | "always" | "never";
  weights: Record<string, number>;
  topic?: string;
  packs: string[];
  noRepeat: boolean;
  stateFile?: string;
}

export function validateSelection(options: Options, available: string[]): void {
  if (
    options.enabledCharacters.length === 1 &&
    options.enabledCharacters[0] === "all"
  ) {
    options.enabledCharacters = [...available];
  }
  for (
    const name of [
      ...options.enabledCharacters,
      ...Object.keys(options.weights),
    ]
  ) {
    if (!available.includes(name)) {
      throw new Error(
        `Invalid character: ${name || "(empty)"}. Choose from: ${
          available.join(", ")
        }`,
      );
    }
  }
}

export function parseArgs(
  args: string[],
  envCharacters = "",
  available: string[] | null = characterIds,
): Options {
  const options: Options = {
    enabledCharacters: [],
    message: "",
    help: false,
    listCharacters: false,
    listTopics: false,
    previewAll: false,
    color: "auto",
    weights: {},
    packs: [],
    noRepeat: false,
  };
  let selection = envCharacters.trim() || "all";
  let single = false;
  const words: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--") {
      words.push(...args.slice(i + 1));
      break;
    }
    if (!arg.startsWith("-")) {
      words.push(arg);
      continue;
    }
    const equal = arg.indexOf("=");
    const flag = equal < 0 ? arg : arg.slice(0, equal);
    const value = () => {
      const result = equal < 0 ? args[++i] : arg.slice(equal + 1);
      if (!result || result.startsWith("--")) {
        throw new Error(`${flag} requires a value`);
      }
      return result;
    };
    if (
      [
        "--help",
        "-h",
        "--list-characters",
        "--list-topics",
        "--preview-all",
        "--no-repeat",
      ].includes(flag) && equal >= 0
    ) {
      throw new Error(`${flag} does not accept a value`);
    }
    switch (flag) {
      case "--help":
      case "-h":
        options.help = true;
        break;
      case "--list-characters":
        options.listCharacters = true;
        break;
      case "--list-topics":
        options.listTopics = true;
        break;
      case "--preview-all":
        options.previewAll = true;
        break;
      case "--no-repeat":
        options.noRepeat = true;
        break;
      case "--enabled-characters":
        selection = value();
        single = false;
        break;
      case "--character":
      case "-c":
        selection = value();
        single = true;
        break;
      case "--width": {
        const raw = value();
        options.width = Number(raw);
        if (
          !/^\d+$/.test(raw) || !Number.isInteger(options.width) ||
          options.width < 2 || options.width > 1000
        ) throw new Error("--width must be an integer from 2 to 1000");
        break;
      }
      case "--color": {
        const color = value();
        if (color !== "auto" && color !== "always" && color !== "never") {
          throw new Error("--color must be auto, always, or never");
        }
        options.color = color;
        break;
      }
      case "--weights": {
        options.weights = {};
        for (const item of value().split(",")) {
          const match = item.trim().match(
            /^([a-z][a-z0-9_-]*)\s*=\s*(\d+(?:\.\d+)?)$/i,
          );
          if (
            !match || !Number.isFinite(Number(match[2])) ||
            Number(match[2]) <= 0
          ) {
            throw new Error(
              "--weights requires positive weights, e.g. boomer=3,clerk=1",
            );
          }
          options.weights[match[1].toLowerCase()] = Number(match[2]);
        }
        break;
      }
      case "--topic":
        options.topic = value().trim().toLowerCase();
        if (!idPattern.test(options.topic)) {
          throw new Error("--topic requires a topic name");
        }
        break;
      case "--pack":
        options.packs.push(value());
        break;
      case "--state-file":
        options.stateFile = value();
        options.noRepeat = true;
        break;
      default:
        throw new Error(
          `Unknown option: ${flag}. Use -- before a message beginning with '-'.`,
        );
    }
  }
  options.enabledCharacters = [
    ...new Set(selection.split(",").map((s) => s.trim().toLowerCase())),
  ];
  if (
    options.enabledCharacters.some((s) => !s) ||
    (single &&
      (options.enabledCharacters.length !== 1 ||
        options.enabledCharacters[0] === "all"))
  ) {
    throw new Error(
      "Provide character IDs; --character accepts exactly one ID",
    );
  }
  if (available && !options.help) validateSelection(options, available);
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

  -c, --character ID          Select one character
  --enabled-characters IDS   Random pool (comma-separated IDs or all)
  --width N                  Bubble content columns, 2–1000 (auto on a terminal)
  --color auto|always|never  Character accent color (default: auto)
  --weights ID=N,ID=N        Relative positive weights; unspecified IDs weigh 1
  --topic NAME              Choose quotes tagged with this topic
  --no-repeat               Avoid previous character and its last quote when possible
  --state-file PATH         Override history file; also enables --no-repeat
  --pack DIRECTORY          Load art/*.txt and quotes/*.txt (repeatable)
  --preview-all              Show the enabled cast with sample quotes
  --list-characters          List IDs, including loaded packs
  --list-topics              List topics for the enabled cast
  -h, --help                 Show help without reading stdin
  --                        Treat remaining arguments as message text

GRILLSAY_CHARACTERS sets the default pool; CLI selection flags override it.
Repeated selection flags use the last list. Nonempty stdin overrides message text.
NO_COLOR disables auto color. --color always explicitly forces it.
Topic selection applies to generated quotes; custom messages bypass topic filtering.
Gallery/list commands do not read stdin or change history.

Examples:
  grillsay -c fisherman
  grillsay --enabled-characters boomer,clerk --weights boomer=3 --no-repeat
  grillsay --topic work --preview-all
  grillsay --pack ./examples/pack -c barista
`;
