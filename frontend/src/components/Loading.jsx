import { useState, useEffect } from 'react';
import "../styles/loading.css";

export default function Loading() {
  const [globeIndex, setGlobeIndex] = useState(0);
  const [dots, setDots] = useState('.');

  // Cycle through globe images
  useEffect(() => {
    const globeInterval = setInterval(() => {
      setGlobeIndex((prev) => (prev + 1) % 4);
    }, 500); // Change globe every 500ms

    return () => clearInterval(globeInterval);
  }, []);

  // Animate dots
  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prev) => {
        if (prev === '.') return '..';
        if (prev === '..') return '...';
        return '.';
      });
    }, 1000); // Change dots every 300ms

    return () => clearInterval(dotsInterval);
  }, []);

  const globeImages = [
    require('../assets/globe2.png'),
    require('../assets/globe4.png'),
    require('../assets/globe3.png'),
    require('../assets/globe1.png'),
  ];

  return (
    <div className="ls-screen">
      <div className="ls-globe-wrapper">
        <img
          src={globeImages[globeIndex]}
          alt="Loading globe"
          className="ls-globe"
        />
      </div>
    </div>
  );
}
