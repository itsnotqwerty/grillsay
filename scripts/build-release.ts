const platform = Deno.build.os === "darwin" ? "macos" : Deno.build.os;
const suffix = Deno.build.os === "windows" ? ".exe" : "";
const filename = `grillsay-${platform}-${Deno.build.arch}${suffix}`;
await Deno.mkdir("dist/releases", { recursive: true });
const output = `${Deno.cwd()}/dist/releases/${filename}`;
const build = await new Deno.Command(Deno.execPath(), {
  args: [
    "compile",
    "--allow-read",
    "--allow-write",
    "--allow-env=GRILLSAY_CHARACTERS,NO_COLOR,XDG_STATE_HOME,HOME,LOCALAPPDATA,USERPROFILE",
    "--unstable-raw-imports",
    "--output",
    output,
    "src/main.ts",
  ],
  stdout: "inherit",
  stderr: "inherit",
}).output();
if (!build.success) Deno.exit(build.code);
const smoke = await new Deno.Command(Deno.execPath(), {
  args: [
    "run",
    "--allow-all",
    "--unstable-raw-imports",
    "scripts/smoke.ts",
    output,
  ],
  stdout: "inherit",
  stderr: "inherit",
}).output();
if (!smoke.success) Deno.exit(smoke.code);
console.log(`Release asset ready: ${filename}`);
