import { finishWithExit, printFailures, printSummary, runBatches, logger } from "../firewall/_helpers.ts";
import type { RequestSpec } from "../firewall/_helpers.ts";

const targetPath = "/api/webhook?action=quote&symbol=AAPL&period=1d&interval=1d";

async function main(): Promise<void> {
  const totalRequests = Number(process.env.TEST_API_TOTAL ?? "200");
  const concurrency = Number(process.env.TEST_API_CONCURRENCY ?? "15");

  const userAgents = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/135.0.0.0 Safari/537.36",
    "curl/8.7.1",
    "Python-urllib/3.11",
    "Wget/1.24.5",
  ];

  const specs: RequestSpec[] = Array.from({ length: totalRequests }, (_, index) => ({
    id: index,
    label: `dos-${index % 4}`,
    method: "GET",
    path: `${targetPath}&request=${index}`,
    userAgent: userAgents[index % userAgents.length],
    fakeIp: `198.${Math.floor(index / 250) % 250}.${index % 250}.${(index % 254) + 1}`,
  }));

  logger.step(`Testing DoS resilience with ${specs.length} requests (concurrency: ${concurrency})`);
  const results = await runBatches(specs, concurrency);
  printSummary("DoS Amplification Test", results);

  const timeouts = results.filter((r) => r.status === 0).length;
  const errors = results.filter((r) => r.status >= 500).length;
  if (timeouts > 0 || errors > 0) {
    logger.warn(`Potential issues: ${timeouts} timeouts, ${errors} 5xx errors`);
  }

  printFailures(results, 25);
  finishWithExit(results);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});