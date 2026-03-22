import boomerAscii from "./boomer.ascii" with { type: "text" };

const quips = [
  "Back in my day, we grilled uphill both ways.",
  "Gas grills are just outdoor microwaves.",
  "You want it well done? Then you want it right.",
  "Lighter fluid is not a flavor. Charcoal is a flavor.",
  "I don't need a thermometer. I have hands.",
  "This grill was a wedding gift. My first wedding.",
  "The secret ingredient is time. And not telling you.",
  "You're flipping it too soon. You're always flipping it too soon.",
  "I've been seasoning this cast iron since before you were born.",
  "A clean grill is a grill that hasn't earned anything.",
  "Pellet grills are just slot machines for people who can't commit.",
  "We didn't have avocado toast. We had leftovers and we were grateful.",
  "This isn't a recipe. This is a lifestyle.",
  "You gotta let the meat rest. Just like me on Sundays.",
  "I don't follow recipes. Recipes follow me.",
  "My cholesterol is none of your business.",
  "Back in my day, a medium-rare steak didn't need a disclaimer.",
  "I've been doing this since before the internet told everyone they were a chef.",
  "The only app I use is a wire brush and elbow grease.",
  "You don't need a subscription to grill a steak.",
  "Nobody under forty knows how to shake a hand or tend a fire.",
  "I once grilled in a thunderstorm. Best ribs of my life.",
  "The HOA said no more Saturday grilling. I said find a new neighborhood.",
  "Kingsford. Not the fancy stuff. Kingsford.",
  "A little smoke never hurt anyone. Toughens you up.",
  "We used to eat outside without calling it 'al fresco.'",
  "My father grilled the same way. And his father before him. And I turned out fine.",
  "You can have my tongs when you pry them from my cold, well-seasoned hands.",
  "This is a marinade. It has been marinating since Thursday.",
  "I don't do 'plant-based.' Plants are what the food eats.",
];

const message =
  Deno.args.length > 0
    ? Deno.args.join(" ")
    : quips[Math.floor(Math.random() * quips.length)];

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
