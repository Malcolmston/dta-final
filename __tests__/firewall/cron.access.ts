import { CRON_SECRET, fakeIpFor, finishWithExit, printFailures, printSummary, runBatches, logger } from "./_helpers.ts";
import type { RequestSpec } from "./_helpers.ts";

async function main(): Promise<void> {
  const cronPaths = ["/api/cron/pull", "/api/cron/storage", "/api/cron/lookup"];
  const uas = ["vercel-cron/1.0", "ChatGPT-User", "Mozilla/5.0", "curl/8.7.1"];
  const specs: RequestSpec[] = [];
  let id = 0;

  for (const path of cronPaths) {
    for (const userAgent of uas) {
      specs.push({
        id: id++,
        label: `cron-${path.split("/").pop()}`,
        method: "GET",
        path,
        userAgent,
        fakeIp: fakeIpFor(id),
      });
      if (CRON_SECRET) {
        specs.push({
          id: id++,
          label: `cron-auth-${path.split("/").pop()}`,
          method: "GET",
          path,
          userAgent,
          fakeIp: fakeIpFor(id),
          authHeader: `Bearer ${CRON_SECRET}`,
        });
      }
    }
  }

  logger.step(`Cron Access: Testing ${specs.length} cron endpoint variations`);
  logger.info(`Paths: ${cronPaths.join(", ")}`);
  logger.info(`User Agents: ${uas.join(", ")}`);
  logger.info(`Auth configured: ${CRON_SECRET ? "YES" : "NO"}`);

  const results = await runBatches(specs, 3);
  printSummary("Cron Access", results);

  const authFailures = results.filter((r) => r.status === 401 || r.status === 403).length;
  if (authFailures > 0) {
    logger.info(`Auth blocked: ${authFailures} requests (expected behavior)`);
  }

  printFailures(results, 25);
  finishWithExit(results);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
