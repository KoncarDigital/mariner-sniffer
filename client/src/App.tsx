import React from 'react';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Login from "./components/Login"
import CurrentTraffic from './components/CurrentTraffic';
import RecordedTraffic from './components/RecordedTraffic';

function App() {
  return (
    <div className='App'>
      <BrowserRouter>
          <Routes>
              <Route path='/' element={<Login/>} />
              <Route path='/currenttraffic' element={<CurrentTraffic/>} />
              <Route path='/recordedtraffic' element={<RecordedTraffic/>} />
          </Routes>
      </BrowserRouter>

    </div>
  );
}

export default App;

