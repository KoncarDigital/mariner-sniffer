import { GridValueGetterParams } from '@mui/x-data-grid'
import { QuartData } from './QuartData';

export const columns = [
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
  