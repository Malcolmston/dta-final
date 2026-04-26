import {
  fakeIpFor,
  finishWithExit,
  ipBypassHeaders,
  printFailures,
  printSummary,
  runBatches,
  logger,
} from "./_helpers.ts";
import type { RequestSpec } from "./_helpers.ts";

const targetPath = "/api/webhook?action=quote&symbol=AAPL&period=1d&interval=1d";

async function main(): Promise<void> {
  const testIps = [
    "198.51.100.1",
    "10.0.0.1",
    "172.16.0.1",
    "192.168.1.1",
    "127.0.0.1",
    "0.0.0.0",
    "8.8.8.8",
    "1.1.1.1",
  ];

  const specs: RequestSpec[] = [];

  for (let i = 0; i < testIps.length; i++) {
    const ip = testIps[i];
    specs.push({
      id: i,
      label: `ip-direct-${ip}`,
      method: "GET",
      path: targetPath,
      userAgent: "curl/8.7.1",
      fakeIp: ip,
    });

    for (const header of ipBypassHeaders) {
      const headerValue = header.generator(ip);
      specs.push({
        id: specs.length,
        label: `ip-${header.name.toLowerCase()}-${ip}`,
        method: "GET",
        path: targetPath,
        userAgent: "curl/8.7.1",
        fakeIp: ip,
        headers: { [header.name]: headerValue },
      });
    }
  }

  logger.step(`Testing ${specs.length} IP spoofing variations`);
  const results = await runBatches(specs, 8);
  printSummary("IP Spoofing Bypass", results);
  printFailures(results, 30);
  finishWithExit(results);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});