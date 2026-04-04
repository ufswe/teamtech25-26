import { BrowserRouter, Routes, Route } from "react-router-dom";
import Flight from "./pages/Flight";
import About from "./pages/About";
import Navbar from "./components/layout/Navbar";
import Home from "./pages/Home";
import useBackendStatus from "./hooks/useBackendStatus";
import FlightHistory from "./pages/FlightHistory";

function App() {
  const statusMessage = useBackendStatus();
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/flight" element={<Flight />} />
        <Route path="/about" element={<About />} />
        <Route path="/flight-history" element={<FlightHistory />} /> {/* added route for flight history page */}
      </Routes>
    </BrowserRouter>
  );
}
export default App;