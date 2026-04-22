import asyncio
import json
import websockets
import yfinance as yf

async def handle(websocket):
    async for message in websocket:
        try:
            params = json.loads(message)  # replaces argparse
            ticker = params.get("ticker", "AAPL")
            period = params.get("period", "1mo")
            interval = params.get("interval", "1d")

            data = yf.download(ticker, period=period, interval=interval)

            # Convert DataFrame to JSON-serializable format
            result = data.reset_index().to_dict(orient="records")

            # Convert Timestamps to strings
            for row in result:
                for k, v in row.items():
                    if hasattr(v, "isoformat"):
                        row[k] = v.isoformat()

            await websocket.send(json.dumps({"status": "ok", "data": result}))

        except Exception as e:
            await websocket.send(json.dumps({"status": "error", "message": str(e)}))

async def main():
    async with websockets.serve(handle, "localhost", 8765):
        print("WS server running on ws://localhost:8765")
        await asyncio.Future()  # run forever

asyncio.run(main())