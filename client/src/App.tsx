import React from 'react';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import CurrentTraffic from './components/CurrentTraffic';
import RecordedTraffic from './components/RecordedTraffic';
import Try from './components/Try';
import Connect from './components/Connect';

function App() {
  return (
    <div className='App'>
      <BrowserRouter>
          <Routes>
              <Route path='/' element={<Connect/>} />
              <Route path='/currenttraffic' element={<CurrentTraffic/>} />
              <Route path='/recordedtraffic' element={<RecordedTraffic/>} />
              <Route path='/try' element={<Try />} />
          </Routes>
      </BrowserRouter>

    </div>
  );
}

export default App;

