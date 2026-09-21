const MAX_WIDTH = 40;
const TAB_WIDTH = 4;

function expandTabs(text: string, tabWidth = TAB_WIDTH): string {
  let column = 0;
  let expanded = "";

  for (const char of text) {
    if (char === "\t") {
      const spaces = tabWidth - (column % tabWidth);
      expanded += " ".repeat(spaces);
      column += spaces;
    } else {
      expanded += char;
      column += 1;
    }
  }

  return expanded;
}

function wordWrap(text: string, width: number): string[] {
  const normalized = expandTabs(text);
  if (normalized.length === 0) return [""];

  const tokens = normalized.match(/\s+|\S+/g) ?? [];
  const lines: string[] = [];
  let current = "";

  for (const token of tokens) {
    if (token.length > width) {
      if (current) {
        lines.push(current);
        current = "";
      }

      for (let i = 0; i < token.length; i += width) {
        const chunk = token.slice(i, i + width);
        if (chunk.length === width) {
          lines.push(chunk);
        } else {
          current = chunk;
        }
      }
      continue;
    }

    if (current.length + token.length > width) {
      if (current) lines.push(current);
      current = token.trimStart();
    } else {
      current += token;
    }
  }

  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
}

export function render(message: string, art: string): string {
  const output: string[] = [];
  const lines = message
    .split("\n")
    .flatMap((line) => wordWrap(line.trim(), MAX_WIDTH));
  const boxWidth = Math.max(...lines.map((l) => l.length));
  const border = "_".repeat(boxWidth + 2);

  output.push(` ${border}`);
  for (let i = 0; i < lines.length; i++) {
    const padded = lines[i].padEnd(boxWidth);
    if (lines.length === 1) {
      output.push(`< ${padded} >`);
    } else if (i === 0) {
      output.push(`/ ${padded} \\`);
    } else if (i === lines.length - 1) {
      output.push(`\\ ${padded} /`);
    } else {
      output.push(`| ${padded} |`);
    }
  }
  output.push(` ${"-".repeat(boxWidth + 2)}`);

  output.push(art.trimEnd());
  return output.join("\n");
}
