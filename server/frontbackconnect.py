# Za spajanje React fronta i Python backa
# Ne radi bas

import asyncio
from websockets.server import serve

async def echo(websocket):
    async for message in websocket:
        await websocket.send(message)
        await websocket.send("Message received")


async def main():
    async with serve(echo, "localhost", 8765):
        await asyncio.Future()

asyncio.run(main())