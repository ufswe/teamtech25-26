import { BrowserRouter, Routes, Route } from "react-router-dom";
import Flight from "./pages/Flight";
import About from "./pages/About";
import Navbar from "./components/layout/Navbar";
import useBackendStatus from "./hooks/useBackendStatus";

function App() {
  const statusMessage = useBackendStatus();
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Flight />} />
        <Route path="/flight" element={<Flight />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;