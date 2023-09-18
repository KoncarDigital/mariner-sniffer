# Connect to HAT platform and receive data from it

import socket
import json
import time
import datetime
import csv
import requests
import ast

class MarinerClient():
    def __init__(self, server_ip, server_port, client_id, client_token, subscriptions, last_event_id = None):
        self.server_ip = server_ip
        self.server_port = server_port
        self.client_id = client_id
        self.client_token = client_token
        self.subscriptions = subscriptions
        self.last_event_id = last_event_id

    def connect(self, messages_callback):
        try:
            client_socket.connect((self.server_ip, self.server_port))

            init_json = receive_init_message_from_flask()
            send_message_to_server(init_json)

            while True:
                message = receive_message_from_server()

                if not message:
                    break

                # Determine type of message
                message_parsed = json.loads(message.decode("utf-8"))
                message_type = message_parsed['type']

                # Za izvlačenje baze tipova evenata
                # for i in range(len(message_parsed['events'])):
                #     event_type = message_parsed['events'][i]['type']
                #     if event_type not in event_types and "eds" not in event_type:
                #         event_types.append(event_type)
                
                if message_type == "events":
                    message = format_date(message_parsed)
                    response = requests.post(flask_app_url, json=message)
                elif message_type == "ping":
                    pong_json = {"type": "pong"}
                    send_message_to_server(pong_json)

                messages_callback(message)

            client_socket.close()
        except socket.timeout:
            print("Socket timed out.")
        except Exception as e:
            print("Exception:", e)

    
    # init_json = {
    #     "type": "init",
    #     "client_id": "my_client_id",
    #     "client_token": "myclienttoken",
    #     "last_event_id": {"server": 1, "session": 0, "instance": 0},
    #     "subscriptions": [["*"]]
    # }

def send_message_to_server(json_message):
    # Mariner message: m + k + message

    payload_bytes = bytes(json.dumps(json_message), "utf-8")  # message
    payload_bytes_length = len(payload_bytes)
    encoded_payload_bytes_length = payload_bytes_length.to_bytes(2, byteorder="big")  # k
    payload_length_size = len(encoded_payload_bytes_length)
    encoded_payload_length_size = payload_length_size.to_bytes(1, byteorder="big")  # m

    arr = []

    for b in encoded_payload_length_size:
        arr.append(b)

    for b in encoded_payload_bytes_length:
        arr.append(b)

    for b in payload_bytes:
        arr.append(b)

    client_socket.sendall(bytes(arr))

def receive_message_from_server():
    m = client_socket.recv(1)
    k_length = int(hex(m[0]), 16)

    k = client_socket.recv(k_length)

    bytes_list = []
    for byte in k:
        bytes_list.append(byte)

    bytes_list.reverse()

    message_length = 0 
    message_length += bytes_list[0]

    for i in range(1, len(bytes_list)):
        empty_bytes = int("00"*i)
        message_length += (bytes_list[i] << 8*i) | empty_bytes
        
    message = b''
    for i in range(message_length):
        part_of_message = client_socket.recv(1)
        message += part_of_message

    return message

def format_date(message_parsed):
    for i in range(len(message_parsed['events'])):
        seconds = message_parsed['events'][i]['timestamp']['s']
        microseconds = message_parsed['events'][i]['timestamp']['us']

        dt = datetime.datetime.fromtimestamp(seconds)
        dt = dt.replace(microsecond=microseconds)
        formatted_date = dt.strftime('%d.%m.%Y %H:%M:%S,%f')

        message_parsed['events'][i]['timestamp']['formatted_timpstamp'] = formatted_date

    return message_parsed

def receive_init_message_from_flask():
    init_json = {}
    form_data = requests.get(flask_app_url).json()
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
    
    # Tu se breaka ako je npr customFields prazno (['']), shvati zasto
    # Takoder je nesto krivo kod slanja init poruke jer se ne uspijeva spojiti na HAT
    init_json["subscriptions"] = []
    if form_data['customFields'][0] != "":
        for subscription in form_data['customFields']:
            subscription_as_list = ast.literal_eval(subscription)
            init_json["subscriptions"].append(subscription_as_list)
    print(form_data['selected_subscription'] == None)
    for subscription in form_data['selected_subscription']:
        subscription_as_list = ast.literal_eval(subscription['label'])
        init_json["subscriptions"].append(subscription_as_list)
    
    init_json = json.dumps(init_json)
    print(init_json)
    return init_json

# Primijeni donji kod na naš oblik podataka kako bi se moglo exportat u csv
# def export_to_csv(data):

#     # Define a function to flatten the JSON data
#     def flatten_data(data):
#         flattened_data = []
#         for entry in data:
#             flat_entry = {
#                 "events": "; ".join([f'{a["id"]}, {a["type"]}, {a["timestamp"]}, {a["source_timestamp"]}, {a["payload"]}, ' for a in entry.get("events", [])])
#             }
#             flattened_data.append(flat_entry)
#         return flattened_data

#     # Flatten the data
#     flattened_data = flatten_data(data)

#     # Define the CSV file name
#     csv_file = "output.csv"

#     # Write the flattened data to a CSV file
#     with open(csv_file, mode='w', newline='') as file:
#         writer = csv.DictWriter(file, fieldnames=["events"])
#         writer.writeheader()
#         writer.writerows(flattened_data)

#     print(f"CSV file '{csv_file}' created successfully.")

server_ip = "10.13.5.8"
server_port = 23014
flask_app_url = 'http://127.0.0.1:5000'  # Replace with your Flask app's URL

client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

try:
    client_socket.connect((server_ip, server_port))

    # Primjer init poruke, inače će se ove informacije skupljati s fronta
    # Potrebno implementirati čitanje danih init parametara s fronta
    # init_json = {
    #     "type": "init",
    #     "client_id": "my_client_id",
    #     "client_token": "myclienttoken",
    #     "last_event_id": {"server": 1, "session": 0, "instance": 0},
    #     "subscriptions": [['eds', 'data', '?']]
    # }

    init_json = receive_init_message_from_flask()
    send_message_to_server(init_json)

    # Potrebno implementirati zaustavljanje streamanja podataka
    # Primat će se boolean kao rezultat onClick-a na frontu

    # event_types = []

    while True:
        message = receive_message_from_server()
        print(message)
        break

        if not message:
            break

        # Determine type of message
        message_parsed = json.loads(message.decode("utf-8"))
        message_type = message_parsed['type']

        # Za izvlačenje baze tipova evenata
        # for i in range(len(message_parsed['events'])):
        #     event_type = message_parsed['events'][i]['type']
        #     if event_type not in event_types and "eds" not in event_type:
        #         event_types.append(event_type)
        
        if message_type == "events":
            message = format_date(message_parsed)
            response = requests.post(flask_app_url, json=message)
        elif message_type == "ping":
            pong_json = {"type": "pong"}
            send_message_to_server(pong_json)

    client_socket.close()
except socket.timeout:
    print("Socket timed out.")
except Exception as e:
    print("Exception:", e)



