import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
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

const getCurrentTime = () => {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return { hour: hours, minute: minutes, period };
};

const formatTime = (t) => `${t.hour}:${String(t.minute).padStart(2, '0')} ${t.period}`;

// ── Socket created ONCE outside component so it never resets ──
const socket = io('http://localhost:5001', { transports: ['websocket'] });

export default function FlightDevice() {
  const [currentScreen, setCurrentScreen]     = useState('dept');
  const [deptAirport, setDeptAirport]         = useState('');
  const [arrivalAirport, setArrivalAirport]   = useState('');
  const [deptTime, setDeptTime]               = useState(formatTime(getCurrentTime()));
  const [arrivalTime, setArrivalTime]         = useState(formatTime(getCurrentTime()));
  const [carbonValue, setCarbonValue]         = useState(0);
  const [weatherValue, setWeatherValue]       = useState(0);
  const [travelValue, setTravelValue]         = useState(0);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [timeState, setTimeState]             = useState({ ...getCurrentTime(), stage: 'hour' });

  // ── Refs so event handler always sees latest values ───────
  // (avoids stale closure problem inside socket.on)
  const screenRef       = useRef(currentScreen);
  const timeStateRef    = useRef(timeState);
  const lastUpdateRef   = useRef(0);  // debounce timestamp

  useEffect(() => { screenRef.current = currentScreen; }, [currentScreen]);
  useEffect(() => { timeStateRef.current = timeState; }, [timeState]);

  useEffect(() => {
    socket.on('connect', () => console.log('[Hardware] Socket connected ✓'));
    socket.on('disconnect', () => console.log('[Hardware] Socket disconnected'));

    socket.on('hardware_event', (data) => {
      const screen = screenRef.current;
      console.log('[Hardware]', data);
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

      // ── Encoder push: cycle hour → minute → period ────────
      if (data.type === 'encoder_press') {
        setTimeState(prev => {
          const stages = ['hour', 'minute', 'period'];
          const next = stages[(stages.indexOf(prev.stage) + 1) % stages.length];
          return { ...prev, stage: next };
        });
        return;
      }

      // ── Enter: go to next screen ──────────────────────────
      if (data.type === 'button_enter') {
        setCurrentScreen(prev => {
          const idx = SCREENS.indexOf(prev);
          return idx < SCREENS.length - 1 ? SCREENS[idx + 1] : prev;
        });
        setHighlightedIndex(0);
        setTimeState({ ...getCurrentTime(), stage: 'hour' });
        return;
      }

      // ── Clear: reset current screen value ─────────────────
      if (data.type === 'button_clear') {
        if (screen === 'dept')        setDeptAirport('');
        if (screen === 'arrival')     setArrivalAirport('');
        if (screen === 'time')        setDeptTime(formatTime(getCurrentTime()));
        if (screen === 'arrivalTime') setArrivalTime(formatTime(getCurrentTime()));
        if (screen === 'carbon')      setCarbonValue(0);
        if (screen === 'weather')     setWeatherValue(0);
        if (screen === 'travel')      setTravelValue(0);
        setHighlightedIndex(0);
        setTimeState({ ...getCurrentTime(), stage: 'hour' });
        return;
      }

      // ── Encoder rotate ────────────────────────────────────
      if (data.type === 'encoder_rotate') {
        // Debounce: ignore if less than 100ms since last event
        const now = Date.now();
        if (now - lastUpdateRef.current < 100) return;
        lastUpdateRef.current = now;

        const step = data.direction === 'cw' ? 1 : -1;

        // Airport dropdown screens
        if (screen === 'dept' || screen === 'arrival') {
          setHighlightedIndex(prev => {
            const next = (prev + step + airports.length) % airports.length;
            if (screen === 'dept')    setDeptAirport(airports[next].value);
            if (screen === 'arrival') setArrivalAirport(airports[next].value);
            return next;
          });
          return;
        }

        // Time screens — adjust only the active stage by exactly 1
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

        // Knob screens
        if (screen === 'carbon')  setCarbonValue(v  => Math.min(100, Math.max(0, v + (step * 2))));
        if (screen === 'weather') setWeatherValue(v => Math.min(100, Math.max(0, v + (step * 2))));
        if (screen === 'travel')  setTravelValue(v  => Math.min(100, Math.max(0, v + (step * 2))));
      }
    });

    // Cleanup listeners on unmount (socket itself stays alive)
    return () => socket.off('hardware_event');
  }, []); // ← empty deps: runs once, never recreates socket

  const timezone = new Date()
    .toLocaleTimeString('en-US', { timeZoneName: 'short' })
    .split(' ').pop();

  return (
    <div style={{ width: "800px", height: "480px", overflow: "hidden", background: "#1a1a2e" }}>
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
        <KnobScreen label="Carbon Emissions" value={carbonValue}
          onNext={() => setCurrentScreen('weather')} onBack={() => setCurrentScreen('arrivalTime')} />}

      {currentScreen === 'weather' &&
        <KnobScreen label="Weather Safety" value={weatherValue}
          onNext={() => setCurrentScreen('travel')} onBack={() => setCurrentScreen('carbon')} />}

      {currentScreen === 'travel' &&
        <KnobScreen label="Travel Time" value={travelValue}
          onNext={() => setCurrentScreen('confirm')} onBack={() => setCurrentScreen('weather')} />}

      {currentScreen === 'confirm' &&
        <ConfirmScreen deptAirport={deptAirport} arrivalAirport={arrivalAirport}
          deptTime={deptTime} arrivalTime={arrivalTime} timezone={timezone}
          carbonValue={carbonValue} weatherValue={weatherValue} travelValue={travelValue}
          onBack={() => setCurrentScreen('travel')}
          onEnter={() => setCurrentScreen('results')} />}

      {currentScreen === 'results' &&
        <ResultsScreen startDate={deptTime} endDate={arrivalTime} feasibilityValue={15}
          onNewFlight={() => setCurrentScreen('dept')} />}
    </div>
  );
}
