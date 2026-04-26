import { fakeIpFor, finishWithExit, printFailures, printSummary, runBatches, logger } from "./_helpers.ts";
import type { RequestSpec } from "./_helpers.ts";

async function main(): Promise<void> {
  const headerCases: Array<Record<string, string>> = [
    { "X-Requested-With": "XMLHttpRequest" },
    { "X-Forwarded-Proto": "https" },
    { "X-Test-Mode": "firewall" },
    { Referer: "https://example.com/" },
    { Origin: "https://example.com" },
    { "X-Correlation-Id": "firewall-fuzz-1" },
    { "X-Api-Version": "2026-04-26" },
    { Cookie: "session=test-session" },
    { Accept: "application/json" },
    { Accept: "text/html,*/*;q=0.8" },
  ];

  const specs: RequestSpec[] = headerCases.map((headers, index) => ({
    id: index,
    label: "headers-fuzz",
    method: "GET",
    path: `/api/health?case=${index}`,
    userAgent: "Mozilla/5.0",
    fakeIp: fakeIpFor(index),
    headers,
  }));

  logger.step(`Headers Fuzz: Testing ${specs.length} header variations`);
  logger.info(`Headers tested: ${Object.keys(headerCases[0]).join(", ")} + variations`);

  const results = await runBatches(specs, 4);
  printSummary("Headers Fuzz", results);
  printFailures(results, 20);
  finishWithExit(results);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
