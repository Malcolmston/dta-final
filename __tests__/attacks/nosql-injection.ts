import { finishWithExit, printFailures, printSummary, runBatches, logger, testUserAgents } from "../firewall/_helpers.ts";
import type { RequestSpec } from "../firewall/_helpers.ts";

const targetPath = "/api/webhook?action=quote";

async function main(): Promise<void> {
  const nosqlPayloads = [
    '{"$gt": ""}',
    '{"$ne": ""}',
    '{"$where": "this.password.length > 0"}',
    '{"$regex": ".*"}',
    '{"$gt": 0}',
    '{"$exists": true}',
    '{"$type": "string"}',
    'username[$ne]=admin',
    'username[$regex]=.*',
    'login[$(where)]=1',
    '{"$or": [{"a": "a"}, {"b": "b"}]}',
    '{"$and": [{"a": "a"}, {"b": "b"}]}',
    '{"$nor": [{"a": "a"}]}',
    '{"$all": ["a"]}',
    '{"$in": ["admin", "root"]}',
    'password[$regex]=^.*$',
    'password[$options]=i',
    '{"$expr": {"$gte": ["$a", "$b"]}}',
    'username[$ne]=&password[$ne]=',
    'filter[username][$regex]=^ad',
  ];

  const specs: RequestSpec[] = nosqlPayloads.map((payload, index) => ({
    id: index,
    label: `nosql-${payload.substring(0, 15)}`,
    method: "GET",
    path: `${targetPath}&symbol=${encodeURIComponent("AAPL")}&period=${encodeURIComponent(payload)}`,
    userAgent: testUserAgents[index % testUserAgents.length],
    fakeIp: undefined,
  }));

  logger.step(`Testing ${specs.length} NoSQL injection payloads`);
  const results = await runBatches(specs, 4);
  printSummary("NoSQL Injection Attacks", results);
  printFailures(results, 30);
  finishWithExit(results);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});