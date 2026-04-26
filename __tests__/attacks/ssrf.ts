import { finishWithExit, printFailures, printSummary, runBatches, logger, testUserAgents } from "../firewall/_helpers.ts";
import type { RequestSpec } from "../firewall/_helpers.ts";

const targetPath = "/api/webhook?action=quote";

async function main(): Promise<void> {
  const ssrfPayloads = [
    "http://localhost/",
    "http://127.0.0.1/",
    "http://0.0.0.0/",
    "http://[::1]/",
    "http://localhost:3000/",
    "http://127.0.0.1:443/",
    "http://metadata.google.internal/",
    "http://169.254.169.254/",
    "http://metadata.google.internal/computeMetadata/v1/",
    "http://example.com@127.0.0.1",
    "http://127.0.0.1#@example.com",
    "http://127.0.1.1/",
    "http://10.0.0.1/",
    "http://172.16.0.1/",
    "http://192.168.1.1/",
    "ftp://127.0.0.1/",
    "gopher://127.0.0.1/",
    "dict://127.0.0.1/",
    "sftp://127.0.0.1/",
    "http://0x7f000001/",
  ];

  const specs: RequestSpec[] = ssrfPayloads.map((payload, index) => ({
    id: index,
    label: `ssrf-${payload.substring(0, 20)}`,
    method: "GET",
    path: `${targetPath}&symbol=${encodeURIComponent("AAPL")}&period=${encodeURIComponent(payload)}`,
    userAgent: testUserAgents[index % testUserAgents.length],
    fakeIp: undefined,
  }));

  logger.step(`Testing ${specs.length} SSRF payloads`);
  const results = await runBatches(specs, 4);
  printSummary("SSRF Attacks", results);
  printFailures(results, 30);
  finishWithExit(results);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});