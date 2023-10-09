import React, { useEffect, useState } from 'react';

function Try() {
    const [isStreaming, setIsStreaming] = useState(true);
  
    const handleStartClick = async () => {
      try {
        const startData = {
          action: 'start'
        };
  
        const response = await fetch('http://127.0.0.1:5000/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(startData),
        });
  
        if (response.ok) {
          setIsStreaming(true);
        } else {
          console.error('Error sending data');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
  
    const handleStopClick = async () => {
      try {
        const stopData = {
          action: 'stop'
        };
  
        const response = await fetch('http://127.0.0.1:5000/stop', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(stopData),
        });
  
        if (response.ok) {
          setIsStreaming(false);
        } else {
          console.error('Error sending data');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
  
    return (
      <div>
        <h1>Streaming Control</h1>
        <p>Streaming is {isStreaming ? 'ON' : 'OFF'}</p>
        <button onClick={handleStartClick} disabled={isStreaming}>Start</button>
        <button onClick={handleStopClick} disabled={!isStreaming}>Stop</button>
      </div>
    );
  };

export default Try;
