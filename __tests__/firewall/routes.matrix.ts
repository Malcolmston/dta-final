import {
  CRON_SECRET,
  BASE_URL,
  browserUserAgents,
  botUserAgents,
  fakeIpFor,
  finishWithExit,
  printFailures,
  printSummary,
  runBatches,
  logger,
} from "./_helpers.ts";
import type { RequestSpec } from "./_helpers.ts";

const symbols = ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA", "AMD"];
const periods = ["1d", "1mo", "3mo", "1y"];
const intervals = ["1d", "1wk"];
const webhookActions = ["history", "quote", "growth", "forecast"];
const chartNames = ["candlestick", "heatmap", "volume", "forecast"];
const formats = ["png", "jpg"];
const stockActions = ["quote", "history", "indicators", "tickers"];

function buildRoutes(id: number): Omit<RequestSpec, "id" | "userAgent" | "fakeIp">[] {
  const symbol = symbols[id % symbols.length];
  const period = periods[id % periods.length];
  const interval = intervals[id % intervals.length];
  const webhookAction = webhookActions[id % webhookActions.length];
  const chartName = chartNames[id % chartNames.length];
  const format = formats[id % formats.length];
  const stockAction = stockActions[id % stockActions.length];

  return [
    { label: "health", method: "GET", path: "/api/health" },
    { label: "history", method: "GET", path: `/api/stocks/history?symbol=${symbol}&period=${period}&interval=${interval}` },
    { label: "growth", method: "GET", path: `/api/stocks/growth?symbol=${symbol}` },
    { label: "signals", method: "GET", path: `/api/stocks/signals?ticker=${symbol}&period=6mo` },
    { label: "forecast", method: "GET", path: `/api/stocks/forecast?ticker=${symbol}&period=3mo` },
    { label: "momentum", method: "GET", path: `/api/stocks/momentum?ticker=${symbol}&period=3mo` },
    { label: "heatmap-get", method: "GET", path: `/api/heatmap?tickers=AAPL,MSFT,NVDA,${symbol}` },
    { label: "heatmap-post", method: "POST", path: "/api/heatmap", body: JSON.stringify({ tickers: `AAPL,MSFT,NVDA,${symbol}` }) },
    { label: "stocs-test", method: "GET", path: `/api/stocs-test?action=${stockAction}&symbol=${symbol}&period=${period}` },
    { label: "webhook", method: "GET", path: `/api/webhook?action=${webhookAction}&symbol=${symbol}&period=${period}&interval=${interval}&requestId=${id}` },
    { label: "webhook-capture", method: "GET", path: `/api/webhook/capture?chart=${chartName}&format=${format}&symbol=${symbol}&period=${period}&interval=${interval}&width=800&height=400&theme=dark&title=Firewall%20Test%20${id}&requestId=${id}` },
    { label: "queue-status", method: "GET", path: `/api/queue?type=history&symbol=${symbol}&period=3mo` },
    { label: "cron-pull", method: "GET", path: "/api/cron/pull", authHeader: CRON_SECRET ? `Bearer ${CRON_SECRET}` : undefined },
    { label: "cron-storage", method: "GET", path: "/api/cron/storage", authHeader: CRON_SECRET ? `Bearer ${CRON_SECRET}` : undefined },
    { label: "cron-lookup", method: "GET", path: "/api/cron/lookup", authHeader: CRON_SECRET ? `Bearer ${CRON_SECRET}` : undefined },
  ];
}

async function main(): Promise<void> {
  const userAgents = [...browserUserAgents, ...botUserAgents];
  const specs: RequestSpec[] = [];
  let id = 0;
  for (const userAgent of userAgents) {
    const routes = buildRoutes(id);
    for (let idx = 0; idx < routes.length; idx++) {
      const route = buildRoutes(id)[idx];
      specs.push({ id, userAgent, fakeIp: fakeIpFor(id), ...route });
      id++;
    }
  }

  logger.step(`Routes Matrix: Testing ${specs.length} route/user-agent combinations against ${BASE_URL}`);
  logger.info(`Browsers: ${browserUserAgents.length}, Bots: ${botUserAgents.length}, Routes: 15`);
  logger.info(`Symbols: ${symbols.join(", ")}`);

  const results = await runBatches(specs);
  printSummary("Routes Matrix", results);
  printFailures(results);
  finishWithExit(results);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
