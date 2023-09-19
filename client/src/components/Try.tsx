import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const SOCKET_SERVER_URL = "http://127.0.0.1:5000/";
const FLUSH_INTERVAL = 2000;  // e.g., flush every 2 seconds

const Try: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    // This will hold our buffered data
    const bufferRef = useRef<any[]>([]);

    useEffect(() => {
        const socket = io(SOCKET_SERVER_URL);

        socket.on('data', (newData: any) => {
            // Instead of updating the state directly, we push data to the buffer
            bufferRef.current.push(newData);
        });

        console.log(bufferRef)

        const flushBuffer = setInterval(() => {
            if (bufferRef.current.length > 0) {
                setData(prevData => [...prevData, ...bufferRef.current]);
                bufferRef.current = [];  // clear the buffer
            }
        }, FLUSH_INTERVAL);

        return () => {
            socket.disconnect();
            clearInterval(flushBuffer);
        };
    }, []);
    return (
      <div>
                  {/* Render your data here */}
                  {data.map(item => (
      <div key={item.id}>
                          {item.content}
      </div>
                  ))}
      </div>
          );
      }

export default Try;