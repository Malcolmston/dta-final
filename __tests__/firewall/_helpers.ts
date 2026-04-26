import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export const BASE_URL = process.env.TEST_API_BASE_URL ?? "https://stock-henna-six.vercel.app";
export const CRON_SECRET = process.env.CRON_SECRET ?? "";
export const MAX_TIME_SECONDS = Number(process.env.TEST_API_MAX_TIME ?? "12");
export const DEFAULT_CONCURRENCY = Number(process.env.TEST_API_CONCURRENCY ?? "6");
export const VERBOSE = process.env.TEST_API_VERBOSE === "1";
export const PARALLEL = process.env.TEST_API_PARALLEL !== "0";

const reset = "\x1b[0m";
const bold = "\x1b[1m";
const dim = "\x1b[2m";
const red = "\x1b[31m";
const green = "\x1b[32m";
const yellow = "\x1b[33m";
const cyan = "\x1b[36m";
const magenta = "\x1b[35m";

function timestamp(): string {
  return `${dim}${new Date().toISOString()}${reset}`;
}

function log(color: string, prefix: string, ...args: unknown[]): void {
  console.log(`${timestamp()} ${color}${bold}${prefix}${reset}`, ...args);
}

export const logger = {
  info: (...args: unknown[]) => log(cyan, "INF", ...args),
  warn: (...args: unknown[]) => log(yellow, "WRN", ...args),
  error: (...args: unknown[]) => log(red, "ERR", ...args),
  success: (...args: unknown[]) => log(green, "OK ", ...args),
  step: (...args: unknown[]) => log(magenta, ">>>", ...args),
  result: (...args: unknown[]) => log(green, "<<<", ...args),
  debug: VERBOSE ? (...args: unknown[]) => log(dim, "DBG", ...args) : () => {},
};

export type RequestSpec = {
  id: number;
  label: string;
  method: "GET" | "POST";
  path: string;
  userAgent: string;
  fakeIp?: string;
  authHeader?: string;
  body?: string;
  headers?: Record<string, string>;
};

export type RequestResult = {
  id: number;
  label: string;
  method: string;
  path: string;
  userAgent: string;
  fakeIp?: string;
  status: number;
  durationMs: number;
  stderr: string;
};

export const browserUserAgents = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Mobile/15E148 Safari/604.1",
];

export const testUserAgents = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/135.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0",
  "curl/8.7.1",
  "ChatGPT-User",
];

export const botUserAgents = [
  "curl/8.7.1",
  "Wget/1.24.5",
  "ChatGPT-User",
  "OpenAI-User-Agent",
  "GPTBot/1.0",
  "OAI-SearchBot/1.0",
  "ClaudeBot/1.0",
  "Claude-User/1.0",
  "Anthropic-AI/1.0",
  "Grok/1.0",
  "xAI-Bot/1.0",
  "PerplexityBot/1.0",
  "Bytespider/1.0",
  "Google-Extended",
  "vercel-cron/1.0",
];

export function fakeIpFor(id) {
  const octet2 = (Math.floor(id / 250) % 250) + 1;
  const octet3 = (id % 250) + 1;
  return `198.${octet2}.${octet3}.10`;
}

export const ipBypassHeaders = [
  { name: "X-Forwarded-For", generator: (ip) => ip },
  { name: "X-Real-IP", generator: (ip) => ip },
  { name: "X-Originating-IP", generator: (ip) => ip },
  { name: "X-Client-IP", generator: (ip) => ip },
  { name: "X-Forwarded", generator: () => "for=192.168.1.1, for=198.51.100.1" },
  { name: "Forwarded", generator: () => "for=198.51.100.1;by=example.com;host=target" },
  { name: "True-Client-IP", generator: (ip) => ip },
  { name: "CF-Connecting-IP", generator: (ip) => ip },
  { name: "X-Cluster-Client-IP", generator: (ip) => ip },
];

export const regionIps = {
  "us-east": "3.0.0.1",
  "us-west": "52.0.0.1",
  "eu-west": "63.0.0.1",
  "ap-south": "23.0.0.1",
  "sa-east": "18.0.0.1",
  "ca-central": "52.0.0.1",
  "ap-northeast": "13.0.0.1",
  "eu-central": "52.0.0.1",
};

export function generateTestIps(count) {
  const ips = [];
  for (let i = 0; i < count; i++) {
    const octet2 = (Math.floor(i / 250) % 250) + 1;
    const octet3 = (i % 250) + 1;
    ips.push(`198.${octet2}.${octet3}.${(i % 254) + 1}`);
  }
  return ips;
}

