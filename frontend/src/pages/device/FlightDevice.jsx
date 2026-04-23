import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import DeptScreen from './DeptScreen';
import TimeScreen from './TimeScreen';
import ArrivalScreen from './ArrivalScreen';
import ArrivalTimeScreen from './ArrivalTimeScreen';
import KnobScreen from './KnobScreen';
import ConfirmScreen from './ConfirmScreen';
import ResultsScreen from './ResultsScreen';
import airportData from "../../global-airports.json";

const getAirportCoords = (iata) => {
  const airport = airportData.features.find(
    (feature) => feature.properties.iata_code === iata
  );
  if (airport) {
    const [lng, lat] = airport.geometry.coordinates;
    return { lat, lng };
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
    return { value: iata, label: `${iata} - ${name}${city}` };
  })
  .filter(Boolean)
  .sort((a, b) => a.label.localeCompare(b.label));

const SCREENS = ['dept', 'time', 'arrival', 'arrivalTime', 'carbon', 'weather', 'travel', 'airTraffic', 'confirm', 'results'];

const getCurrentTime = () => {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return { hour: hours, minute: minutes, period };
};

const formatTime = (t) => `${t.hour}:${String(t.minute).padStart(2, '0')} ${t.period}`;

const formatDateTime = (timeValue) => {
  const today = new Date();
  const timeString = timeValue || "00:00";
  const [hours, minutes] = timeString.split(":");
  const month  = String(today.getMonth() + 1).padStart(2, "0");
  const day    = String(today.getDate()).padStart(2, "0");
  const year   = today.getFullYear();
  return `${month}/${day}/${year} ${hours}:${minutes}`;
};

// ── Socket created ONCE outside component ─────────────────────
const socket = io('http://localhost:5001', { transports: ['websocket'] });

