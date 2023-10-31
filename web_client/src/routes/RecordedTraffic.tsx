import React, { useState } from 'react';
import Papa from 'papaparse';
import { Link } from "react-router-dom";
import { columns } from '../utils/columns';
import { CustomDataGrid } from '../components/CustomDataGrid';


const RecordedTraffic = () => {
  const [csvData, setCSVData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];
  
    if (file && file.name.endsWith('.csv')) {
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
  

          if (mappedData.some((row) => row.id_stringify === undefined)) {
            setError('Error: Invalid header. Check header format.');
          } else {
            const dataWithIds = mappedData.map((row, index) => ({
              ...row,
              id: index.toString(),
            }));

            setCSVData(dataWithIds);
            setError(null);
          }
        },
        error: (error) => {
          console.error('CSV parsing error:', error);
          setError('Error parsing CSV file.');
        },
      });
    } else {
      setError('Invalid file format. Please upload a CSV file.');
    }
  };
  
  return (
    <div>
      <button className='connect-button'>
        <Link to="/" className='link'>Manage subscriptions</Link>
      </button>
      <h1>Recorded Traffic</h1>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      {error && <div className="error-message">{error}</div>}
      <div style={{ height: '800px' }}>
        <CustomDataGrid rows={csvData} columns={columns}/>
      </div>
    </div>
  );
}

export default RecordedTraffic;