const { spawn } = require("node:child_process");
const path = require("node:path");

const scripts = [
  "routes.matrix.ts",
  "user-agents.ts",
  "rate-limit.webhook.ts",
  "cron.access.ts",
  "ip-bypass.ts",
  "headers.fuzz.ts",
  "burst.behavior.ts",
  "ip-spoofing.ts",
  "geo-impersonation.ts",
];

const reset = "\x1b[0m";
const bold = "\x1b[1m";
const dim = "\x1b[2m";
const red = "\x1b[31m";
const green = "\x1b[32m";
const cyan = "\x1b[36m";

type ScriptResult = {
  script: string;
  code: number | null;
  durationMs: number;
};

function timestamp(): string {
  return `${dim}${new Date().toISOString()}${reset}`;
}

function runScript(script: string): Promise<ScriptResult> {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const absolutePath = path.join(__dirname, script);
    const child = spawn(
      "node",
      ["--experimental-strip-types", absolutePath],
      {
        cwd: process.cwd(),
        env: process.env,
        stdio: "inherit",
      }
    );

    child.on("close", (code) => {
      resolve({ script, code, durationMs: Date.now() - startedAt });
    });
  });
}

async function main(): Promise<void> {
  const results: ScriptResult[] = [];
  const startTime = Date.now();

  console.log(`${timestamp()} ${cyan}${bold}Starting Firewall Test Suite${reset} (${scripts.length} tests)`);

  for (const script of scripts) {
    console.log(`\n${timestamp()} ${cyan}>>> Running:${reset} ${script}`);
    const result = await runScript(script);
    results.push(result);
    const statusColor = result.code === 0 ? green : red;
    const status = result.code === 0 ? "PASS" : "FAIL";
    console.log(`${timestamp()} ${statusColor}${status}${reset} ${script} exited with code ${result.code} (${result.durationMs}ms)`);
  }

  const totalDuration = Date.now() - startTime;
  const passed = results.filter((r) => r.code === 0).length;
  const failed = results.filter((r) => r.code !== 0).length;

  console.log(`\n${bold}=== Firewall Test Suite Summary ===${reset}`);
  console.log(`${dim}Total Duration:${reset} ${totalDuration}ms`);
  console.log(`${dim}Tests:${reset} ${results.length} (${green}${passed}${reset} passed, ${red}${failed}${reset} failed)`);

  for (const result of results) {
    const statusColor = result.code === 0 ? green : red;
    const status = result.code === 0 ? "✓" : "✗";
    console.log(`  ${statusColor}${status}${reset} ${result.script} (${result.durationMs}ms, code: ${result.code})`);
  }

  if (results.some((result) => result.code !== 0)) {
    console.log(`\n${red}${bold}SUITE FAILED${reset} - ${failed} test(s) failed`);
    process.exitCode = 1;
  } else {
    console.log(`\n${green}${bold}SUITE PASSED${reset} - all ${passed} tests passed`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
