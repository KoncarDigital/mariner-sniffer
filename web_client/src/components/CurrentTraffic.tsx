import React, { useState, useEffect } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid'

interface QuartData {
  id: string;
  payload: string;
  source_timestamp: Date | null;
  formatted_timestamp: Date;
  type: string[];
  payload_stringify: string;
  id_stringify: string;
}

function CurrentTraffic() {

  const columns = [
    { field: 'id_stringify', headerName: 'Id', width: 400 },
    { field: 'payload_stringify', headerName: 'Payload', width: 600},
    { field: 'source_timestamp', headerName: 'Source Timestamp', width: 200, type: 'datetime' },
    { field: 'timestamp', headerName: 'Timestamp', width: 200, type: 'datetime' },
    { field: 'type', headerName: 'Type', width: 400, }
  ];

  const [events, setEvents] = useState<QuartData[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [clickedButton, setClickedButton] = useState('');
  const [isStreaming, setIsStreaming] = useState(true);

  const toggleStreaming = async () => {
    setIsStreaming((prevState) => !prevState);

    try {
      const response = await fetch('http://127.0.0.1:5000/streaming', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        setIsStreaming(data.isStreaming);
        console.log('Data sent successfully');
      } else {
        console.error('Error sending data');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: isStreaming ? 'red' : 'rgb(25, 200, 50)'
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (clickedButton === 'Submit') {
      window.location.href = '/';
    }
  };

  useEffect(() => {
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
              {/* Malo čudno napravljeno ZA SADA, ali kad se stisne Stop pa Manage subscriptions,
                onda pri povratku na rutu /currenttraffic treba stisnuti Stop kako bi se počeo prikazivati promet.
                Potencijalno rješenje je implementirati zasebne rute na Quart appu: jedna za Start, druga za Stop */}
              <div>
                <button className='stop-button' onClick={toggleStreaming} style={buttonStyle}>
                  {isStreaming ? 'Stop' : 'Start'}
                </button>
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
        <button className='stop-button' onClick={toggleStreaming} style={buttonStyle}>
          {isStreaming ? 'Stop' : 'Start'}
        </button>
      </div>
      <form className='redirect-form' onSubmit={onSubmit}>
        <button className='connect-button' onClick={() => setClickedButton('Submit')} type="submit">Manage subscriptions</button>
      </form>
      <h1>Current Traffic</h1>
      {errorMessage && <div>{errorMessage}</div>}
      <div> 
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
              sortModel: [{ field: 'timestamp', sort: 'desc' }],
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