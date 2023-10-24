import React from 'react';
import '../style/Connect.css';
import { Link } from "react-router-dom"
import ConnectForm from '../components/ConnectForm';

const Connect = () => {

  return (
    <div className="container">
      <button className='recorded-traffic-button-2'>
        <Link to="/recordedtraffic" className='link'>Upload CSV file</Link>
      </button>
      <h1>Connect</h1>
      <ConnectForm/>
    </div>
  );
}

export default Connect;
