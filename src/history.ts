import { emptyHistory, type History } from "./selection.ts";
export type Environment = (name: string) => string | undefined;
export function readEnv(name: string): string | undefined {
  try {
    return Deno.env.get(name);
  } catch {
    return undefined;
  }
}
export function defaultStatePath(
  env: Environment = readEnv,
  os = Deno.build.os,
): string {
  const root = env("XDG_STATE_HOME") ||
    (os === "windows"
      ? env("LOCALAPPDATA") || env("USERPROFILE")
      : env("HOME") && `${env("HOME")}/.local/state`);
  if (!root) {
    throw new Error("Cannot locate a state directory; use --state-file PATH");
  }
  return `${root}/grillsay/history.json`;
}
export async function readHistory(path: string): Promise<History> {
  try {
    const data = JSON.parse(await Deno.readTextFile(path));
    if (
      data?.version !== 1 || typeof data.quotes !== "object" ||
      data.quotes === null || Array.isArray(data.quotes) ||
      Object.values(data.quotes).some((q) => typeof q !== "string") ||
      (data.lastCharacter !== undefined &&
        typeof data.lastCharacter !== "string")
    ) throw new Error("Invalid history format");
    return {
      version: 1,
      lastCharacter: data.lastCharacter,
      quotes: data.quotes,
    };
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) {
      console.error(
        `grillsay: warning: could not read history (${
          error instanceof Error ? error.message : error
        }); starting fresh`,
      );
    }
    return emptyHistory();
  }
}
export async function writeHistory(
  path: string,
  history: History,
): Promise<void> {
  const parent = path.replace(/[/\\][^/\\]*$/, "");
  const directory = parent === path ? "." : parent || "/";
  let temporary: string | undefined;
  try {
    await Deno.mkdir(directory, { recursive: true });
    temporary = await Deno.makeTempFile({
      dir: directory,
      prefix: ".grillsay-",
    });
    await Deno.writeTextFile(temporary, JSON.stringify(history) + "\n");
    await Deno.rename(temporary, path);
  } catch (error) {
    console.error(
      `grillsay: warning: could not save history (${
        error instanceof Error ? error.message : error
      })`,
    );
  } finally {
    if (temporary) await Deno.remove(temporary).catch(() => {});
  }
}
