import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import "../components/Map.css";
import "../styles/flight.css";
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import "react-day-picker/dist/style.css";
import "../components/Map.css";
import "../styles/flight.css";
import FlightMap from "../components/Map";
import MapTilerRadarPreview from "../components/MapTilerRadarPreview.jsx"; // radar overlay component
import Dropdown from "../components/Dropdown.jsx";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import Input from "../components/Input.jsx";
import Knob from "../components/Knob.jsx";
import ToggleSwitch from "../components/ToggleSwitch.jsx"; // toggle for map overlay views
import FeasibilityBar from "../components/FeasibilityBar.jsx"; // horizontal bar showing flight feasibility
import LoadingPage from "../pages/LoadingPage.jsx"
import airportData from "../global-airports.json";
import FlightDevice from "./device/FlightDevice";

console.log("Flight component rendering");

const getAirportCoords = (iata) => {
  const airport = airportData.features.find(
    (feature) => feature.properties.iata_code === iata
  );
  if (airport) {
    const [lng, lat] = airport.geometry.coordinates;
    return {lat, lng};
  }
  return null;
};

export default function Flight() {

  const [searchParams] = useSearchParams();

  const [deptAirport, setDeptAirport] = useState();
  const [arrivalAirport, setArrivalAirport] = useState();
  const [lat, setLat] = useState(null);

  const [deptTime, setDeptTime] = useState();
  const [arrivalTime, setArrivalTime] = useState();

  // Added different Knob Value components
  const [carbonValue, setCarbonValue] = useState(0);
  const [weatherValue, setWeatherValue] = useState(0);
  const [travelValue, setTravelValue] = useState(0);

  // Toggle states for map overlay layers (default both on)
  const [weatherView, setWeatherView] = useState(true);
  const [airTrafficView, setAirTrafficView] = useState(true);

  // TODO: NEEDS TO BE FIXED TO BE DYNAMIC
  const [deptTimezone, setDeptTimezone] = useState("EST");
  const [arrivalTimezone, setArrivalTimezone] = useState("EST");

    const airports = useMemo(() => {
    return airportData.features
      .map((feature) => {
        const props = feature?.properties || {};
        const iata = props.iata_code;
        if (!iata) return null;
        const name = props.name || "Unknown Airport";
        const city = props.municipality ? ` (${props.municipality})` : "";
        return { value: iata, label: `${iata} - ${name}${city}` };
      })
      .filter(Boolean)
      .sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  const departureOptions = useMemo(
    () => airports.filter((airport) => airport.value !== arrivalAirport),
    [airports, arrivalAirport]
  );

  const arrivalOptions = useMemo( 
    () => airports.filter((airport) => airport.value !== deptAirport),
    [airports, deptAirport]  // dropdown options now showing all airports except the one selected in the opposite dropdown
  );

  useEffect(() => {
    if (deptAirport && arrivalAirport && deptAirport === arrivalAirport) {
      setArrivalAirport("");
    }
  }, [deptAirport, arrivalAirport]);

  const [deptDate, setDeptDate] = useState(new Date());
  const [arrivalDate, setArrivalDate] = useState(new Date());
  const [optimalPath, setOptimalPath] = useState([]);   
  const [minCost, setMinCost] = useState(null);         
  const [pathError, setPathError] = useState(null);   

  const formatDateTime = (dateValue, timeValue) => {
    if (!dateValue) return "";
    const dateObj = new Date(dateValue);
    const timeString = timeValue && timeValue.length ? timeValue : "00:00";
    const [hours, minutes] = timeString.split(":");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${month}/${day}/${year} ${hours}:${minutes}`;
  };

  const radarStartDate = formatDateTime(deptDate, deptTime);
  const radarEndDate = formatDateTime(arrivalDate, arrivalTime || deptTime);

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    //Ensure both airports are selected
    if(!deptAirport || !arrivalAirport) {
      console.log("Make sure both airports are selected");
      return;
    }

    //Look up their coordinates
    const srcC = getAirportCoords(deptAirport);
    const destC = getAirportCoords(arrivalAirport);
    if(!srcC || !destC) {
      console.log("Error with fetching src coords or dest coords");
      return;
    }

    //Call Flask
    setIsLoading(true);
    try{
      const response = await fetch("http://localhost:5001/api/optimal-path", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          src_lat: srcC.lat,
          src_long: srcC.lng,
          dest_lat: destC.lat,
          dest_long: destC.lng,
        }),
      });

      //Save the path
      const data = await response.json();
      setOptimalPath(data.optimal_path); // [[lat, lng], [lat, lng], [lat, lng], ...]
    }
    catch(error){
      console.error("Failed to fetch optimal path:", error);
      setPathError("Failed to calculate path");
    }
    finally{
      setIsLoading(false);
    }
  }

  return (
    <div className="flight-page">
      <LoadingPage isLoading={isLoading}/>
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
            < DayPicker 
              mode="single"
              selected={deptDate}
              onSelect={setDeptDate}
              showOutsideDays
              modifiersClassNames={{
                selected: 'dept-date',
                today: 'today-date',
                outside: 'outside-date'
              }}
            />
            <div className="time-input-wrapper">
              <Input
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
            < DayPicker 
              mode="single"
              selected={arrivalDate}
              disabled
              showOutsideDays
              className="readonly-calendar"
              modifiersClassNames={{
                selected: 'dept-date',
                today: 'today-date',
                outside: 'outside-date'
              }}
            />
            <div className="time-input-wrapper">
              <Input
                type="time"
                value={arrivalTime}
                readOnly
              />
              <p className="timezone-label">{deptTimezone}</p>
            </div>
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
            <Button onClick={handleSubmit}>Enter</Button>
          </div>
        </div>
      </div>

      <div className="output-panel">
        <MapTilerRadarPreview
          weatherRadarVisible={weatherView}
          startDate={radarStartDate}
          endDate={radarEndDate}
          pathPoints={optimalPath}
        />
        {/* Info panel: map overlay toggles, flight stats, and feasibility */}
        <div className="info-panel">
          <div className="info-panel-top">
            {/* Left side: toggle switches for map overlays */}
            <div className="info-toggles">
              <ToggleSwitch label="Weather View" isOn={weatherView} onToggle={setWeatherView} />
            </div>
            {/* Right side: computed flight statistics (placeholder values for now) */}
            <div className="info-stats">
              <div className="info-stat-row">
                <span className="info-stat-label">Duration:</span>
                <span className="info-stat-value">Hrs</span>
                <span className="info-stat-value">Mins</span>
                <br />
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
