import { useState } from 'react';
import DeptScreen from './DeptScreen';
import TimeScreen from './TimeScreen';
import ArrivalScreen from './ArrivalScreen';
import ArrivalTimeScreen from './ArrivalTimeScreen';
import KnobScreen from './KnobScreen';
import ConfirmScreen from './ConfirmScreen';
import ResultsScreen from './ResultsScreen';
import airportData from "../../global-airports.json";
import MapTilerRadarPreview from "../../components/MapTilerRadarPreview.jsx";

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

const airports = airportData.features
  .map((feature) => {
    const props = feature?.properties || {};
    const iata = props.iata_code;

    if (!iata) return null;

    const name = props.name || "Unknown Airport";
    const city = props.municipality ? ` (${props.municipality})` : "";

    return {
      value: iata,
      label: `${iata} - ${name}${city}`,
    };
  })
  .filter(Boolean)
  .sort((a, b) => a.label.localeCompare(b.label));

const SCREENS = ['dept', 'time', 'arrival', 'arrivalTime', 'carbon', 'weather', 'travel', 'airTraffic', 'confirm', 'results'];

export default function FlightDevice() {
  const [currentScreen, setCurrentScreen] = useState('dept');
  const [deptAirport, setDeptAirport] = useState('');
  const [arrivalAirport, setArrivalAirport] = useState('');
  const [deptTime, setDeptTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [carbonValue, setCarbonValue] = useState(0);
  const [weatherValue, setWeatherValue] = useState(0);
  const [travelValue, setTravelValue] = useState(0);
  const [airTrafficValue, setAirTrafficValue] = useState(0);
  const [optimalPath, setOptimalPath] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const timezone = new Date()
    .toLocaleTimeString('en-US', { timeZoneName: 'short' })
    .split(' ')
    .pop();

  function goNext() {
    const idx = SCREENS.indexOf(currentScreen);
    if (idx < SCREENS.length - 1) setCurrentScreen(SCREENS[idx + 1]);
  }

  function goBack() {
    const idx = SCREENS.indexOf(currentScreen);
    if (idx > 0) setCurrentScreen(SCREENS[idx - 1]);
  }

  function formatDateTime(timeValue) {
    const today = new Date();
    const timeString = timeValue || "00:00";
    const [hours, minutes] = timeString.split(":");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const year = today.getFullYear();
    return `${month}/${day}/${year} ${hours}:${minutes}`;
  }

  async function handleEnter() {
    if (!deptAirport || !arrivalAirport) return;

    const srcC = getAirportCoords(deptAirport);
    const destC = getAirportCoords(arrivalAirport);

    if (!srcC || !destC) return;

    setIsLoading(true);

    try {
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
          WT: travelValue,
          WC: airTrafficValue,
          WW: weatherValue,
          WE: carbonValue
        })
      });

      const data = await response.json();

      setOptimalPath(data.optimal_path);
      setCurrentScreen("results");
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{ width: "800px", height: "480px", overflow: "hidden" }}>
      {currentScreen === 'dept' && (
        <DeptScreen
          value={deptAirport}
          onChange={setDeptAirport}
          airports={airports}
          onNext={goNext}
        />
      )}
      {currentScreen === 'time' && (
        <TimeScreen
          value={deptTime}
          onChange={setDeptTime}
          timezone={timezone}
          onNext={goNext}
          onBack={goBack}
        />
      )}
      {currentScreen === 'arrival' && (
        <ArrivalScreen
          value={arrivalAirport}
          onChange={setArrivalAirport}
          airports={airports}
          onNext={goNext}
          onBack={goBack}
        />
      )}
      {currentScreen === 'arrivalTime' && (
        <ArrivalTimeScreen
          value={arrivalTime}
          onChange={setArrivalTime}
          timezone={timezone}
          onNext={goNext}
          onBack={goBack}
        />
      )}
      {currentScreen === 'carbon' && (
        <KnobScreen
          label="Carbon Emissions"
          value={carbonValue}
          onChange={setCarbonValue}
          onNext={goNext}
          onBack={goBack}
        />
      )}
      {currentScreen === 'weather' && (
        <KnobScreen
          label="Weather Safety"
          value={weatherValue}
          onChange={setWeatherValue}
          onNext={goNext}
          onBack={goBack}
        />
      )}
      {currentScreen === 'travel' && (
        <KnobScreen
          label="Travel Time"
          value={travelValue}
          onChange={setTravelValue}
          onNext={goNext}
          onBack={goBack}
        />
      )}
      {currentScreen === 'airTraffic' && (
        <KnobScreen
          label="Air Traffic"
          value={airTrafficValue}
          onChange={setAirTrafficValue}
          onNext={goNext}
          onBack={goBack}
        />
      )}
      {currentScreen === 'confirm' && (
        <ConfirmScreen
          deptAirport={deptAirport}
          arrivalAirport={arrivalAirport}
          deptTime={deptTime}
          arrivalTime={arrivalTime}
          timezone={timezone}
          carbonValue={carbonValue}
          weatherValue={weatherValue}
          travelValue={travelValue}
          airTrafficValue={airTrafficValue}
          onBack={goBack}
          onEnter={handleEnter}
        />
      )}
      {currentScreen === 'results' && (
        <ResultsScreen
          pathPoints={optimalPath}
          startDate={formatDateTime(deptTime)}
          endDate={formatDateTime(arrivalTime || deptTime)}
          feasibilityValue={15}
          onNewFlight={() => setCurrentScreen('dept')}
        />
      )}
    </div>
  );
}