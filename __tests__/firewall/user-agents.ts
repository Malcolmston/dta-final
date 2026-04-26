import {
  botUserAgents,
  browserUserAgents,
  fakeIpFor,
  finishWithExit,
  printFailures,
  printSummary,
  runBatches,
  summarizeBy,
  logger,
} from "./_helpers.ts";
import type { RequestSpec } from "./_helpers.ts";

async function main(): Promise<void> {
  const targetPath = "/api/webhook?action=quote&symbol=AAPL&period=1d&interval=1d";
  const specs: RequestSpec[] = [...browserUserAgents, ...botUserAgents].map((userAgent, index) => ({
    id: index,
    label: "webhook-ua",
    method: "GET",
    path: targetPath,
    userAgent,
    fakeIp: fakeIpFor(index),
  }));

  logger.step(`User Agent Matrix: Testing ${specs.length} user agents`);
  logger.info(`Browsers: ${browserUserAgents.length}, Bots: ${botUserAgents.length}`);

  const results = await runBatches(specs, 4);
  printSummary("User Agent Matrix", results);

  console.log("\nPer-UA status:");
  for (const [key, count] of summarizeBy(results, (item) => `${item.userAgent} -> ${item.status}`).entries()) {
    console.log(`  ${key}: ${count}`);
  }
  printFailures(results, 25);
  finishWithExit(results);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
