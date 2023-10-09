import React, { useState } from 'react';
import '../style/Connect.css';
import Select from 'react-select';
import { Link } from "react-router-dom"

function Connect() {
  const [customFields, setCustomFields] = useState<string[]>([]);
  const [newField, setNewField] = useState('');
  const initialFormData = {
    server_ip: '',
    server_port: '',
    client_id: 'myclientid',
    client_token: 'myclienttoken',
    last_event_id: '',
    selected_option: 'Current events',
    show_help_text: false,
    selected_subscription: null,
    customFields: [""],
  };

  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState('');
  const [wait, setWait] = useState(false);
  const [clickedButton, setClickedButton] = useState('');

  const addCustomField = () => {
    if (newField) {
      setCustomFields([...customFields, newField]);
      setNewField('');
      setFormData({
        ...formData,
        customFields: [...customFields, newField],
      });
    }
  };

  const removeCustomField = (index: number) => {
    const updatedFields = [...customFields];
    updatedFields.splice(index, 1);
    setCustomFields(updatedFields);
    setFormData({
      ...formData,
      customFields: updatedFields,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      last_event_id: '',
      selected_option: e.target.value,
    });
  };

  // const handleCustomOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setFormData({
  //     ...formData,
  //     selected_option: '',
  //     last_event_id: e.target.value,
  //   });
  // };

  const handleHelpTextHover = (hovered: boolean) => {
    setFormData({
      ...formData,
      show_help_text: hovered,
    });
  };

  const handleSelect = (e: any) => {
    setFormData({
      ...formData,
      selected_subscription: e,
    });
  };

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWait(true);
    resetForm();

    if (clickedButton === 'Submit') {
      window.location.href = '/currenttraffic';
    }

    try {
      const response = await fetch('http://127.0.0.1:5000', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log('Data sent successfully');
      } else {
        console.error('Error sending data');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setWait(false);
    }
  };

  const optionList = [
    { value: "['*']", label: "['*']" },
    { value: "['eds', 'data', '?']", label: "['eds', 'data', '?']" },
    { value: "['gui', 'eds', 'system', 'data', '*']", label: "['gui', 'eds', 'system', 'data', '*']" },
    { value: "['sampling', '?']", label: "['sampling', '?']" },
    { value: "['gateway', 'gateway', 'modbus_master', '?', '?', '?', '?', '?']", label: "['gateway', 'gateway', 'modbus_master', '?', '?', '?', '?', '?']" },
  ];

  return (
    <div className="container">
      <button className='recorded-traffic-button-2'>
        <Link to="/recordedtraffic" className='link'>Upload CSV file</Link>
      </button>
      <h1>Connect</h1>
      <form className='connect-form' onSubmit={onSubmit}>
      <div className="form-group">
          <label htmlFor="server_ip">Server Ip</label>
          <input
            required={true}
            type="text"
            id="server_ip"
            name="server_ip"
            value={formData.server_ip}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="server_port">Server Port</label>
          <input
            required={true}
            type="text"
            id="server_port"
            name="server_port"
            value={formData.server_port}
            onChange={handleInputChange}
          />
        </div>
        <label htmlFor="last_event_id">Last Event Id</label>
        <div className="form-group special-group">
          <div className="radio-options">
            <label htmlFor="none" className="special-label">
              <input
                className="radio-input"
                type="radio"
                id="none"
                name="options"
                value="Current events"
                checked={formData.selected_option === 'Current events'}
                onChange={handleOptionChange}
              />
              Current events
            </label>
            <label htmlFor="default" className="special-label">
              <input
                className="radio-input"
                type="radio"
                id="default"
                name="options"
                value="All-time events"
                checked={formData.selected_option === 'All-time events'}
                onChange={handleOptionChange}
              />
              All-time events
            </label>
          </div>

          {/* <div>
            <div className="custom-option-row">
              <label className="custom-option-label">Custom events</label>
              <div
                className="help-button"
                onMouseEnter={() => handleHelpTextHover(true)}
                onMouseLeave={() => handleHelpTextHover(false)}
              >
                ?
                {formData.show_help_text && (
                  <div className="help-text">
                    Entered data should be three comma-separated integers (e.g. 1,0,0)
                  </div>
                )}
              </div>
            </div>
            <input
              className="custom-option-input"
              type="text"
              id="last_event_id"
              name="last_event_id"
              value={formData.last_event_id}
              onChange={handleCustomOptionChange}
              placeholder="Enter values for server, session, and instance"
            />
          </div> */}
        </div>
        <div className="form-group">
          <div className="custom-option-row">
            <label htmlFor="dropdown" className="custom-option-label">
              Subscriptions
              </label>
            <div
              className="help-button"
              onMouseEnter={() => handleHelpTextHover(true)}
              onMouseLeave={() => handleHelpTextHover(false)}
            >
              ?
              {formData.show_help_text && (
                <div className="help-text">
                  Entered data should match the format of options in the dropdown menu (e.g. ['eds', 'data', '?']).
                  <br></br>
                  The string '?' is matched with a single arbitrary string.
                  <br></br>
                  The string '*' is matched with any number (zero or more) of arbitrary strings.
                </div>
              )}
            </div>
          </div>
          <div className="dropdown-container">
            <Select
              options={optionList}
              placeholder="Select subscriptions"
              value={formData.selected_subscription}
              onChange={handleSelect}
              isSearchable={true}
              isMulti
            />
          </div>
          <br />
          <div>
            <input
              type="text"
              value={newField}
              onChange={(e) => setNewField(e.target.value)}
              placeholder="Enter custom subscription"
            />
            <button onClick={addCustomField} className="small-button" type="button">
              Add
            </button>
          </div>
          <ul>
            {customFields.map((field, index) => (
              <li key={index}>
                {field}
                <button onClick={() => removeCustomField(index)} className="small-button" type="button">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>

        <hr />
        {wait ? <span>Wait...</span> : <button className='submit-button' onClick={() => setClickedButton('Submit')} type="submit">Submit</button>}
      </form>
      <div>{error}</div>
    </div>
  );
}

export default Connect;
