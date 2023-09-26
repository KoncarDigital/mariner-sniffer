from quart import Quart, jsonify, request, Response
from quart_cors import cors
import time, json, ast
from server.connect_to_hat import MarinerClient
import asyncio

app = Quart(__name__)
# Configure CORS to allow requests from the frontend origin with credentials
cors(app)

init_json = {}
form_data = {}
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
    return jsonify({"message":"Data for init message received successfully"})

queue = asyncio.Queue(maxsize=10000)

# async def callback(message):
#     for event in message:
#         await queue.put(json.dumps(event))
#         print("Item added to queue")

# async def connect():
#     global init_json
#     global form_data
#     try:
#         # client = MarinerClient(form_data["server_ip"], form_data["server_port"], init_json["client_id"], init_json["client_token"], init_json["subscriptions"], init_json["last_event_id"])
#         client = MarinerClient("10.13.5.8", "23014", "myclientid", "myclienttoken", [['eds', 'data', '?']], {'server':1, 'session':0, 'instance':0})
#         init_json = {'type': 'init', 'client_id': 'myclientid', 'client_token': 'myclienttoken', 'last_event_id': {'server': 1, 'session': 0, 'instance': 0}, 'subscriptions': [['eds', 'data', '?']]}
        
#         await client.connect(init_json, callback)
#         # Podesi uvjet za while tako da odgovara na onClick start/stop button na frontu
#         while True:
#             event = await queue.get()
#             print("Item yielded")
#             yield f"data: {event}\n\n"
#     except Exception as e:
#         print("Exception occured within Quark app:", e)

# @app.route('/currenttraffic', methods=['GET'])
# async def stream_hat_data_to_frontend():
#     return Response(connect(), content_type='text/event-stream')

# if __name__ == '__main__':
#     app.run()

from quart import websocket

async def callback(message):
    for event in message:
        await queue.put(json.dumps(event))
        print("Item added to queue")

async def connect():
    global init_json
    global form_data
    try:
        #client = MarinerClient(form_data["server_ip"], form_data["server_port"], init_json["client_id"], init_json["client_token"], init_json["subscriptions"], init_json["last_event_id"])
        client = MarinerClient("10.13.5.8", "23014", "myclientid", "myclienttoken", [['eds', 'data', '*']], None)
        init_json = {'type': 'init', 'client_id': 'myclientid', 'client_token': 'myclienttoken', 'last_event_id': None, 'subscriptions': [['eds', 'data', '*']]}
        
        await client.connect(init_json, callback)

        # Podesi uvjet za while tako da odgovara na onClick start/stop button na frontu
        while True:
            event = await queue.get()
            await websocket.send(event)
            print("Item yielded")

    except Exception as e:
        print("Exception occured within Quark app:", e)

@app.websocket('/currenttraffic')
async def stream_hat_data_to_frontend():
    return await connect()

if __name__ == '__main__':
    app.run()











#     try:
#         client = MarinerClient("localst", 1234, "some_id", "some_token", [["*"]])
#         client.connect(callback)

#         while sommething:
#             send_message_to_front()
#             # yield
#             # prouci streamanje podataka
#     except Exception as e:    