import boomerAscii from "./boomer.ascii" with { type: "text" };

const message =
  Deno.args.length > 0
    ? Deno.args.join(" ")
    : "Back in my day, we grilled uphill both ways.";

const MAX_WIDTH = 40;

function wordWrap(text: string, width: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (current.length + word.length + (current ? 1 : 0) > width) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

const lines = wordWrap(message, MAX_WIDTH);
const boxWidth = Math.max(...lines.map((l) => l.length));
const border = "_".repeat(boxWidth + 2);

console.log(` ${border}`);
for (let i = 0; i < lines.length; i++) {
  const padded = lines[i].padEnd(boxWidth);
  if (lines.length === 1) {
    console.log(`< ${padded} >`);
  } else if (i === 0) {
    console.log(`/ ${padded} \\`);
  } else if (i === lines.length - 1) {
    console.log(`\\ ${padded} /`);
  } else {
    console.log(`| ${padded} |`);
  }
}
console.log(` ${"-".repeat(boxWidth + 2)}`);

const art = boomerAscii;
console.log(art);
