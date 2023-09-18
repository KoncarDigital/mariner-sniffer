import React, { useState, useEffect } from 'react';

interface FlaskData {
  events: Array<{
    id: {
      instance: number;
      server: number;
      session: number;
    };
    payload: {
      data: string;
      type: string;
    };
    source_timestamp: number | null;
    timestamp: {
      formatted_timestamp: string;
      s: number;
      us: number;
    };
    type: string[];
  }>;
  type: string;
}

function CurrentTraffic() {
  const [flaskData, setFlaskData] = useState<FlaskData | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('http://127.0.0.1:5000')
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data: FlaskData = await response.json();
        setFlaskData(data);
      } catch (error) {
        console.error('Error:', error);
      }
    }

    fetchData();
  }, []);

  return (
    <div className='App'>
      <h1>Current Traffic</h1>
      {flaskData ? (
        <div>
          <p>Data from Flask:</p>
          <pre>{JSON.stringify(flaskData.events, null, 2)}</pre>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default CurrentTraffic;