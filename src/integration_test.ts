Deno.test("CLI integration in a separate working directory", async () => {
  const script = new URL("../scripts/smoke.ts", import.meta.url);
  const result = await new Deno.Command(Deno.execPath(), {
    args: ["run", "--allow-all", "--unstable-raw-imports", script.href],
    stdout: "piped",
    stderr: "piped",
  }).output();
  if (!result.success) throw new Error(new TextDecoder().decode(result.stderr));
});
