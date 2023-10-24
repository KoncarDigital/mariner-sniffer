import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { QuartData } from '../utils/QuartData';
import { columns } from '../utils/columns';
import { CustomDataGrid } from '../components/CustomDataGrid';

const CurrentTraffic = () => {

  const [events, setEvents] = useState<QuartData[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [clickedButton, setClickedButton] = useState('');
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
        setErrorMessage('Error sending data');
      }
    } catch (error) {
      setErrorMessage('Error sending data');
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
        setErrorMessage('Error sending data');
      }
    } catch (error) {
      setErrorMessage('Error sending data');
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (clickedButton === 'Submit') {
      window.location.href = '/';
      setIsStreaming(false);
    }
  };

  useEffect(() => {
    handleStartClick();
    const ws = new WebSocket('ws://127.0.0.1:5000/currenttraffic');

    ws.onopen = () => {
      console.log('WebSocket connection opened');
    };

    ws.onmessage = (event) => {
      if (event.data === '"Socket timed out."') {
        var error = "Permission to HAT server denied. Or connection to HAT is broken.";
        setErrorMessage(error);
        alert(error);
      } else {
        setErrorMessage(null);
        const eventData: QuartData = JSON.parse(event.data);
        eventData.id_stringify = JSON.stringify(eventData.id);
        eventData.payload_stringify = JSON.stringify(eventData.payload);
        setEvents((prevEvents) => [...prevEvents, eventData]);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    ws.onclose = (event) => {
      console.log('WebSocket connection closed:', event);
    };

    return () => {
      ws.close();
    };

  }, []);

  if (!events || events.length === 0) {
    return <div>
      <div>
        <button onClick={handleStartClick} disabled={isStreaming} className='start-button'>Start</button>
        <button onClick={handleStopClick} disabled={!isStreaming} className='stop-button'>Stop</button>
      </div>
      <form className='redirect-form' onSubmit={onSubmit}>
        <button className='connect-button' onClick={() => setClickedButton('Submit')} type="submit">Manage subscriptions</button>
      </form>
      <h1>Current Traffic</h1>
      {errorMessage ? <div className='error-message'>{errorMessage}</div> : <h2>Loading...</h2>}
    </div>;
  }

  return (
    <div>
      <div>
        <button onClick={handleStartClick} disabled={isStreaming} className='start-button'>Start</button>
        <button onClick={handleStopClick} disabled={!isStreaming} className='stop-button'>Stop</button>
      </div>
      <form className='redirect-form' onSubmit={onSubmit}>
        <button className='connect-button' onClick={() => setClickedButton('Submit')} type="submit">Manage subscriptions</button>
      </form>
      <button className='recorded-traffic-button'>
        <Link to="/recordedtraffic" className='link'>Upload CSV file</Link>
      </button>
      <h1>Current Traffic</h1>
      {errorMessage && <div className='error-message'>{errorMessage}</div>}
      <div style={{ height: '850px' }}>
        <CustomDataGrid rows={events} columns={columns} />
      </div>
    </div>
  );
};

export default CurrentTraffic;