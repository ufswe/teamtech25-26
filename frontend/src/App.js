import { BrowserRouter, Routes, Route } from "react-router-dom";
import Flight from "./pages/Flight";
import useBackendStatus from "./hooks/useBackendStatus";

function App() {
  const statusMessage = useBackendStatus();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Flight />} />
      </Routes>

      {/* <div style={{ position: "fixed", bottom: 10, right: 10 }}>
        {statusMessage}
      </div> */}
    </BrowserRouter>
  );
}

export default App;