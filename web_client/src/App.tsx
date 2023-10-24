import React from 'react';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import CurrentTraffic from './routes/CurrentTraffic';
import RecordedTraffic from './routes/RecordedTraffic';
import Connect from './routes/Connect';

function App() {
  return (
    <div className='App'>
      <BrowserRouter>
          <Routes>
              <Route path='/' element={<Connect/>} />
              <Route path='/currenttraffic' element={<CurrentTraffic/>} />
              <Route path='/recordedtraffic' element={<RecordedTraffic/>} />
          </Routes>
      </BrowserRouter>

    </div>
  );
}

export default App;
