from MarinerClient import MarinerClient
from quart import Quart, jsonify, request, websocket
from quart_cors import cors
import json
import ast
import asyncio


app = Quart(__name__)
cors(app)
queue = asyncio.Queue(maxsize=10)

# Message sent to HAT server to initiate connection
init_json = {}
# Data obtained from a frontend form on the /connect route
form_data = {}

streaming_event = asyncio.Event()


def transform_form_data_to_init_json(form_data):
    """Transforms data from a form into a specific format
        that is used to initiate connection to server"""
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
    if form_data['selected_subscription'] is not None:
        for subscription in form_data['selected_subscription']:
            subscription_as_list = ast.literal_eval(subscription['label'])
            init_json["subscriptions"].append(subscription_as_list)
    if (form_data['customFields'][0] == "" and
            form_data['selected_subscription'] is None):
        init_json["subscriptions"].append(['*'])

    return init_json


@app.route('/', methods=['POST'])
async def receive_init_message_data():
    """Transform form_data to proper init message format
    form_data is a JSON object consisting of following members:
        server_ip (string)
        server_port (string)
        client_id (string)
        client_token (string)
        last_event_id (string)
        selected_option (string)
        show_help_text (bool)
        selected_subscription (list of JSON-like objects,
                                each containing two key-value pairs)
        customFields (list of strings)
        """
    global form_data
    global init_json
    form_data = await request.json
    init_json = transform_form_data_to_init_json(form_data)

    return jsonify({"message": "Init message data received successfully"})


@app.route('/start', methods=['POST'])
async def start_streaming():
    """After clicking on Start, signal to start streaming"""
    try:
        streaming_event.set()
        return 'Streaming started successfully', 200
    except Exception as e:
        return str(e), 400


@app.route('/stop', methods=['POST'])
async def stop_streaming():
    """After clicking on Stop, signal to stop streaming"""
    try:
        streaming_event.clear()
        return 'Streaming stopped successfully', 200
    except Exception as e:
        return str(e), 400


async def main():
    """Connect to server and stream server data to frontend"""
    try:
        queue = asyncio.Queue(maxsize=10_000)

        client = MarinerClient(form_data["server_ip"],
                               form_data["server_port"],
                               queue)
        await client.connect(init_json)
        while True:
            await streaming_event.wait()
            await client.message()
            events = await queue.get()
            if events != "Pong":
                for event in events:
                    await websocket.send(json.dumps(event))
                    print("Item yielded")

    except Exception as e:
        print("Exception:", e)
        await websocket.send(json.dumps("Socket timed out."))


@app.websocket('/currenttraffic')
async def stream():
    return await main()

if __name__ == '__main__':
    app.run()
