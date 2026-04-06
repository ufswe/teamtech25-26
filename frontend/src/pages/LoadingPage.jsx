import { useEffect, useState } from "react";
import "../styles/loading.css";

import globe1 from "../assets/globe1.png";
import globe2 from "../assets/globe2.png";
import globe3 from "../assets/globe3.png";
import globe4 from "../assets/globe4.png";

const GLOBE_FRAMES = [globe1, globe2, globe3, globe4];

export default function LoadingScreen({ isLoading, message = "" }) {
  const [frameIdx, setFrameIdx] = useState(0); 
  const [dots, setDots] = useState("");
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIdx(prev => (prev + 1) % GLOBE_FRAMES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const dotStates = ["", "", "", ""];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % dotStates.length;
      setDots(dotStates[i]);
    }, 450);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isLoading) setFadeOut(true);
  }, [isLoading]);

  if (!isLoading && fadeOut) return null;

  return (
    <div className={`ls-screen${fadeOut ? " ls-fade-out" : ""}`}>
      <div className="ls-globe-wrapper">
        <div className="ls-glow" aria-hidden="true" />
        <img
          src={GLOBE_FRAMES[frameIdx]}  // ← now frameIdx exists
          alt=""
          className="ls-globe"
        />
      </div>
      <p className="ls-text">
        {message}
        <span className="ls-dots" aria-hidden="true">{dots}</span>
      </p>
    </div>
  );
}