export default function FlightDevice() {
  const [currentScreen, setCurrentScreen]       = useState('dept');
  const [deptAirport, setDeptAirport]           = useState('');
  const [arrivalAirport, setArrivalAirport]     = useState('');
  const [deptTime, setDeptTime]                 = useState(formatTime(getCurrentTime()));
  const [arrivalTime, setArrivalTime]           = useState(formatTime(getCurrentTime()));
  const [carbonValue, setCarbonValue]           = useState(0);
  const [weatherValue, setWeatherValue]         = useState(0);
  const [travelValue, setTravelValue]           = useState(0);
  const [airTrafficValue, setAirTrafficValue]   = useState(0);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [timeState, setTimeState]               = useState({ ...getCurrentTime(), stage: 'hour' });
  const [optimalPath, setOptimalPath]           = useState(null);
  const [isLoading, setIsLoading]               = useState(false);

  const screenRef     = useRef(currentScreen);
  const lastUpdateRef = useRef(0);

  useEffect(() => { screenRef.current = currentScreen; }, [currentScreen]);

  // ── API call on confirm ────────────────────────────────────
  async function handleEnter() {
    if (!deptAirport || !arrivalAirport) return;
    const srcC  = getAirportCoords(deptAirport);
    const destC = getAirportCoords(arrivalAirport);
    if (!srcC || !destC) return;
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5001/api/optimal-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          src_lat:   srcC.lat,
          src_long:  srcC.lng,
          dest_lat:  destC.lat,
          dest_long: destC.lng
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

  // ── Hardware socket ────────────────────────────────────────
  useEffect(() => {
    socket.on('connect',    () => console.log('[Hardware] Socket connected ✓'));
    socket.on('disconnect', () => console.log('[Hardware] Socket disconnected'));

    socket.on('hardware_event', (data) => {
      const screen = screenRef.current;
      console.log('[Hardware]', data);

      // Power button
      if (data.type === 'power' && data.value === 'off') {
        document.body.style.background = '#000';
        document.getElementById('root').style.display = 'none';
        return;
      }
      if (data.type === 'power' && data.value === 'on') {
        document.body.style.background = '';
        document.getElementById('root').style.display = '';
        return;
      }

      // Encoder push — cycle time stage
      if (data.type === 'encoder_press') {
        setTimeState(prev => {
          const stages = ['hour', 'minute', 'period'];
          const next = stages[(stages.indexOf(prev.stage) + 1) % stages.length];
          return { ...prev, stage: next };
        });
        return;
      }

      // Enter button — next screen (confirm triggers API)
      if (data.type === 'button_enter') {
        if (screen === 'confirm') {
          handleEnter();
          return;
        }
        setCurrentScreen(prev => {
          const idx = SCREENS.indexOf(prev);
          return idx < SCREENS.length - 1 ? SCREENS[idx + 1] : prev;
        });
        setHighlightedIndex(-1);
        setTimeState({ ...getCurrentTime(), stage: 'hour' });
        return;
      }

      // Clear button
      if (data.type === 'button_clear') {
        if (screen === 'dept')         setDeptAirport('');
        if (screen === 'arrival')      setArrivalAirport('');
        if (screen === 'time')         setDeptTime(formatTime(getCurrentTime()));
        if (screen === 'arrivalTime')  setArrivalTime(formatTime(getCurrentTime()));
        if (screen === 'carbon')       setCarbonValue(0);
        if (screen === 'weather')      setWeatherValue(0);
        if (screen === 'travel')       setTravelValue(0);
        if (screen === 'airTraffic')   setAirTrafficValue(0);
        setHighlightedIndex(-1);
        setTimeState({ ...getCurrentTime(), stage: 'hour' });
        return;
      }

      // Encoder rotate
      if (data.type === 'encoder_rotate') {
        const now = Date.now();
        if (now - lastUpdateRef.current < 100) return;
        lastUpdateRef.current = now;

        const step = data.direction === 'cw' ? 1 : -1;

        if (screen === 'dept' || screen === 'arrival') {
          setHighlightedIndex(prev => {
            const next = (prev + step + airports.length) % airports.length;
            if (screen === 'dept')    setDeptAirport(airports[next].value);
            if (screen === 'arrival') setArrivalAirport(airports[next].value);
            return next;
          });
          return;
        }

        if (screen === 'time' || screen === 'arrivalTime') {
          setTimeState(prev => {
            const next = { ...prev };
            if (prev.stage === 'hour') {
              next.hour = prev.hour + step;
              if (next.hour > 12) next.hour = 1;
              if (next.hour < 1)  next.hour = 12;
            } else if (prev.stage === 'minute') {
              next.minute = (prev.minute + step + 60) % 60;
            } else if (prev.stage === 'period') {
              next.period = prev.period === 'AM' ? 'PM' : 'AM';
            }
            const formatted = formatTime(next);
            if (screen === 'time')        setDeptTime(formatted);
            if (screen === 'arrivalTime') setArrivalTime(formatted);
            return next;
          });
          return;
        }

        if (screen === 'carbon')     setCarbonValue(v     => Math.min(100, Math.max(0, v + (step * 2))));
        if (screen === 'weather')    setWeatherValue(v    => Math.min(100, Math.max(0, v + (step * 2))));
        if (screen === 'travel')     setTravelValue(v     => Math.min(100, Math.max(0, v + (step * 2))));
        if (screen === 'airTraffic') setAirTrafficValue(v => Math.min(100, Math.max(0, v + (step * 2))));
      }
    });

    return () => socket.off('hardware_event');
  }, []);

  const timezone = new Date()
    .toLocaleTimeString('en-US', { timeZoneName: 'short' })
    .split(' ').pop();

  return (
    <div style={{ width:"800px", height:"480px", overflow:"hidden", background:"#1a1a2e" }}>

      {currentScreen === 'dept' &&
        <DeptScreen value={deptAirport} airports={airports} highlightedIndex={highlightedIndex}
          onNext={() => setCurrentScreen('time')} />}

      {currentScreen === 'time' &&
        <TimeScreen value={deptTime} stage={timeState.stage} timezone={timezone}
          onNext={() => setCurrentScreen('arrival')} onBack={() => setCurrentScreen('dept')} />}

      {currentScreen === 'arrival' &&
        <ArrivalScreen value={arrivalAirport} airports={airports} highlightedIndex={highlightedIndex}
          onNext={() => setCurrentScreen('arrivalTime')} onBack={() => setCurrentScreen('time')} />}

      {currentScreen === 'arrivalTime' &&
        <ArrivalTimeScreen value={arrivalTime} stage={timeState.stage} timezone={timezone}
          onNext={() => setCurrentScreen('carbon')} onBack={() => setCurrentScreen('arrival')} />}

      {currentScreen === 'carbon' &&
        <KnobScreen label="Carbon Emissions" value={carbonValue} onChange={setCarbonValue}
          onNext={() => setCurrentScreen('weather')} onBack={() => setCurrentScreen('arrivalTime')} />}

      {currentScreen === 'weather' &&
        <KnobScreen label="Weather Safety" value={weatherValue} onChange={setWeatherValue}
          onNext={() => setCurrentScreen('travel')} onBack={() => setCurrentScreen('carbon')} />}

      {currentScreen === 'travel' &&
        <KnobScreen label="Travel Time" value={travelValue} onChange={setTravelValue}
          onNext={() => setCurrentScreen('airTraffic')} onBack={() => setCurrentScreen('weather')} />}

      {currentScreen === 'airTraffic' &&
        <KnobScreen label="Air Traffic" value={airTrafficValue} onChange={setAirTrafficValue}
          onNext={() => setCurrentScreen('confirm')} onBack={() => setCurrentScreen('travel')} />}

      {currentScreen === 'confirm' &&
        <ConfirmScreen deptAirport={deptAirport} arrivalAirport={arrivalAirport}
          deptTime={deptTime} arrivalTime={arrivalTime} timezone={timezone}
          carbonValue={carbonValue} weatherValue={weatherValue}
          travelValue={travelValue} airTrafficValue={airTrafficValue}
          onBack={() => setCurrentScreen('airTraffic')}
          onEnter={handleEnter} />}

      {currentScreen === 'results' &&
        <ResultsScreen
          pathPoints={optimalPath}
          startDate={formatDateTime(deptTime)}
          endDate={formatDateTime(arrivalTime || deptTime)}
          feasibilityValue={15}
          onNewFlight={() => setCurrentScreen('dept')} />}

    </div>
  );
}
