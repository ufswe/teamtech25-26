import { useState, useEffect } from 'react';
import "../components/Map.css";
import "../styles/flight.css";
import Map from "../components/Map";
import Dropdown from "../components/Dropdown.jsx";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import Input from "../components/Input.jsx";
import Knob from "../components/Knob.jsx";

export default function Flight() {

  const [deptAirport, setDeptAirport] = useState();
  const [arrivalAirport, setArrivalAirport] = useState();
  const [lat, setLat] = useState(null);

  const [deptTime, setDeptTime] = useState();

  const [deptTimezone] = useState(() =>
    new Date()
      .toLocaleTimeString('en-US', { timeZoneName: 'short' })
      .split(' ')
      .pop()
  );

  // TODO: NEEDS TO BE FIXED TO BE DYNAMIC
  const arrivalTimezone = "EST";

  const airports = [
    { value: "airport 1", label: "AP1 - airport 1" },
    { value: "airport 2", label: "AP2 - airport 2" },
    { value: "airport 3", label: "AP3 - airport 3" }
  ];
  
   useEffect(() => {
    fetch('http://127.0.0.1:5000/testing2')
    .then(res => res.json())
    .then(data => {
      console.log(lat)
      setLat(data.lat);
    })
    .catch(err => console.log("Error:", err))
  }, []);

  return (
    <div className="flight-page">
      <div className="control-panel">
        <div className="flight-info">
          <div className="source">
            <Dropdown
              label="From"
              value={deptAirport}
              onChange={setDeptAirport}
              options={airports}
              placeholder="Select Departure Airport"
            />
            <div className="time-input-wrapper">
              <Input
                label="Time"
                type="time"
                value={deptTime}
                onChange={setDeptTime}
              />  
              <p className="timezone-label">{deptTimezone}</p>  
            </div>         
          </div>
          <div className="destination">
            <Dropdown
              label="To"
              value={arrivalAirport}
              onChange={setArrivalAirport}
              options={airports}
              placeholder="Select Arrival Airport"
            />
            <div className="time-input-wrapper">
              <p>Display time after calculation?</p>
            </div>
            <Button
              label="Enter"
              placeholder="Enter"
            />
          </div>
    
        </div>

        <div>
            Lat: {lat}
          </div>

        <div className="priority-selection">

        </div>

      </div>

      <div className="output-panel">
        <Map />
      </div>
    </div>
  
  );
}