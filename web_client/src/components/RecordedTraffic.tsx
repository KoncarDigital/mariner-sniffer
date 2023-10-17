import React, { useState } from 'react';
import { DataGrid, GridValueGetterParams, GridToolbar } from '@mui/x-data-grid';
import Papa from 'papaparse';
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
  type: string[];
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

function RecordedTraffic() {
  const [csvData, setCSVData] = useState<any[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];
  
    if (file) {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (result) => {
          const mappedData = result.data.map((row : any) => ({
            id_stringify: row.Id,
            payload_stringify: row.Payload,
            source_date: row['Source Date'],
            source_time: row['Source Time'],
            date: row.Date,
            time: row.Time,
            type: row.Type,
          }));
  
          const dataWithIds = mappedData.map((row, index) => ({
            ...row,
            id: index.toString(),
          }));
  
          setCSVData(dataWithIds);
        },
        error: (error) => {
          console.error('CSV parsing error:', error);
        },
      });
    }
  };
  
  return (
    <div>
      <button className='connect-button'>
        <Link to="/" className='link'>Manage subscriptions</Link>
      </button>
      <h1>Recorded Traffic</h1>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      <div style={{ height: '800px' }}>
        <DataGrid
          rows={csvData}
          columns={columns}
          getRowId={(row) => row.id}
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

export default RecordedTraffic;