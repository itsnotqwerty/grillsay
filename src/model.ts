export interface Quote {
  text: string;
  topics: string[];
}
export interface Character {
  art: string;
  quotes: string[];
  entries: Quote[];
  color: number;
}
export type Registry = Record<string, Character>;
export const idPattern = /^[a-z][a-z0-9_-]*$/;
export function character(art: string, text: string, color = 36): Character {
  const parsed = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
    .map((line) => {
      const match = line.match(/^\[([^\]]+)\]\s+(.+)$/);
      const topics = match
        ? match[1].split(",").map((topic) => topic.trim().toLowerCase())
        : ["general"];
      if (topics.some((topic) => !idPattern.test(topic))) {
        throw new Error(`Invalid quote topics: ${line}`);
      }
      return { text: match ? match[2] : line, topics: [...new Set(topics)] };
    });
  const unique = new Map<string, Quote>();
  for (const quote of parsed) {
    const previous = unique.get(quote.text);
    unique.set(quote.text, {
      text: quote.text,
      topics: [...new Set([...(previous?.topics ?? []), ...quote.topics])],
    });
  }
  const entries = [...unique.values()];
  if (!art.trim() || !entries.length) {
    throw new Error("Character assets must not be empty");
  }
  if (!Number.isInteger(color) || color < 30 || color > 37) {
    throw new Error(
      "Character color must be an ANSI foreground code from 30 to 37",
    );
  }
  return { art, quotes: entries.map((quote) => quote.text), entries, color };
}
