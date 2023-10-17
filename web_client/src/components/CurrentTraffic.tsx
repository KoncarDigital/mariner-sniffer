import React, { useState, useEffect } from 'react';
import { DataGrid, GridToolbar, GridValueGetterParams } from '@mui/x-data-grid'
import { Link } from "react-router-dom";

interface QuartData {
  id: string;
  payload: string;
  source_timestamp: Date | null;
  formatted_timestamp: Date;
  date: Date;
  time: string;
  source_date: Date | null;
  source_time: string | null;
  type: string;
  payload_stringify: string;
  id_stringify: string;
}

const columns = [
  { field: 'id_stringify', headerName: 'Id', width: 400 },
  { field: 'payload_stringify', headerName: 'Payload', width: 600 },
  {
    field: 'source_date',
    headerName: 'Source Date',
    width: 100,
    type: 'date',
    valueGetter: (params: GridValueGetterParams<QuartData>) => {
      if (!params.row.source_date) return null
      return new Date(params.row.source_date);
    },
  },
  {
    field: 'source_time',
    headerName: 'Source Time',
    width: 150,
    type: 'time',
    valueGetter: (params: GridValueGetterParams<QuartData>) => params.row.source_time,
  },
  {
    field: 'date',
    headerName: 'Date',
    width: 100,
    type: 'date',
    valueGetter: (params: GridValueGetterParams<QuartData>) => {
      return new Date(params.row.date);
    },
  },
  {
    field: 'time',
    headerName: 'Time',
    width: 150,
    type: 'time',
    valueGetter: (params: GridValueGetterParams<QuartData>) => params.row.time,
  },
  { field: 'type', headerName: 'Type', width: 300 },
];

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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (clickedButton === 'Submit') {
      window.location.href = '/';
      setIsStreaming(false)
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
        var error = "Permission to HAT server denied. Or connection to HAT is broken."
        setErrorMessage(error);
        alert(error)
      } else { 
        const eventData: QuartData = JSON.parse(event.data);
        eventData.id_stringify = JSON.stringify(eventData.id);
        eventData.payload_stringify = JSON.stringify(eventData.payload)
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
  
  if(!events || events.length === 0) {
    return  <div>
              <div>
                <button onClick={handleStartClick} disabled={isStreaming} className='start-button'>Start</button>
                <button onClick={handleStopClick} disabled={!isStreaming} className='stop-button'>Stop</button>
              </div>
              <form className='redirect-form' onSubmit={onSubmit}>
                <button className='connect-button' onClick={() => setClickedButton('Submit')} type="submit">Manage subscriptions</button>
              </form>
              <h1>Current Traffic</h1>
              {errorMessage ? <div>{errorMessage}</div> : <h2>Loading...</h2>}
            </div>
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
      {errorMessage && <div>{errorMessage}</div>}
      <div style={{ height: '850px' }}> 
        <DataGrid
          rows={events}
          columns={columns}
          getRowId={(row) => row.id_stringify}
          checkboxSelection
          sx={{
            boxShadow: 2,
            '& .MuiDataGrid-cell:hover': {
              color: 'primary.main',
            },
          }}
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { printOptions: { disableToolbarButton: true } } }}
          initialState={{
            sorting: {
              sortModel: [{ field: 'date', sort: 'desc' }],
            },
          }}
          // getRowHeight={() => 'auto'} getEstimatedRowHeight={() => 200}
          disableDensitySelector
        />
      </div>
    </div>
  );
}

export default CurrentTraffic;