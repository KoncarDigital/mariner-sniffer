import React, { useState, useEffect } from 'react';
import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid'

interface FlaskData {
  id: {
    server: number;
    session: number;
    instance: number;
  };
  payload: {
    type: string;
    data: string;
  };
  source_timestamp: number | null;
  timestamp: {
    formatted_timestamp: string;
  };
  type: string[];
}

function CurrentTraffic() {

  // const rows = [
  //   { id: 1, payload: 'John', timestamp: 'Doe', type: 30 },
  //   { id: 2, payload: 'John', timestamp: 'Doe', type: 30 },
  // ];

  const columns = [
    { field: 'id', headerName: 'Id', width: 300, renderCell: (params : GridRenderCellParams ) => JSON.stringify(params.row.id) },
    { field: 'payload', headerName: 'Payload', width: 700, renderCell: (params : GridRenderCellParams ) => JSON.stringify(params.row.payload) },
    { field: 'source_timestamp', headerName: 'Source Timestamp', width: 200 },
    { field: 'timestamp', headerName: 'Timestamp', width: 200 },
    { field: 'type', headerName: 'Type', width: 400 }
  ];

  const [events, setEvents] = useState<FlaskData[]>([]);

  useEffect(() => {
    const eventSource = new EventSource('http://127.0.0.1:5000/try');

    eventSource.onmessage = (event) => {
      const eventData: FlaskData = JSON.parse(event.data);
      setEvents((prevEvents) => [...prevEvents, eventData]);
    };

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  console.log(events)

  if(!events) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Streaming Events from Flask</h1>
      <div>
        <DataGrid
          rows={events}
          columns={columns}
          checkboxSelection
        />
      </div>
    </div>
  );
}

export default CurrentTraffic;