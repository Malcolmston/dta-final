import {
  finishWithExit,
  printFailures,
  printSummary,
  runBatches,
  regionIps,
  logger,
} from "./_helpers.ts";
import type { RequestSpec } from "./_helpers.ts";

const targetPath = "/api/webhook?action=quote&symbol=AAPL&period=1d&interval=1d";

async function main(): Promise<void> {
  const specs: RequestSpec[] = [];
  let id = 0;

  const userAgents = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/135.0.0.0 Safari/537.36",
    "curl/8.7.1",
    "ChatGPT-User",
    "Python-urllib/3.11",
  ];

  logger.step(`Geo Impersonation: Testing ${Object.keys(regionIps).length} regions with ${userAgents.length} user agents`);

  for (const [region, ip] of Object.entries(regionIps)) {
    for (const ua of userAgents) {
      specs.push({
        id: id++,
        label: `geo-${region}`,
        method: "GET",
        path: targetPath,
        userAgent: ua,
        fakeIp: ip,
      });
    }
    logger.debug(`Region ${region} (${ip}): ${userAgents.length} requests queued`);
  }

  logger.info(`Total requests: ${specs.length}`);

  const results = await runBatches(specs, 6);

  const regionStats: Record<string, { total: number; success: number }> = {};
  for (const r of results) {
    const region = r.label.replace("geo-", "");
    if (!regionStats[region]) {
      regionStats[region] = { total: 0, success: 0 };
    }
    regionStats[region].total++;
    if (r.status >= 200 && r.status < 400) {
      regionStats[region].success++;
    }
  }

  console.log("\nPer-region breakdown:");
  for (const [region, stats] of Object.entries(regionStats)) {
    const rate = Math.round((stats.success / stats.total) * 100);
    console.log(`  ${region}: ${stats.success}/${stats.total} (${rate}%)`);
  }

  printSummary("Geo-Location Impersonation", results);
  printFailures(results, 25);
  finishWithExit(results);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});