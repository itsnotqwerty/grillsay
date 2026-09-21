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

import { character } from "./model.ts";
export type { Character } from "./model.ts";

export const characters = {
  artho: character(arthoArt, arthoQuotes, 35),
  boomer: character(boomerArt, boomerQuotes, 33),
  clerk: character(clerkArt, clerkQuotes, 37),
  cyberhorse: character(cyberhorseArt, cyberhorseQuotes, 36),
  financebro: character(financebroArt, financebroQuotes, 32),
  fisherman: character(fishermanArt, fishermanQuotes, 34),
  foreman: character(foremanArt, foremanQuotes, 33),
  glangley: character(glangleyArt, glangleyQuotes, 36),
  groundskeeper: character(groundskeeperArt, groundskeeperQuotes, 32),
  informant: character(informantArt, informantQuotes, 35),
  interceptor: character(interceptorArt, interceptorQuotes, 34),
  rapper: character(rapperArt, rapperQuotes, 31),
  schizo: character(schizoArt, schizoQuotes, 31),
  shrimpcaster: character(shrimpcasterArt, shrimpcasterQuotes, 36),
};

export type CharacterId = keyof typeof characters;
export const characterIds = Object.keys(characters) as CharacterId[];
