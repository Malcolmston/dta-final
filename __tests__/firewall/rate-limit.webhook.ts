import { fakeIpFor, finishWithExit, printFailures, printSummary, runBatches, logger } from "./_helpers.ts";
import type { RequestSpec } from "./_helpers.ts";

async function main(): Promise<void> {
  const total = Number(process.env.TEST_API_TOTAL ?? "1200");
  const concurrency = Number(process.env.TEST_API_CONCURRENCY ?? "20");

  const specs: RequestSpec[] = Array.from({ length: total }, (_, index) => ({
    id: index,
    label: "webhook-rate-limit",
    method: "GET",
    path: `/api/webhook?action=quote&symbol=AAPL&period=1d&interval=1d&burst=${index}`,
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/135.0.0.0 Safari/537.36",
    fakeIp: fakeIpFor(1),
  }));

  logger.step(`Rate Limit Test: ${specs.length} requests with concurrency ${concurrency}`);
  logger.info(`Target: /api/webhook?action=quote (rate limit boundary test)`);

  const results = await runBatches(specs, concurrency);
  printSummary("Webhook Rate Limit", results);

  const rateLimited = results.filter((r) => r.status === 429).length;
  if (rateLimited > 0) {
    logger.warn(`Rate limited requests: ${rateLimited} (${Math.round(rateLimited / results.length * 100)}%)`);
  }

  printFailures(results, 25);
  finishWithExit(results);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
