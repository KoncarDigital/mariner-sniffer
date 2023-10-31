import socket
import json
import datetime


class MarinerClient():
    def __init__(self, server_ip, server_port, queue):
        self.server_ip = server_ip
        self.server_port = server_port
        self.client_socket = None
        self.queue = queue

    def send_message_to_server(self, json_message):
        """Transform message to bytes and send it to HAT
            Mariner message: m + k + message"""
        payload_bytes = bytes(json.dumps(json_message), "utf-8")  # message
        payload_bytes_length = len(payload_bytes)
        encoded_payload_bytes_length = (
            payload_bytes_length.to_bytes(2, byteorder="big"))  # k
        payload_length_size = len(encoded_payload_bytes_length)
        encoded_payload_length_size = (
            payload_length_size.to_bytes(1, byteorder="big"))  # m

        arr = []

        for b in encoded_payload_length_size:
            arr.append(b)

        for b in encoded_payload_bytes_length:
            arr.append(b)

        for b in payload_bytes:
            arr.append(b)

        self.client_socket.sendall(bytes(arr))

    def receive_message_from_server(self):
        """Use socket to receive Mariner message from server"""
        m = self.client_socket.recv(1)
        k_length = int(hex(m[0]), 16)

        k = self.client_socket.recv(k_length)
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
            part_of_message = self.client_socket.recv(1)
            message += part_of_message

        return message

    def format_date(self, seconds, microseconds):
        """Transform HAT timestamp into normal timestamp"""
        dt = datetime.datetime.fromtimestamp(seconds)
        dt = dt.replace(microsecond=microseconds)
        formatted_date = dt.strftime('%m/%d/%Y')
        formatted_time = dt.strftime('%H:%M:%S,%f')
        return formatted_date, formatted_time

    def format_message(self, message_parsed):
        """Format properties timestamp, source_timestamp and type"""
        for event in message_parsed['events']:
            event_type = event['type']
            event['type'] = ",".join(event_type)

            timestamp = event['timestamp']
            format = self.format_date(timestamp['s'], timestamp['us'])
            event['date'], event['time'] = format[0], format[1]

            if event['source_timestamp'] is not None:
                src_timestamp = event['source_timestamp']
                format = self.format_date(
                    src_timestamp['s'], src_timestamp['us'])
                event['source_date'], event['source_time'] = (
                    format[0], format[1])

        return message_parsed

    async def connect(self, init_json):
        """Connect to server"""
        try:
            self.client_socket = socket.socket(socket.AF_INET,
                                               socket.SOCK_STREAM)
            self.client_socket.connect((self.server_ip, int(self.server_port)))
            self.send_message_to_server(init_json)

        except socket.timeout:
            self.client_socket.close()
            raise Exception("Socket timed out.")
        except Exception as e:
            self.client_socket.close()
            print(repr(e))

    async def message(self):
        message = self.receive_message_from_server()
        message_parsed = json.loads(message.decode("utf-8"))
        message_type = message_parsed['type']

        if message_type == "events":
            message = self.format_message(message_parsed)
            await self.queue.put(message['events'])
            print("Item added to queue")
        elif message_type == "ping":
            pong_json = {'type': 'pong'}
            self.send_message_to_server(pong_json)
            await self.queue.put("Pong")
