const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
// Discard terminal controls supplied in messages; colors are applied by us after layout.
export function plain(text: string): string {
  // deno-lint-ignore no-control-regex
  return text.replace(/\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)/g, "")
    // deno-lint-ignore no-control-regex
    .replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, "")
    // deno-lint-ignore no-control-regex
    .replace(/[\x00-\x08\x0b-\x1f\x7f-\x9f]/g, "");
}
function graphemes(text: string): string[] {
  return Array.from(segmenter.segment(text), (item) => item.segment);
}
function cellWidth(cluster: string): number {
  if (/^[\p{Mark}\p{Cf}]*$/u.test(cluster)) return 0;
  if (/\p{Emoji_Presentation}|\uFE0F|\u20E3/u.test(cluster)) return 2;
  const code = cluster.codePointAt(0)!;
  return code >= 0x1100 && (
      code <= 0x115f || code === 0x2329 || code === 0x232a ||
      (code >= 0x2e80 && code <= 0xa4cf && code !== 0x303f) ||
      (code >= 0xac00 && code <= 0xd7a3) ||
      (code >= 0xf900 && code <= 0xfaff) ||
      (code >= 0xfe10 && code <= 0xfe19) ||
      (code >= 0xfe30 && code <= 0xfe6f) ||
      (code >= 0xff01 && code <= 0xff60) ||
      (code >= 0xffe0 && code <= 0xffe6) ||
      (code >= 0x1b000 && code <= 0x1b2ff) ||
      (code >= 0x20000 && code <= 0x3fffd)
    )
    ? 2
    : 1;
}
export function displayWidth(text: string): number {
  return graphemes(plain(text)).reduce(
    (sum, cluster) => sum + cellWidth(cluster),
    0,
  );
}
function expandTabs(text: string): string {
  let column = 0;
  return graphemes(text).map((cluster) => {
    if (cluster === "\t") {
      const count = 4 - column % 4;
      column += count;
      return " ".repeat(count);
    }
    column += cellWidth(cluster);
    return cluster;
  }).join("");
}
export function wordWrap(text: string, width: number): string[] {
  const tokens = expandTabs(plain(text)).trim().match(/\s+|\S+/gu) ?? [];
  const lines: string[] = [];
  let current = "";
  for (const token of tokens) {
    if (/^\s+$/u.test(token)) {
      if (current && displayWidth(current + token) <= width) current += token;
      else if (current) {
        lines.push(current.trimEnd());
        current = "";
      }
      continue;
    }
    if (current && displayWidth(current + token) > width) {
      lines.push(current.trimEnd());
      current = "";
    }
    for (const cluster of graphemes(token)) {
      if (displayWidth(current) + cellWidth(cluster) > width) {
        lines.push(current.trimEnd());
        current = "";
      }
      current += cluster;
    }
  }
  if (current) lines.push(current.trimEnd());
  return lines.length ? lines : [""];
}
export function resolveWidth(explicit?: number, columns?: number): number {
  return explicit ??
    (columns && columns >= 6 ? Math.max(2, Math.min(1000, columns - 4)) : 40);
}
export function useColor(
  mode: "auto" | "always" | "never",
  terminal: boolean,
  noColor: boolean,
): boolean {
  return mode === "always" || (mode === "auto" && terminal && !noColor);
}
export function render(
  message: string,
  art: string,
  width = 40,
  color?: number,
): string {
  if (!Number.isInteger(width) || width < 2 || width > 1000) {
    throw new Error("Width must be an integer from 2 to 1000");
  }
  const lines = message.replace(/\r\n/g, "\n").split("\n").flatMap((line) =>
    wordWrap(line, width)
  );
  const boxWidth = lines.reduce(
    (max, line) => Math.max(max, displayWidth(line)),
    0,
  );
  const output = [` ${"_".repeat(boxWidth + 2)}`];
  for (let i = 0; i < lines.length; i++) {
    const padded = lines[i] + " ".repeat(boxWidth - displayWidth(lines[i]));
    output.push(
      lines.length === 1
        ? `< ${padded} >`
        : i === 0
        ? `/ ${padded} \\`
        : i === lines.length - 1
        ? `\\ ${padded} /`
        : `| ${padded} |`,
    );
  }
  output.push(` ${"-".repeat(boxWidth + 2)}`, plain(art).trimEnd());
  const result = output.join("\n");
  return color === undefined ? result : `\x1b[${color}m${result}\x1b[0m`;
}
