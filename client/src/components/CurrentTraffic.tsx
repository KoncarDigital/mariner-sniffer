import React, { useState, useEffect } from 'react';
import { DataGrid, GridToolbar, GridToolbarColumnsButton } from '@mui/x-data-grid'

interface FlaskData {
  id: string;
  payload: string;
  source_timestamp: Date | null;
  formatted_timestamp: Date;
  type: string[];
  row_id: string;
  payload_stringify: string;
}

function CurrentTraffic() {

  const columns = [
    { field: 'row_id', headerName: 'Id', width: 400 },
    { field: 'payload_stringify', headerName: 'Payload', width: 600},
    { field: 'source_timestamp', headerName: 'Source Timestamp', width: 200, type: 'datetime' },
    { field: 'timestamp', headerName: 'Timestamp', width: 200, type: 'datetime' },
    { field: 'type', headerName: 'Type', width: 400, }
  ];

  const [events, setEvents] = useState<FlaskData[]>([]);

  // useEffect(() => {
  //   const eventSource = new EventSource('http://127.0.0.1:5000/currenttraffic');

  //   eventSource.onmessage = (event) => {
  //     const eventData: FlaskData = JSON.parse(event.data);
  //     eventData.row_id = JSON.stringify(eventData.id)
  //     setEvents((prevEvents) => [...prevEvents, eventData]);
  //   };

  //   eventSource.onerror = (error) => {
  //     console.error('SSE Error:', error);
  //     eventSource.close();
  //   };

  //   return () => {
  //     eventSource.close();
  //   };
  // }, []);

  useEffect(() => {
    const ws = new WebSocket('ws://127.0.0.1:5000/currenttraffic');

    ws.onopen = () => {
      console.log('WebSocket connection opened');
    };

    ws.onmessage = (event) => {
      const eventData: FlaskData = JSON.parse(event.data);
      eventData.row_id = JSON.stringify(eventData.id);
      eventData.payload_stringify = JSON.stringify(eventData.payload)
      setEvents((prevEvents) => [...prevEvents, eventData]);
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
  
  console.log(events)

  if(!events || events.length === 0) {
    return  <div>
              <h1>Current Traffic</h1>
              <div>
                Loading...
              </div>
            </div>
  }

  return (
    <div>
      <h1>Current Traffic</h1>
      <div>
        <DataGrid
          rows={events}
          columns={columns}
          getRowId={(row) => row.row_id}
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
          getRowHeight={() => 'auto'} getEstimatedRowHeight={() => 200}
        />
      </div>
    </div>
  );
}

export default CurrentTraffic;