# Connect to HAT platform and receive data from it

import socket
import json
import datetime

class MarinerClient():
    def __init__(self, server_ip, server_port, client_id, client_token, subscriptions, client_socket, last_event_id = None):
        self.server_ip = server_ip
        self.server_port = server_port
        self.client_id = client_id
        self.client_token = client_token
        self.subscriptions = subscriptions
        self.client_socket = client_socket
        self.last_event_id = last_event_id

    def send_message_to_server(self, json_message, client_socket):
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

    def receive_message_from_server(self, client_socket):
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

    def format_date(self, message_parsed):
        for i in range(len(message_parsed['events'])):
            seconds = message_parsed['events'][i]['timestamp']['s']
            microseconds = message_parsed['events'][i]['timestamp']['us']

            dt = datetime.datetime.fromtimestamp(seconds)
            dt = dt.replace(microsecond=microseconds)
            formatted_date = dt.strftime('%d.%m.%Y %H:%M:%S,%f')

            del message_parsed['events'][i]['timestamp']
            message_parsed['events'][i]['timestamp'] = formatted_date

            if message_parsed['events'][i]['source_timestamp'] != None:
                seconds = message_parsed['events'][i]['source_timestamp']['s']
                microseconds = message_parsed['events'][i]['source_timestamp']['us']

                dt = datetime.datetime.fromtimestamp(seconds)
                dt = dt.replace(microsecond=microseconds)
                formatted_date = dt.strftime('%d.%m.%Y %H:%M:%S,%f')

                del message_parsed['events'][i]['source_timestamp']
                message_parsed['events'][i]['source_timestamp'] = formatted_date

        return message_parsed

    async def connect(self, init_json):
        try:
            self.client_socket.connect((self.server_ip, int(self.server_port)))
            self.send_message_to_server(init_json, self.client_socket)
        except socket.timeout:
            return "Socket timed out."
        except Exception as e:
            self.client_socket.close()
            print(repr(e))

    async def message(self):
        message = self.receive_message_from_server(self.client_socket)
        if not message:
            return
        message_parsed = json.loads(message.decode("utf-8"))
        message_type = message_parsed['type']
        
        if message_type == "events":
            message = self.format_date(message_parsed)
            return message['events']
        elif message_type == "ping":
            pong_json = {"type": "pong"}
            self.send_message_to_server(pong_json, self.client_socket)
