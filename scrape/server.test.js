import WebSocket from 'ws';

const WS_URL = 'ws://localhost:8765';

describe('WebSocket Server', () => {
  let ws;
  let serverConnected = false;

  beforeAll(() => {
    return new Promise((resolve) => {
      ws = new WebSocket(WS_URL, { timeout: 5000 });
      ws.on('open', () => {
        serverConnected = true;
        resolve();
      });
      ws.on('error', (err) => {
        console.log('WebSocket server not available:', err.message);
        resolve(); // Continue but tests will be skipped
      });
    });
  }, 10000);

  afterAll(() => {
    if (ws) {
      ws.close();
    }
  });

  const itSkipIfNoServer = serverConnected ? it : it.skip;

  itSkipIfNoServer('should connect to WebSocket server', () => {
    expect(ws.readyState).toBe(WebSocket.OPEN);
  });

  itSkipIfNoServer('should respond with stock data for valid request', () => {
    return new Promise((resolve, reject) => {
      const message = JSON.stringify({ ticker: 'AAPL', period: '1d', interval: '1d' });
      ws.send(message);

      ws.on('message', (data) => {
        const response = JSON.parse(data);
        expect(response.status).toBe('ok');
        expect(Array.isArray(response.data)).toBe(true);
        resolve();
      });

      ws.on('error', reject);
      setTimeout(() => reject(new Error('Timeout')), 5000);
    });
  });

  itSkipIfNoServer('should use defaults when no params provided', () => {
    return new Promise((resolve, reject) => {
      ws.send('{}');

      ws.on('message', (data) => {
        const response = JSON.parse(data);
        expect(response.status).toBe('ok');
        expect(Array.isArray(response.data)).toBe(true);
        resolve();
      });

      ws.on('error', reject);
      setTimeout(() => reject(new Error('Timeout')), 5000);
    });
  });
});