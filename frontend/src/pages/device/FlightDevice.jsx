import { useState } from 'react';
import DeptScreen from './DeptScreen';
import TimeScreen from './TimeScreen';
import ArrivalScreen from './ArrivalScreen';
import ArrivalTimeScreen from './ArrivalTimeScreen';
import KnobScreen from './KnobScreen';
import ConfirmScreen from './ConfirmScreen';
import ResultsScreen from './ResultsScreen';

const airports = [
  { value: "airport 1", label: "AP1 - airport 1" },
  { value: "airport 2", label: "AP2 - airport 2" },
  { value: "airport 3", label: "AP3 - airport 3" }
];

const SCREENS = ['dept', 'time', 'arrival', 'arrivalTime', 'carbon', 'weather', 'travel', 'confirm', 'results'];

export default function FlightDevice() {
  const [currentScreen, setCurrentScreen] = useState('dept');
  const [deptAirport, setDeptAirport] = useState('');
  const [arrivalAirport, setArrivalAirport] = useState('');
  const [deptTime, setDeptTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [carbonValue, setCarbonValue] = useState(0);
  const [weatherValue, setWeatherValue] = useState(0);
  const [travelValue, setTravelValue] = useState(0);

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

  function handleEnter() {
    setCurrentScreen('results');
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
          onBack={goBack}
          onEnter={handleEnter}
        />
      )}
      {currentScreen === 'results' && (
        <ResultsScreen
          startDate={formatDateTime(deptTime)}
          endDate={formatDateTime(arrivalTime || deptTime)}
          feasibilityValue={15}
          onNewFlight={() => setCurrentScreen('dept')}
        />
      )}
    </div>
  );
}
