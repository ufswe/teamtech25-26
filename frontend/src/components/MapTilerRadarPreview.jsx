import { useEffect, useMemo, useRef, useState } from "react";
import * as maptilersdk from "@maptiler/sdk";
import { RadarLayer } from "@maptiler/weather";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import "./MapTilerRadarPreview.css";
import airportData from "../global-airports.json";
import FlightDevice from "./device/FlightDevice";
// import getAirportCoords from "../components/MapTilerRadarPreview.jsx";

console.log("Flight component rendering");

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

  // 
  

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

  // const handleSubmit = async () => {
  //   setIsLoading(true);
  //   try{
  //     await new Promise(resolve => setTimeout(resolve, 3000));
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }
  const handleSubmit = async () => {
    setIsLoading(true);
    try{
      await new Promise(resolve => setTimeout(resolve, 3000));
    } finally {
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