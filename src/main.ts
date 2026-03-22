import boomerAscii from "./boomer.ascii" with { type: "text" };

const quips = [
  "Gas grills are just outdoor microwaves.",
  "Lighter fluid is not a flavor. Charcoal is a flavor.",
  "I don't need a thermometer. I have hands.",
  "This grill was a wedding gift. My first wedding.",
  "You're flipping it too soon. You're always flipping it too soon.",
  "I've been seasoning this cast iron since before you were born.",
  "Kingsford. Not the fancy stuff. Kingsford.",
  "A little smoke never hurt anyone. Toughens you up.",
  "I once grilled in a thunderstorm. Best ribs of my life.",
  "This is a marinade. It has been marinating since Thursday.",
  "I don't do 'plant-based.' Plants are what the food eats.",
  "You can have my tongs when you pry them from my cold, well-seasoned hands.",
  "I seeded this lawn in 1987. It does not need your opinion.",
  "Get off my lawn. I mean it. I have a hose.",
  "You call that mowing? You missed a strip. Right there. That one.",
  "I edge by hand. With a spade. The way God intended.",
  "That dandelion didn't get there by itself. Someone let it happen.",
  "A brown lawn is a resting lawn. It'll come back. It always comes back.",
  "The neighbors got artificial turf. We don't talk anymore.",
  "I fertilize twice a year whether it needs it or not.",
  "My son-in-law works in finance. Very successful. Doesn't know how to use a rake.",
  "I'm not saying my son-in-law is useless. I'm saying he's never changed a tire.",
  "He brings wine to a cookout. Every time. Wine.",
  "My son-in-law offered to help. I said I'd let him know. I won't.",
  "He calls it a 'charcuterie board.' I call it cheese and crackers.",
  "We used to leave the doors unlocked. The neighborhood looked out for itself.",
  "We didn't have GPS. We got lost. We figured it out. Builds character.",
  "Back in my day you called someone on the phone and they answered it.",
  "We didn't have self-checkout. We had cashiers and we tipped our hats.",
  "I've had the same wallet since 1994. Still works fine.",
  "My first car cost two thousand dollars and I drove it for eleven years.",
  "My cholesterol is none of your business.",
  "Nobody under forty knows how to shake a hand.",
  "We didn't have avocado toast. We had leftovers and we were grateful.",
  "A firm handshake tells you everything you need to know about a person.",
  "I don't need an app to tell me when to sleep.",
  "We used to fix things. Now everything's disposable. Including manners.",
  "I'm not on social media. If you want to know what I think, come over.",
];

let message: string;
if (!Deno.stdin.isTerminal()) {
  message = (await new Response(Deno.stdin.readable).text()).trim();
} else if (Deno.args.length > 0) {
  message = Deno.args.join(" ");
} else {
  message = quips[Math.floor(Math.random() * quips.length)];
}

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

const lines = message
  .split("\n")
  .flatMap((line) => wordWrap(line.trim(), MAX_WIDTH));
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
