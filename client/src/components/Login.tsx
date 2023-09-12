import React, { useState } from 'react';

function Login() {
  const [form, setForm] = useState({id: '', type: ''});
  const [error, setError] = useState("")
  const [wait, setWait] = useState(false);

  async function onSubmit() {
      setError("")
      setWait(true);
      let userInfo = await fetch('/')
          .then((response) => {
              if (!response.ok){
                  setError("Greška")
                  setWait(false);
                  return null;
              } else return response.json();
          })
  }

  return <div>
          <h2>Input desired parameters</h2>
          <form onSubmit={onSubmit}>
              <div className="FormRow">
                  <input name="id" placeholder="Enter Id"/>
              </div>
              <div className="FormRow">
                  <input name="type" placeholder="Enter Event Type"/>
              </div>
              {wait ? <span>Pričekajte...</span> : <button onClick={onSubmit} type="submit">Submit</button>}
              <hr/>
          </form>
          <div>
              {error}
          </div>
        </div>
}

export default Login;
