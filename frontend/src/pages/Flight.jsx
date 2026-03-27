import { useState } from 'react';
import "../components/Map.css";
import "../styles/flight.css";
import Map from "../components/Map";
import Dropdown from "../components/Dropdown.jsx";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import Input from "../components/Input.jsx";
import Knob from "../components/Knob.jsx";
import ToggleSwitch from "../components/ToggleSwitch.jsx"; // toggle for map overlay views
import FeasibilityBar from "../components/FeasibilityBar.jsx"; // horizontal bar showing flight feasibility

export default function Flight() {

  const [deptAirport, setDeptAirport] = useState();
  const [arrivalAirport, setArrivalAirport] = useState();

  const [deptTime, setDeptTime] = useState();

  // Added different Knob Value components
  const [carbonValue, setCarbonValue] = useState(0);
  const [weatherValue, setWeatherValue] = useState(0);
  const [travelValue, setTravelValue] = useState(0);

  // Toggle states for map overlay layers (default both on)
  const [weatherView, setWeatherView] = useState(true);
  const [airTrafficView, setAirTrafficView] = useState(true);

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

        <div className="priority-selection">
          <h3 className="priority-heading">Priority Selections</h3>
          <div className="priority-knobs">
            <Knob label="Carbon Emissions" value={carbonValue} onChange={setCarbonValue} />
            <Knob label="Weather Safety" value={weatherValue} onChange={setWeatherValue} />
            <Knob label="Travel Time" value={travelValue} onChange={setTravelValue} />
          </div>
          <div className="priority-buttons">
            <Button
              onClick={() => {
                setCarbonValue(0);
                setWeatherValue(0);
                setTravelValue(0);
              }}
            >
              Clear
            </Button>
            <Button>Enter</Button>
          </div>
        </div>

      </div>

      <div className="output-panel">
        <Map />
        {/* Info panel: map overlay toggles, flight stats, and feasibility */}
        <div className="info-panel">
          <div className="info-panel-top">
            {/* Left side: toggle switches for map overlays */}
            <div className="info-toggles">
              <ToggleSwitch label="Weather View" isOn={weatherView} onToggle={setWeatherView} />
              <ToggleSwitch label="Air Traffic View" isOn={airTrafficView} onToggle={setAirTrafficView} />
            </div>
            {/* Right side: computed flight statistics (placeholder values for now) */}
            <div className="info-stats">
              <div className="info-stat-row">
                <span className="info-stat-label">Duration:</span>
                <span className="info-stat-value">Hrs</span>
                <span className="info-stat-value">Mins</span>
              </div>
              <div className="info-stat-row">
                <span className="info-stat-label">Carbon Emission:</span>
                <span className="info-stat-value">%</span>
              </div>
            </div>
          </div>
          {/* Feasibility progress bar (0-100); currently hardcoded to 15%) */}
          <FeasibilityBar value={15} />
        </div>
      </div>
    </div>

  );
}