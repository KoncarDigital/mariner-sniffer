from connect_to_hat import MarinerClient
from quart import Quart, jsonify, request, websocket
from quart_cors import cors
import json, ast
import asyncio
import socket

app = Quart(__name__)
cors(app)
queue = asyncio.Queue(maxsize=10)

# Message sent to HAT server to initiate connection
init_json = {}
# Data obtained from a frontend form on the /connect route
form_data = {}
# Indicates whether data is currently streaming from the HAT server
streaming_from_hat = ""

@app.route('/', methods=['POST'])
async def receive_init_message_data_from_frontend():
    """Transform form_data to proper init message format"""
    global form_data
    global init_json
    form_data = await request.json

    init_json["type"] = 'init'
    init_json["client_id"] = form_data['client_id']
    init_json["client_token"] = form_data['client_token']

    if len(form_data['last_event_id']) == 0:
        if form_data['selected_option'] == 'Current events':
            init_json["last_event_id"] = None
        elif form_data['selected_option'] == 'All-time events':
            init_json["last_event_id"] = {"server": 1, "session": 0,
                                          "instance": 0}
    else:
        server, session, instance = form_data['last_event_id'].split(',')
        init_json["last_event_id"] = {"server": server, "session": session,
                                      "instance": instance}

    init_json["subscriptions"] = []
    if form_data['customFields'][0] != "":
        for subscription in form_data['customFields']:
            subscription_as_list = ast.literal_eval(subscription)
            init_json["subscriptions"].append(subscription_as_list)
    if form_data['selected_subscription'] != None:
        for subscription in form_data['selected_subscription']:
            subscription_as_list = ast.literal_eval(subscription['label'])
            init_json["subscriptions"].append(subscription_as_list)
    if form_data['customFields'][0] == "" and form_data['selected_subscription'] == None:
            init_json["subscriptions"].append(['*'])
    return jsonify({"message":"Data for init message received successfully"})

@app.route('/start', methods=['POST'])
async def start_streaming():
    try:
        global streaming_from_hat
        data = await request.json
        streaming_from_hat = data['action']
        return 'Streaming started successfully', 200
    except Exception as e:
        return str(e), 400

@app.route('/stop', methods=['POST'])
async def stop_streaming():
    try:
        global streaming_from_hat
        data = await request.json
        streaming_from_hat = data['action']
        return 'Streaming stopped successfully', 200
    except Exception as e:
        return str(e), 400

async def put():
    """Connect to server and put message to the queue"""
    global streaming_from_hat
    global form_data
    global init_json
    client_socket = None

    try:
        while True:
            if streaming_from_hat == 'start':
                if client_socket is None:
                    client_socket = socket.socket(socket.AF_INET,
                                                  socket.SOCK_STREAM)
                    client = MarinerClient(form_data["server_ip"],
                                           form_data["server_port"],
                                           init_json["client_id"], 
                                           init_json["client_token"], 
                                           init_json["subscriptions"], 
                                           client_socket, 
                                           init_json["last_event_id"])
                    await client.connect(init_json)
                message = await client.message()
                if message:
                    for event in message:
                        await queue.put(json.dumps(event))
                        print("Item added to queue")
            else:
                if client_socket is not None:
                    client_socket.close()
                    client_socket = None
                await asyncio.sleep(1)

    except Exception as e:
        print("Exception:", e)
        await queue.put(json.dumps("Socket timed out."))
        if client_socket is not None:
            client_socket.close()

async def get():
    """Get message from the queue and send it to frontend using websocket"""
    while True:
        event = await queue.get()
        await websocket.send(event)
        print("Item yielded")

async def main():
    """Create two separate threads to put and get from a queue simultaneously"""
    producer_task = asyncio.create_task(put())
    consumer_task = asyncio.create_task(get())

    await asyncio.gather(producer_task, consumer_task)

    await queue.put(None)

@app.websocket('/currenttraffic')
async def stream_hat_data_to_frontend():
    return await main()

if __name__ == '__main__':
    app.run()