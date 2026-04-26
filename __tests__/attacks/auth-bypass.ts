import { finishWithExit, printFailures, printSummary, runBatches, logger } from "../firewall/_helpers.ts";
import type { RequestSpec } from "../firewall/_helpers.ts";

const targetPath = "/api/cron/pull";

async function main(): Promise<void> {
  const authBypassHeaders = [
    { name: "Authorization", value: "Bearer invalid-token" },
    { name: "Authorization", value: "Bearer admin" },
    { name: "Authorization", value: "Bearer null" },
    { name: "Authorization", value: "" },
    { name: "X-Admin", value: "true" },
    { name: "X-User-Role", value: "admin" },
    { name: "X-User-Role", value: "root" },
    { name: "X-Auth-Token", value: "undefined" },
    { name: "X-Auth-Token", value: "null" },
    { name: "Cookie", value: "admin=true" },
    { name: "Cookie", value: "role=admin" },
    { name: "Cookie", value: "auth=1" },
    { name: "X-API-Key", value: "test" },
    { name: "X-API-Key", value: "admin" },
    { name: "X-API-Key", value: "" },
  ];

  const userAgents = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/135.0.0.0 Safari/537.36",
    "curl/8.7.1",
    "Python-urllib/3.11",
    "Go-http-client/1.1",
  ];

  const specs: RequestSpec[] = authBypassHeaders.map((header, index) => ({
    id: index,
    label: `auth-${header.name.toLowerCase()}-${header.value.substring(0, 10)}`,
    method: "GET",
    path: targetPath,
    userAgent: userAgents[index % userAgents.length],
    fakeIp: undefined,
    headers: { [header.name]: header.value },
  }));

  logger.step(`Testing ${specs.length} authentication bypass attempts`);
  const results = await runBatches(specs, 4);
  printSummary("Authentication Bypass Attempts", results);
  printFailures(results, 30);
  finishWithExit(results);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});