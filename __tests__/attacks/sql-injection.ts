import { finishWithExit, printFailures, printSummary, runBatches, logger, testUserAgents } from "../firewall/_helpers.ts";
import type { RequestSpec } from "../firewall/_helpers.ts";

const targetPath = "/api/webhook?action=quote";

async function main(): Promise<void> {
  const sqlPayloads = [
    "AAPL' OR '1'='1",
    "AAPL' UNION SELECT NULL--",
    "AAPL'; DROP TABLE stocks;--",
    "AAPL' AND 1=1--",
    "AAPL' AND 1=2--",
    "AAPL'; SELECT * FROM users--",
    "AAPL' OR ''=''",
    "AAPL' HAVING 1=1--",
    "AAPL' ORDER BY 1--",
    "AAPL'; WAITFOR DELAY '00:00:05'--",
    "AAPL' AND SLEEP(5)--",
    "AAPL' AND BENCHMARK(5000000,MD5('A'))--",
    "${555555*666666}",
    "AAPL'/**/OR/**/'1'='1",
    "AAPL' OR 1=1--",
  ];

  const specs: RequestSpec[] = sqlPayloads.map((payload, index) => ({
    id: index,
    label: `sql-${payload.substring(0, 20)}`,
    method: "GET",
    path: `${targetPath}&symbol=${encodeURIComponent(payload)}&period=1d&interval=1d`,
    userAgent: testUserAgents[index % testUserAgents.length],
    fakeIp: undefined,
  }));

  logger.step(`Testing ${specs.length} SQL injection payloads`);
  const results = await runBatches(specs, 4);
  printSummary("SQL Injection Attacks", results);
  printFailures(results, 30);
  finishWithExit(results);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});