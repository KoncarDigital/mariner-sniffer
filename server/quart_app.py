from quart import Quart, jsonify, request, websocket
from quart_cors import cors
import json, ast
from connect_to_hat import MarinerClient
import asyncio
import socket
import time

app = Quart(__name__)
# Configure CORS to allow requests from the frontend origin with credentials
cors(app)

# Message sent to HAT server to initiate connection
init_json = {}

# Data gotten from a frontend form on /connect route
form_data = {}

# Initially, data is streaming on /currenttraffic route
# It changes to False when user clicks 'Stop'
streaming_from_hat = True

queue = asyncio.Queue(maxsize=10)

@app.route('/', methods=['POST'])
async def receive_init_message_data_from_frontend():
    global init_json
    global form_data
    form_data = await request.json

    init_json["type"] = 'init'
    init_json["client_id"] = form_data['client_id']
    init_json["client_token"] = form_data['client_token']

    if len(form_data['last_event_id']) == 0:
        if form_data['selected_option'] == 'Current events':
            init_json["last_event_id"] = None
        elif form_data['selected_option'] == 'All-time events':
            init_json["last_event_id"] = {"server": 1, "session": 0, "instance": 0}
    else:
        server, session, instance = form_data['last_event_id'].split(',')
        init_json["last_event_id"] = { "server": server, "session": session, "instance": instance}

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

@app.route('/streaming', methods=['POST'])
def start_or_stop_streaming():
    global streaming_from_hat
    streaming_from_hat = not streaming_from_hat
    return jsonify({'isStreaming': streaming_from_hat})

async def put():
    global streaming_from_hat
    client_socket = None

    try:
        while True:
            if streaming_from_hat:
                if client_socket is None:
                    # Initialize the client and socket only if streaming_from_hat is True
                    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                    client = MarinerClient(form_data["server_ip"], form_data["server_port"], init_json["client_id"], init_json["client_token"], init_json["subscriptions"], client_socket, init_json["last_event_id"])

                    connection_result = await client.connect(init_json)
                    if connection_result == "Socket timed out.":
                        raise Exception("Socket timed out.")

                message = await client.message()
                if not message:
                    continue
                for event in message:
                    await queue.put(json.dumps(event))
                    print("Item added to queue")
            else:
                # Close the socket and set it to None when not streaming
                if client_socket is not None:
                    client_socket.close()
                    client_socket = None
                await asyncio.sleep(1)  # Sleep to reduce CPU usage

    except Exception as e:
        print(e)
        await queue.put(json.dumps("Socket timed out."))
        if client_socket is not None:
            client_socket.close()

async def get():
    while True:
        event = await queue.get()
        await websocket.send(event)
        print("Item yielded")

async def connect():
    producer_task = asyncio.create_task(put())
    consumer_task = asyncio.create_task(get())

    await asyncio.gather(producer_task, asyncio.sleep(3), consumer_task)

    await queue.put(None)

@app.websocket('/currenttraffic')
async def stream_hat_data_to_frontend():
    return await connect()

if __name__ == '__main__':
    app.run()