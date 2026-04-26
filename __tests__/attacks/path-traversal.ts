import { finishWithExit, printFailures, printSummary, runBatches, logger, testUserAgents } from "../firewall/_helpers.ts";
import type { RequestSpec } from "../firewall/_helpers.ts";

const targetPath = "/api/stocs-test";

async function main(): Promise<void> {
  const pathPayloads = [
    "../etc/passwd",
    "..%2f..%2f..%2fetc%2fpasswd",
    "....//....//....//etc/passwd",
    "/etc/passwd",
    "../../../../../../../../etc/passwd",
    "..\\..\\..\\..\\windows\\system32\\config\\sam",
    "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd",
    "/..%2f..%2f..%2fetc/passwd",
    "..%252f..%252f..%252fetc/passwd",
    "..../..../..../etc/passwd",
    "/etc/hosts",
    "../../../../../etc/hostname",
    "..//..//..//etc/passwd",
    "%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/etc/passwd",
    "..%c0%af..%c0%af..%c0%afetc/passwd",
    "AAPL/../../../etc/passwd",
    "AAPL/..\\..\\..\\etc\\passwd",
    "/var/www/../../etc/passwd",
    "..%2F..%2F..%2Fetc%2Fpasswd",
    "/%2e%2e/etc/passwd",
  ];

  const specs: RequestSpec[] = pathPayloads.map((payload, index) => ({
    id: index,
    label: `path-${payload.substring(0, 15)}`,
    method: "GET",
    path: `${targetPath}&action=${encodeURIComponent("quote")}&symbol=${encodeURIComponent(payload)}`,
    userAgent: testUserAgents[index % testUserAgents.length],
    fakeIp: undefined,
  }));

  logger.step(`Testing ${specs.length} path traversal payloads`);
  const results = await runBatches(specs, 4);
  printSummary("Path Traversal Attacks", results);
  printFailures(results, 30);
  finishWithExit(results);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});