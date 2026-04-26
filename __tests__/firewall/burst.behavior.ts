import { fakeIpFor, finishWithExit, printFailures, printSummary, runBatches, logger } from "./_helpers.ts";
import type { RequestSpec } from "./_helpers.ts";

async function main(): Promise<void> {
  const bursts = Number(process.env.TEST_API_TOTAL ?? "200");
  const concurrency = Number(process.env.TEST_API_CONCURRENCY ?? "12");
  const paths = [
    "/api/health",
    "/api/webhook?action=quote&symbol=AAPL&period=1d&interval=1d",
    "/api/webhook/capture?chart=candlestick&format=png&symbol=AAPL&period=1d&interval=1d&width=800&height=400&theme=dark&title=Burst",
  ];

  const specs: RequestSpec[] = [];
  for (let index = 0; index < bursts; index++) {
    const path = paths[index % paths.length];
    specs.push({
      id: index,
      label: `burst-${index % paths.length}`,
      method: "GET",
      path: `${path}${path.includes("?") ? "&" : "?"}burst=${index}`,
      userAgent: index % 2 === 0 ? "Mozilla/5.0" : "curl/8.7.1",
      fakeIp: fakeIpFor(index % 5),
    });
  }

  logger.step(`Burst Behavior: Testing ${specs.length} burst requests with concurrency ${concurrency}`);
  logger.info(`Target paths: ${paths.length}`);
  logger.info(`Unique IPs: 5`);

  const results = await runBatches(specs, concurrency);
  printSummary("Burst Behavior", results);

  const errors = results.filter((r) => r.status >= 500).length;
  if (errors > 0) {
    logger.warn(`Server errors: ${errors}`);
  }

  printFailures(results, 25);
  finishWithExit(results);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