export async function runCurl(spec: RequestSpec): Promise<RequestResult> {
  const url = `${BASE_URL}${spec.path}`;
  const startedAt = Date.now();
  const args = [
    "-sS",
    "--max-time",
    String(MAX_TIME_SECONDS),
    "--connect-timeout",
    "5",
    "-o",
    "/dev/null",
    "-w",
    "%{http_code}",
    "-X",
    spec.method,
    "-A",
    spec.userAgent,
    "-H",
    "Accept: application/json,text/html;q=0.9,*/*;q=0.8",
  ];

  if (spec.fakeIp) {
    args.push("-H", `X-Forwarded-For: ${spec.fakeIp}`);
  }

  if (spec.authHeader) {
    args.push("-H", `Authorization: ${spec.authHeader}`);
  }

  for (const [key, value] of Object.entries(spec.headers ?? {})) {
    args.push("-H", `${key}: ${value}`);
  }

  if (spec.body) {
    args.push("-H", "Content-Type: application/json", "--data", spec.body);
  }

  args.push(url);

  try {
    const { stdout, stderr } = await execFileAsync("curl", args);
    const status = Number.parseInt(String(stdout).trim(), 10);
    const result = {
      id: spec.id,
      label: spec.label,
      method: spec.method,
      path: spec.path,
      userAgent: spec.userAgent,
      fakeIp: spec.fakeIp,
      status: Number.isNaN(status) ? 0 : status,
      durationMs: Date.now() - startedAt,
      stderr: String(stderr).trim(),
    };
    logger.debug(`Req #${spec.id}: ${spec.method} ${spec.path} -> ${result.status} (${result.durationMs}ms)`);
    return result;
  } catch (error) {
    const stderr = error instanceof Error ? error.message : String(error);
    logger.debug(`Req #${spec.id}: ${spec.method} ${spec.path} -> ERR (${Date.now() - startedAt}ms): ${stderr}`);
    return {
      id: spec.id,
      label: spec.label,
      method: spec.method,
      path: spec.path,
      userAgent: spec.userAgent,
      fakeIp: spec.fakeIp,
      status: 0,
      durationMs: Date.now() - startedAt,
      stderr,
    };
  }
}

export async function runBatches(specs: RequestSpec[], concurrency = DEFAULT_CONCURRENCY, parallel = PARALLEL): Promise<RequestResult[]> {
  if (parallel && specs.length > concurrency) {
    return runBatchesParallel(specs, concurrency);
  }

  const results: RequestResult[] = [];
  const totalBatches = Math.ceil(specs.length / concurrency);
  let batchNum = 0;

  logger.step(`Starting ${specs.length} requests (concurrency: ${concurrency}, batch size: ${concurrency})`);

  for (let start = 0; start < specs.length; start += concurrency) {
    const end = Math.min(start + concurrency, specs.length);
    batchNum++;
    const batchStart = Date.now();

    const batch = await Promise.all(specs.slice(start, end).map((spec) => runCurl(spec)));
    results.push(...batch);

    const batchDuration = Date.now() - batchStart;
    const statusSummary = Object.fromEntries(summarizeBy(batch, (item) => item.status));
    const successCount = batch.filter((r) => r.status >= 200 && r.status < 400).length;
    const failCount = batch.length - successCount;

    if (end % 50 === 0 || end === specs.length) {
      logger.info(`Progress: ${end}/${specs.length} (${Math.round((end / specs.length) * 100)}%) | Batch #${batchNum}/${totalBatches} | ${batchDuration}ms | Success: ${successCount}, Failed: ${failCount} | ${JSON.stringify(statusSummary)}`);
    } else if (VERBOSE) {
      logger.debug(`Batch #${batchNum}: ${end}/${specs.length} | ${JSON.stringify(statusSummary)}`);
    }
  }

  logger.success(`Completed all ${specs.length} requests`);
  return results;
}

async function runBatchesParallel(specs: RequestSpec[], concurrency: number): Promise<RequestResult[]> {
  const workerCount = Math.min(Math.floor(concurrency / 2) + 1, 8);
  const chunkSize = Math.ceil(specs.length / workerCount);

  logger.step(`Running parallel: ${specs.length} requests with ${workerCount} workers`);

  const workerPromises = [];
  for (let i = 0; i < workerCount; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, specs.length);
    const chunk = specs.slice(start, end);
    if (chunk.length > 0) {
      workerPromises.push(runBatchChunk(chunk, i));
    }
  }

  const results = await Promise.all(workerPromises);
  const flatResults = results.flat();

  const statusSummary = Object.fromEntries(summarizeBy(flatResults, (item) => item.status));
  const successCount = flatResults.filter((r) => r.status >= 200 && r.status < 400).length;

  logger.success(`Parallel complete: ${flatResults.length} requests | Success: ${successCount}, Failed: ${flatResults.length - successCount} | ${JSON.stringify(statusSummary)}`);

  return flatResults;
}

