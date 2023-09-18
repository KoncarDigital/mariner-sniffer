from flask import Flask, jsonify, request, session
from flask_cors import CORS
from server.connect_to_hat import MarinerClient

app = Flask(__name__)
# Configure CORS to allow requests from the frontend origin with credentials
CORS(app)

hat_data = None
form_data = None

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
#     except Exception as e:

@app.route('/traffic', methods=['POST'])
def receive_data_from_backend():
    global hat_data
    hat_data = request.json
    return jsonify({"message":"Data received successfully"})

@app.route('/traffic', methods=['GET'])
def send_data_to_frontend():
    global hat_data
    if hat_data is not None:
        return hat_data
    
@app.route('/', methods=['POST'])
def receive_data_from_frontend():
    global form_data
    form_data = request.json
    return jsonify({"message":"Data received successfully"})

@app.route('/', methods=['GET'])
def send_data_to_backend():
    global form_data
    if form_data is not None:
        return jsonify(form_data)

if __name__ == '__main__':
    app.run()
