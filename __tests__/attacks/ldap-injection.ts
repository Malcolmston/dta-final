import { finishWithExit, printFailures, printSummary, runBatches, logger, testUserAgents } from "../firewall/_helpers.ts";
import type { RequestSpec } from "../firewall/_helpers.ts";

const targetPath = "/api/webhook?action=quote";

async function main(): Promise<void> {
  const ldapPayloads = [
    "AAPL)(uid=*",
    "AAPL)(objectClass=*",
    "AAPL)(cn=*",
    "AAPL)(mail=*",
    "AAPL)(&(objectClass=*)",
    "AAPL)(|(objectClass=*)",
    "AAPL)(!(&(objectClass=*))",
    "AAPL)(username=*)(password=*)",
    "AAPL)(userPassword={MD5}*",
    "AAPL)(samAccountName=*)",
    "AAPL)(memberOf=*)",
    "AAPL)(proxyAddress=*)",
    "admin)(&(password=*",
    "*)(uid=*))(|(uid=*",
    "AAPL)(description=*",
  ];

  const specs: RequestSpec[] = ldapPayloads.map((payload, index) => ({
    id: index,
    label: `ldap-${payload.substring(0, 15)}`,
    method: "GET",
    path: `${targetPath}&symbol=${encodeURIComponent(payload)}&period=1d`,
    userAgent: testUserAgents[index % testUserAgents.length],
    fakeIp: undefined,
  }));

  logger.step(`Testing ${specs.length} LDAP injection payloads`);
  const results = await runBatches(specs, 4);
  printSummary("LDAP Injection Attacks", results);
  printFailures(results, 25);
  finishWithExit(results);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});