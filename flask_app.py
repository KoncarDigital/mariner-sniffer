from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import time, json

#from server.connect_to_hat import MarinerClient

app = Flask(__name__)
# Configure CORS to allow requests from the frontend origin with credentials
CORS(app)

# hat_data = None
# form_data = None

# something = True
# @app.route('/connect', methods=['POST'])
# def connect(parameters):
#     def callback(messages):
#         pass

#     try:
#         client = MarinerClient("localst", 1234, "some_id", "some_token", [["*"]])
#         client.connect(callback)

#         while sommething:
#             send_message_to_front()
#             # yield
#             # prouci streamanje podataka
#     except Exception as e:

# Ovo ostaje isto    
# @app.route('/', methods=['POST'])
# def receive_init_message_data_from_frontend():
#     global form_data
#     form_data = request.json
#     return jsonify({"message":"Data for init message received successfully"})

# @app.route('/', methods=['GET'])
# def send_data_to_backend():
#     global form_data
#     if form_data is not None:
#         return jsonify(form_data)
    
# @app.route('/traffic', methods=['POST'])
# def receive_data_from_backend():
#     global hat_data
#     hat_data = request.json
#     return jsonify({"message":"Data received successfully"})

# @app.route('/traffic', methods=['GET'])
# def send_data_to_frontend():
#     global hat_data
#     if hat_data is not None:
#         return hat_data
  
def event_stream():
    while True:
        data = {"id": {"instance": 2, "server": 1, "session": 2}, "payload": {"data": {"quality": "GOOD", "value": "DISABLED"}, "type": "json"}, "source_timestamp": None, "timestamp": "11.07.2023 15:55:35,146724", "type": ["eds", "data", "point_remote_control_enabled"]}
        yield f"data: {json.dumps(data)}\n\n"
        time.sleep(5)
    
@app.route('/try', methods=['GET'])
def stream_hat_data_to_frontend():
    return Response(event_stream(), content_type='text/event-stream')

if __name__ == '__main__':
    app.run()