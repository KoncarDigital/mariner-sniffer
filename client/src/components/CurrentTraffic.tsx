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
  formatted_timestamp: string;
  type: string[];
  row_id: string;
}

function CurrentTraffic() {

  const columns = [
    { field: 'id', headerName: 'Id', width: 400, renderCell: (params : GridRenderCellParams ) => JSON.stringify(params.row.id) },
    { field: 'payload', headerName: 'Payload', width: 600, renderCell: (params : GridRenderCellParams ) => JSON.stringify(params.row.payload) },
    { field: 'source_timestamp', headerName: 'Source Timestamp', width: 200 },
    { field: 'timestamp', headerName: 'Timestamp', width: 200 },
    { field: 'type', headerName: 'Type', width: 400 }
  ];

  const [events, setEvents] = useState<FlaskData[]>([]);

  useEffect(() => {
    const eventSource = new EventSource('http://127.0.0.1:5000/currenttraffic');

    eventSource.onmessage = (event) => {
      const eventData: FlaskData = JSON.parse(event.data);
      eventData.row_id = JSON.stringify(eventData.id)
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
          
          // getRowHeight={() => 'auto'} getEstimatedRowHeight={() => 200}
        />
      </div>
    </div>
  );
}

export default CurrentTraffic;