async function runBatchChunk(specs: RequestSpec[], workerId: number): Promise<RequestResult[]> {
  const batchSize = 6;
  const results: RequestResult[] = [];

  for (let i = 0; i < specs.length; i += batchSize) {
    const chunk = specs.slice(i, i + batchSize);
    const batchResults = await Promise.all(chunk.map((spec) => runCurl(spec)));
    results.push(...batchResults);

    if (VERBOSE) {
      logger.debug(`Worker ${workerId}: ${results.length}/${specs.length}`);
    }
  }

  return results;
}

export function summarizeBy<T extends string | number>(items: RequestResult[], keyFn: (result: RequestResult) => T): Map<T, number> {
  const map = new Map<T, number>();
  for (const item of items) {
    const key = keyFn(item);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}

export function printSummary(title: string, results: RequestResult[]): void {
  const durations = results.map((r) => r.durationMs).sort((a, b) => a - b);
  const avgMs = Math.round(durations.reduce((sum, d) => sum + d, 0) / Math.max(durations.length, 1));
  const p50 = durations[Math.floor(durations.length * 0.5)] ?? 0;
  const p90 = durations[Math.floor(durations.length * 0.9)] ?? 0;
  const p99 = durations[Math.floor(durations.length * 0.99)] ?? 0;
  const minMs = durations[0] ?? 0;
  const maxMs = durations[durations.length - 1] ?? 0;

  const statusCounts = summarizeBy(results, (item) => item.status);
  const successCount = results.filter((r) => r.status >= 200 && r.status < 400).length;
  const failCount = results.length - successCount;
  const successRate = Math.round((successCount / results.length) * 100);

  console.log(`\n${bold}${cyan}=== ${title} ===${reset}`);
  console.log(`${dim}Base URL:${reset} ${BASE_URL}`);
  console.log(`${dim}Requests:${reset} ${results.length} ${dim}(Success: ${green}${successCount}${reset}, ${red}Failed: ${failCount}${reset}, Rate: ${successRate === 100 ? green : successRate >= 80 ? yellow : red}${successRate}%${reset})`);
  console.log(`${dim}Timing:${reset} avg=${avgMs}ms, min=${minMs}ms, max=${maxMs}ms, p50=${p50}ms, p90=${p90}ms, p99=${p99}ms`);
  console.log(`${dim}Timeout:${reset} ${MAX_TIME_SECONDS}s`);
  console.log(`${dim}Status counts:${reset}`);
  for (const [key, count] of [...statusCounts.entries()].sort((a, b) => Number(a[0]) - Number(b[0]))) {
    const statusNum = Number(key);
    const color = statusNum >= 200 && statusNum < 300 ? green : statusNum >= 300 && statusNum < 400 ? yellow : red;
    console.log(`  ${color}${key}${reset}: ${count}`);
  }
}

export function printFailures(results: RequestResult[], limit = 15): void {
  const failures = results.filter((item) => item.status < 200 || item.status >= 400);
  if (failures.length === 0) {
    logger.success("No failures detected");
    return;
  }

  console.log(`\n${red}${bold}=== Failure Report (${failures.length} of ${results.length}) ===${reset}`);
  for (const item of failures.slice(0, limit)) {
    const statusColor = item.status === 0 ? red : item.status < 500 ? yellow : red;
    console.log(`  ${statusColor}[${item.status}]${reset} #${item.id} ${item.label} ${dim}${item.method}${reset} ${item.path}`);
    console.log(`    ${dim}UA:${reset} ${item.userAgent.substring(0, 60)}${item.userAgent.length > 60 ? "..." : ""}`);
    if (item.fakeIp) console.log(`    ${dim}XFF:${reset} ${item.fakeIp}`);
    if (item.stderr) console.log(`    ${dim}ERR:${reset} ${item.stderr.substring(0, 100)}${item.stderr.length > 100 ? "..." : ""}`);
    console.log(`    ${dim}Time:${reset} ${item.durationMs}ms`);
  }
  if (failures.length > limit) {
    console.log(`  ${dim}... and ${failures.length - limit} more${reset}`);
  }
}

export function finishWithExit(results: RequestResult[]): void {
  if (results.some((item) => item.status < 200 || item.status >= 400)) {
    process.exitCode = 1;
  }
}
