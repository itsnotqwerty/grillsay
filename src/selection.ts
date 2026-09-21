import { type Options, pick } from "./cli.ts";
import type { Registry } from "./model.ts";
export interface History {
  version: 1;
  lastCharacter?: string;
  quotes: Record<string, string>;
}
export const emptyHistory = (): History => ({ version: 1, quotes: {} });
export function eligible(
  registry: Registry,
  options: Options,
  customMessage = "",
): string[] {
  const ids = options.enabledCharacters.filter((id) =>
    !options.topic || customMessage ||
    registry[id].entries.some((q) => q.topics.includes(options.topic!))
  );
  if (!ids.length) {
    throw new Error(
      `No enabled characters have quotes for topic: ${options.topic}`,
    );
  }
  return ids;
}
export function weightedPick(
  ids: string[],
  weights: Record<string, number>,
  random = Math.random,
): string {
  if (!ids.length) throw new Error("No characters available");
  // Normalize first to keep even very large finite weights from overflowing the sum.
  const max = Math.max(...ids.map((id) => weights[id] ?? 1));
  const values = ids.map((id) => (weights[id] ?? 1) / max);
  let point = random() * values.reduce((a, b) => a + b, 0);
  for (let i = 0; i < ids.length; i++) {
    point -= values[i];
    if (point < 0) return ids[i];
  }
  return ids[ids.length - 1];
}
export function select(
  registry: Registry,
  options: Options,
  customMessage = "",
  history = emptyHistory(),
  random = Math.random,
): { id: string; message: string; history: History } {
  let ids = eligible(registry, options, customMessage);
  if (options.noRepeat && ids.length > 1) {
    ids = ids.filter((id) => id !== history.lastCharacter);
  }
  const id = weightedPick(ids, options.weights, random);
  let quotes = registry[id].entries.filter((q) =>
    !options.topic || customMessage || q.topics.includes(options.topic)
  ).map((q) => q.text);
  if (options.noRepeat && quotes.length > 1) {
    quotes = quotes.filter((q) => q !== history.quotes[id]);
  }
  const message = customMessage || pick(quotes, random);
  return {
    id,
    message,
    history: {
      version: 1,
      lastCharacter: id,
      quotes: {
        ...history.quotes,
        ...(!customMessage ? { [id]: message } : {}),
      },
    },
  };
}
