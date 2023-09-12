from flask import Flask, jsonify, request, session
from flask_cors import CORS

app = Flask(__name__)
# Configure CORS to allow requests from the frontend origin with credentials
CORS(app)

stored_data = None

@app.route('/', methods=['POST'])
def receive_data():
    global stored_data
    stored_data = request.json
    return jsonify({"message":"Data received successfully"})

@app.route('/', methods=['GET'])
def get_data():
    global stored_data
    if stored_data is not None:
        return stored_data
    else:
        return {}

if __name__ == '__main__':
    app.run()
