import { character, idPattern, type Registry } from "./model.ts";

export async function loadPacks(
  builtins: Registry,
  directories: string[],
): Promise<Registry> {
  const registry = Object.assign(Object.create(null), builtins) as Registry;
  for (const directory of directories) {
    try {
      const ids: string[] = [];
      for await (const entry of Deno.readDir(`${directory}/art`)) {
        if (entry.isFile && entry.name.endsWith(".txt")) {
          ids.push(entry.name.slice(0, -4));
        }
      }
      if (!ids.length) {
        throw new Error("art/ must contain at least one .txt file");
      }
      for (const id of ids.sort()) {
        if (
          !idPattern.test(id) || id === "all" ||
          ["constructor", "prototype"].includes(id)
        ) throw new Error(`Invalid character ID: ${id}`);
        if (Object.hasOwn(registry, id)) {
          throw new Error(`Duplicate character ID: ${id}`);
        }
        const [art, quotes] = await Promise.all([
          Deno.readTextFile(`${directory}/art/${id}.txt`),
          Deno.readTextFile(`${directory}/quotes/${id}.txt`),
        ]);
        registry[id] = character(art, quotes);
      }
      for await (const entry of Deno.readDir(`${directory}/quotes`)) {
        if (
          entry.isFile && entry.name.endsWith(".txt") &&
          !ids.includes(entry.name.slice(0, -4))
        ) throw new Error(`Quote file has no matching art: ${entry.name}`);
      }
    } catch (error) {
      throw new Error(
        `Pack ${directory}: ${error instanceof Error ? error.message : error}`,
      );
    }
  }
  return registry;
}
