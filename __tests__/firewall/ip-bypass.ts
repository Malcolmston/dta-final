import { finishWithExit, printFailures, printSummary, runBatches, logger } from "./_helpers.ts";
import type { RequestSpec } from "./_helpers.ts";

async function main(): Promise<void> {
  const bypassIp = process.env.TEST_BYPASS_IP;
  if (!bypassIp) {
    logger.error("Set TEST_BYPASS_IP to your allowlisted IP before running this script.");
    process.exitCode = 1;
    return;
  }

  const controlIp = process.env.TEST_CONTROL_IP ?? "198.44.55.66";
  const path = "/api/webhook?action=quote&symbol=AAPL&period=1d&interval=1d";
  const specs: RequestSpec[] = [
    { id: 1, label: "bypass-ip", method: "GET", path, userAgent: "ChatGPT-User", fakeIp: bypassIp },
    { id: 2, label: "control-ip", method: "GET", path, userAgent: "ChatGPT-User", fakeIp: controlIp },
  ];

  logger.step(`IP Bypass: Testing bypass IP ${bypassIp} vs control ${controlIp}`);

  const results = await runBatches(specs, 1);
  printSummary("IP Bypass", results);

  const bypassSuccess = results.find((r) => r.label === "bypass-ip")?.status === 200;
  const controlBlocked = results.find((r) => r.label === "control-ip")?.status !== 200;

  if (bypassSuccess && controlBlocked) {
    logger.success("IP bypass working as expected (bypass allowed, control blocked)");
  } else {
    logger.warn("IP bypass behavior unexpected");
  }

  printFailures(results, 10);
  finishWithExit(results);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
