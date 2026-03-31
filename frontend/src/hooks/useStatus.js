import { useEffect, useState } from "react";
import { fetchStatus } from "../services/api";

export default function useStatus() {
  const [status, setStatus] = useState("Checking...");

  useEffect(() => {
    fetchStatus()
      .then((d) => setStatus(d.message))
      .catch(() => setStatus("Backend offline"));
  }, []);

  return status;
}