import React from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

interface CustomDataGridProps {
    rows: any[];
    columns: any[];
  }

export const CustomDataGrid: React.FC<CustomDataGridProps> = ({ rows, columns }) => {
  return (
    <DataGrid
      rows={rows}
      columns={columns}
      getRowId={(row) => row.id_stringify}
      checkboxSelection
      disableDensitySelector
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
    />
  );
};
