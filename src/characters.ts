// Static imports embed every asset in the standalone executable.
import arthoArt from "./art/artho.txt" with { type: "text" };
import arthoQuotes from "./quotes/artho.txt" with { type: "text" };
import boomerArt from "./art/boomer.txt" with { type: "text" };
import boomerQuotes from "./quotes/boomer.txt" with { type: "text" };
import clerkArt from "./art/clerk.txt" with { type: "text" };
import clerkQuotes from "./quotes/clerk.txt" with { type: "text" };
import cyberhorseArt from "./art/cyberhorse.txt" with { type: "text" };
import cyberhorseQuotes from "./quotes/cyberhorse.txt" with { type: "text" };
import financebroArt from "./art/financebro.txt" with { type: "text" };
import financebroQuotes from "./quotes/financebro.txt" with { type: "text" };
import fishermanArt from "./art/fisherman.txt" with { type: "text" };
import fishermanQuotes from "./quotes/fisherman.txt" with { type: "text" };
import foremanArt from "./art/foreman.txt" with { type: "text" };
import foremanQuotes from "./quotes/foreman.txt" with { type: "text" };
import glangleyArt from "./art/glangley.txt" with { type: "text" };
import glangleyQuotes from "./quotes/glangley.txt" with { type: "text" };
import groundskeeperArt from "./art/groundskeeper.txt" with { type: "text" };
import groundskeeperQuotes from "./quotes/groundskeeper.txt" with {
  type: "text",
};
import informantArt from "./art/informant.txt" with { type: "text" };
import informantQuotes from "./quotes/informant.txt" with { type: "text" };
import interceptorArt from "./art/interceptor.txt" with { type: "text" };
import interceptorQuotes from "./quotes/interceptor.txt" with { type: "text" };
import rapperArt from "./art/rapper.txt" with { type: "text" };
import rapperQuotes from "./quotes/rapper.txt" with { type: "text" };
import schizoArt from "./art/schizo.txt" with { type: "text" };
import schizoQuotes from "./quotes/schizo.txt" with { type: "text" };
import shrimpcasterArt from "./art/shrimpcaster.txt" with { type: "text" };
import shrimpcasterQuotes from "./quotes/shrimpcaster.txt" with {
  type: "text",
};

export interface Character {
  art: string;
  quotes: string[];
}

function character(art: string, text: string): Character {
  const quotes = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!art.trim() || !quotes.length) {
    throw new Error("Character assets must not be empty");
  }
  return { art, quotes };
}

export const characters = {
  artho: character(arthoArt, arthoQuotes),
  boomer: character(boomerArt, boomerQuotes),
  clerk: character(clerkArt, clerkQuotes),
  cyberhorse: character(cyberhorseArt, cyberhorseQuotes),
  financebro: character(financebroArt, financebroQuotes),
  fisherman: character(fishermanArt, fishermanQuotes),
  foreman: character(foremanArt, foremanQuotes),
  glangley: character(glangleyArt, glangleyQuotes),
  groundskeeper: character(groundskeeperArt, groundskeeperQuotes),
  informant: character(informantArt, informantQuotes),
  interceptor: character(interceptorArt, interceptorQuotes),
  rapper: character(rapperArt, rapperQuotes),
  schizo: character(schizoArt, schizoQuotes),
  shrimpcaster: character(shrimpcasterArt, shrimpcasterQuotes),
};

export type CharacterId = keyof typeof characters;
export const characterIds = Object.keys(characters) as CharacterId[];
