import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [statusMessage, setStatusMessage] = useState("Checking connection...");

  useEffect(() => {
    fetch("http://localhost:5001/status")
      .then((response) => response.json())
      .then((data) => setStatusMessage(data.message))
      .catch((error) => {
        console.error("Error:", error);
        setStatusMessage("❌ Failed to connect to backend");
      });
  }, []);

  return (
    <div>
      <h1>Team Tech Project 2025-26</h1>
      <h2>{statusMessage}</h2>
    </div>
  );
}

export default App;