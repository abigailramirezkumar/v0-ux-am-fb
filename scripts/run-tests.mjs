import { execSync } from "child_process";
try {
  const output = execSync("npx vitest run --reporter=verbose 2>&1", {
    cwd: process.cwd(),
    encoding: "utf-8",
    timeout: 60000,
  });
  console.log(output);
} catch (e) {
  console.log(e.stdout || "");
  console.error(e.stderr || "");
  process.exit(1);
}
