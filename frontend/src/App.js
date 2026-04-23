import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Flight from "./pages/Flight";
import FlightDevice from "./pages/device/FlightDevice";
import About from "./pages/About";
import Navbar from "./components/layout/Navbar";
import Home from "./pages/Home";
import FlightHistory from "./pages/FlightHistory";

function App() {
  const isDevice = new URLSearchParams(window.location.search).get("device") === "true";
  return (
    <BrowserRouter>
      {!isDevice && <Navbar />}
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<Home />} />
        <Route path="/flight" element={isDevice ? <FlightDevice /> : <Flight />} />
        <Route path="/about" element={<About />} />
        <Route path="/flight-history" element={<FlightHistory />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
