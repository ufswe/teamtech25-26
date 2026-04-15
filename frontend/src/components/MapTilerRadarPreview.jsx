import { useEffect, useMemo, useRef, useState } from "react";
import * as maptilersdk from "@maptiler/sdk";
import { RadarLayer } from "@maptiler/weather";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import "./MapTilerRadarPreview.css";
import airportData from "../global-airports.json";

// This is the new version of the Map component using maptiler  with an animated weather radar
// the old version is map.jsx and .css 

// api keys 
const MAPTILER_KEY = "dT0LApeCkzfKLrNt5WIZ";
const DEFAULT_START_DATE = "4/6/2026 00:00"; // !! DONT PUT PAST DATES ONLY FUTURE 
const DEFAULT_END_DATE = "4/8/2026 00:00";
const RADAR_SPEED_FACTOR = 14400; // 1 real second = 4 forecast hours


// this converts the string date into numbers 
const parseDateInput = (value) => {
  if (!value) return null;
  const match = value.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/
  );
  if (match) {
    const month = Number(match[1]) - 1;
    const day = Number(match[2]);
    const year = Number(match[3]);
    const hour = match[4] ? Number(match[4]) : 0;
    const minute = match[5] ? Number(match[5]) : 0;
    return Date.UTC(year, month, day, hour, minute) / 1000;
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed / 1000;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);


// this gets the forecast range depending on the dates chosen 
const getRadarRange = (layerStart, layerEnd, selectedStart, selectedEnd) => {
  if (!layerStart || !layerEnd) return { start: 0, end: 0 };
  const hasStart = Number.isFinite(selectedStart);
  const hasEnd = Number.isFinite(selectedEnd);
  let rangeStart = hasStart ? clamp(selectedStart, layerStart, layerEnd) : layerStart;
  let rangeEnd = hasEnd ? clamp(selectedEnd, layerStart, layerEnd) : layerEnd;
  rangeStart = Math.min(rangeStart, rangeEnd);
  rangeEnd = Math.max(rangeStart, rangeEnd);
  if (rangeEnd - rangeStart < 3600) {
    rangeStart = layerStart;
    rangeEnd = layerEnd;
  }
  return { start: rangeStart, end: rangeEnd };
};


// // this uses the iata code to get the coords of an airport 
// const getAirportCoords = (iata) => {
//   const airport = airportData.features.find(
//     (feature) => feature.properties.iata_code === iata
//   );
//   if (airport) {
//     const [lng, lat] = airport.geometry.coordinates;
//     return {lat, lng};
//   }
//   return null;
// };

// // hardcoded for testing 
// const departureIATA = "GNV";
// const arrivalIATA = "MCO";

// // the center for the markers of the departure and arrival airport markers 
// const dICenter = getAirportCoords(departureIATA);
// const oICenter = getAirportCoords(arrivalIATA);

// map function
export default function MapTilerRadarPreview({
  weatherRadarVisible = true,
  pathPoints = [],  // PASS THE NODE COORDINATES HERE AS AN ARRAY OF [LAT, LNG]
  startDate = DEFAULT_START_DATE,
  endDate = DEFAULT_END_DATE
}) {
  const [fullscreen, setFullscreen] = useState(false);
  const [containerStyle, setContainerStyle] = useState({});
  const mapContainerRef = useRef(null);
  const wrapperRef = useRef(null);
  const mapRef = useRef(null);
  const radarLayerRef = useRef(null);
  const lineFeatureRef = useRef(null);
  const datesRef = useRef({ startDate, endDate });

  const [radarTime, setRadarTime] = useState(null);
  const [displayTime, setDisplayTime] = useState(null);
  const [radarRange, setRadarRange] = useState({ start: 0, end: 0 });
  const [radarReady, setRadarReady] = useState(false);
  const [radarPlaying, setRadarPlaying] = useState(true);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [wasPlayingBeforeScrub, setWasPlayingBeforeScrub] = useState(false);
  const playAnchorRef = useRef({ time: 0, realMs: 0 });
  const animationRef = useRef({ rafId: null, lastMs: 0, time: 0 });
  const [hoverInfo, setHoverInfo] = useState("");
  const hoverRafRef = useRef(null);
  const DEBUG_OVERLAY = false;

  const waypointPath = useMemo(() => {
    if (Array.isArray(pathPoints) && pathPoints.length) return pathPoints;
    return [];
  }, [pathPoints]);

  const lineFeature = useMemo(() => ({
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: waypointPath.map(([lat, lng]) => [lng, lat])
    },
    properties: {}
  }), [waypointPath]);

  useEffect(() => {
    lineFeatureRef.current = lineFeature;
  }, [lineFeature]);

  useEffect(() => {
    datesRef.current = { startDate, endDate };
  }, [startDate, endDate]);

  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    maptilersdk.config.apiKey = MAPTILER_KEY;
    const map = new maptilersdk.Map({
      container: mapContainerRef.current,
      style: `https://api.maptiler.com/maps/dataviz-v4/style.json?key=${MAPTILER_KEY}`,
      center: oICenter ? [oICenter[1], oICenter[0]] : [-81.7, 29.2],
      zoom: 6,
      navigationControl: false
    });

    mapRef.current = map;

    map.on("load", () => {
      const initialLine = lineFeatureRef.current || lineFeature;
      if (!map.getSource("flight-path")) {
        map.addSource("flight-path", {
          type: "geojson",
          data: initialLine
        });
        map.addLayer({
          id: "flight-path",
          type: "line",
          source: "flight-path",
          paint: {
            "line-color": "#a3d4ff",
            "line-width": 3
          }
        });
      }

      const radarLayer = new RadarLayer({ opacity: 0.85 });
      radarLayerRef.current = radarLayer;
      map.addLayer(radarLayer);

      // animated weather radar 
      radarLayer.on("sourceReady", () => {
        const { startDate: liveStart, endDate: liveEnd } = datesRef.current || {};
        const layerStart = radarLayer.getAnimationStart();
        const layerEnd = radarLayer.getAnimationEnd();
        const selectedStart = parseDateInput(liveStart);
        const selectedEnd = parseDateInput(liveEnd);
        const range = getRadarRange(layerStart, layerEnd, selectedStart, selectedEnd);
        setRadarRange(range);
        const initialTime = range.start;
        setRadarTime(initialTime);
        setDisplayTime(initialTime);
        playAnchorRef.current = { time: initialTime, realMs: Date.now() };
        radarLayer.setAnimationTime(initialTime);
        setRadarReady(true);
        animationRef.current.time = initialTime;
      });

      radarLayer.on("tick", (event) => {
        if (!radarPlaying || isScrubbing) {
          setRadarTime(event.time);
          setDisplayTime(event.time);
          playAnchorRef.current = { time: event.time, realMs: Date.now() };
        }
      });
    });

    return () => {
      if (animationRef.current.rafId) {
        cancelAnimationFrame(animationRef.current.rafId);
        animationRef.current.rafId = null;
      }
      map.remove();
      mapRef.current = null;
      radarLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!radarReady || !radarLayerRef.current) return;
    const layerStart = radarLayerRef.current.getAnimationStart();
    const layerEnd = radarLayerRef.current.getAnimationEnd();
    const selectedStart = parseDateInput(startDate);
    const selectedEnd = parseDateInput(endDate);
    const range = getRadarRange(layerStart, layerEnd, selectedStart, selectedEnd);
    setRadarRange(range);

    const currentTime = range.start;
    radarLayerRef.current.setAnimationTime(currentTime);
    setRadarTime(currentTime);
    setDisplayTime(currentTime);
    playAnchorRef.current = { time: currentTime, realMs: Date.now() };
    animationRef.current.time = currentTime;
  }, [radarReady, startDate, endDate]);

  useEffect(() => {
    if (!radarPlaying || isScrubbing || !weatherRadarVisible) {
      if (animationRef.current.rafId) {
        cancelAnimationFrame(animationRef.current.rafId);
        animationRef.current.rafId = null;
      }
      return undefined;
    }
    if (!radarRange.start && !radarRange.end) return undefined;

    const step = (timestamp) => {
      if (!radarLayerRef.current) return;
      if (!animationRef.current.lastMs) {
        animationRef.current.lastMs = timestamp;
      }
      const deltaSeconds = (timestamp - animationRef.current.lastMs) / 1000;
      animationRef.current.lastMs = timestamp;

      let nextTime = animationRef.current.time + deltaSeconds * RADAR_SPEED_FACTOR;
      if (nextTime >= radarRange.end) {
        nextTime = radarRange.start;
      }
      animationRef.current.time = nextTime;
      radarLayerRef.current.setAnimationTime(nextTime);
      setRadarTime(nextTime);
      setDisplayTime(nextTime);
      playAnchorRef.current = { time: nextTime, realMs: Date.now() };

      animationRef.current.rafId = requestAnimationFrame(step);
    };

    animationRef.current.lastMs = 0;
    animationRef.current.rafId = requestAnimationFrame(step);
    return () => {
      if (animationRef.current.rafId) {
        cancelAnimationFrame(animationRef.current.rafId);
        animationRef.current.rafId = null;
      }
    };
  }, [radarPlaying, isScrubbing, weatherRadarVisible, radarRange.start, radarRange.end]);

  useEffect(() => {
    if (!mapRef.current) return;
    const source = mapRef.current.getSource("flight-path");
    if (source) source.setData(lineFeature);
  }, [lineFeature]);

  useEffect(() => {
    if (!radarLayerRef.current) return;
    if (!weatherRadarVisible) {
      radarLayerRef.current.setOpacity(0);
      if (animationRef.current.rafId) {
        cancelAnimationFrame(animationRef.current.rafId);
        animationRef.current.rafId = null;
      }
      return;
    }
    radarLayerRef.current.setOpacity(0.85);
  }, [weatherRadarVisible, radarPlaying, isScrubbing]);

  const handlePlayPause = () => {
    setRadarPlaying((prev) => !prev);
    if (radarTime) {
      playAnchorRef.current = { time: radarTime, realMs: Date.now() };
    }
  };

  const handleScrub = (value) => {
    const timeValue = Number(value);
    if (!radarLayerRef.current || Number.isNaN(timeValue)) return;
    const clamped = clamp(timeValue, radarRange.start, radarRange.end);
    radarLayerRef.current.setAnimationTime(clamped);
    setRadarTime(clamped);
    setDisplayTime(clamped);
    playAnchorRef.current = { time: clamped, realMs: Date.now() };
    animationRef.current.time = clamped;
  };

  const handleRecenter = () => {
    if (!mapRef.current) return;
    if (!waypointPath.length) return;
    if (waypointPath.length === 1) {
      const [lat, lng] = waypointPath[0];
      mapRef.current.easeTo({ center: [lng, lat], zoom: 6 });
      return;
    }
    const bounds = waypointPath.reduce((acc, [lat, lng]) => {
      acc.extend([lng, lat]);
      return acc;
    }, new maptilersdk.LngLatBounds(
      [waypointPath[0][1], waypointPath[0][0]],
      [waypointPath[0][1], waypointPath[0][0]]
    ));
    mapRef.current.fitBounds(bounds, { padding: 70, duration: 600, maxZoom: 6 });
  };

  return (
    <div
      ref={wrapperRef}
      style={containerStyle}
      className={`maptiler-preview ${fullscreen ? "maptiler-preview--fullscreen" : ""}`}
      onMouseMove={(event) => {
        if (!DEBUG_OVERLAY) return;
        const { clientX, clientY } = event;
        if (hoverRafRef.current) cancelAnimationFrame(hoverRafRef.current);
        hoverRafRef.current = requestAnimationFrame(() => {
          const el = document.elementFromPoint(clientX, clientY);
          if (!el) return;
          const className = el.className && typeof el.className === "string" ? el.className : "";
          const label = `${el.tagName.toLowerCase()}${className ? `.${className.split(" ").join(".")}` : ""}`;
          setHoverInfo(label);
        });
      }}
      onMouseLeave={() => {
        if (!DEBUG_OVERLAY) return;
        setHoverInfo("");
      }}
    >
      <div ref={mapContainerRef} className="maptiler-preview__map" />
      {DEBUG_OVERLAY ? (
        <div className="maptiler-preview__debug">
          {hoverInfo || "Hover an element to see its class"}
        </div>
      ) : null}
      <div
        className="maptiler-preview__center"
        role="button"
        tabIndex={0}
        onClick={handleRecenter}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleRecenter();
          }
        }}
        aria-label="Recenter map"
      >
        <svg
          className="maptiler-preview__center-icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
          <line x1="12" y1="3" x2="12" y2="6" stroke="currentColor" strokeWidth="2" />
          <line x1="12" y1="18" x2="12" y2="21" stroke="currentColor" strokeWidth="2" />
          <line x1="3" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="2" />
          <line x1="18" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>

      {/* zoom/fullscreen/recenter buttons  */}
      <div className="maptiler-preview__zoom">
        <button
          type="button"
          className="maptiler-preview__zoom-btn"
          onClick={() => mapRef.current && mapRef.current.zoomIn()}
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          className="maptiler-preview__zoom-btn"
          onClick={() => mapRef.current && mapRef.current.zoomOut()}
          aria-label="Zoom out"
        >
          −
        </button>
      </div>
      <button
        type="button"
        className="maptiler-preview__fullscreen"
        onClick={() => {
          if (!wrapperRef.current) return;
          const rect = wrapperRef.current.getBoundingClientRect();
          const header = document.querySelector(".navbar");
          const headerHeight = header ? header.getBoundingClientRect().height : 0;

          if (!fullscreen) {
            setContainerStyle({
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height
            });

            requestAnimationFrame(() => {
              setFullscreen(true);
              setTimeout(() => {
                setContainerStyle({
                  top: `calc(50% + ${headerHeight / 2}px)`,
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "90vw",
                  height: `calc(90vh - ${headerHeight}px)`
                });
              }, 10);
            });
          } else {
            setFullscreen(false);
            setContainerStyle({});
          }

          const start = performance.now();
          const duration = 450;

          const animateResize = (now) => {
            if (mapRef.current) mapRef.current.resize();
            if (now - start < duration) requestAnimationFrame(animateResize);
          };

          requestAnimationFrame(animateResize);
        }}
        aria-label="Toggle fullscreen"
      >
        ⛶
      </button>
      {weatherRadarVisible ? (
        <div className="maptiler-preview__time">
          <div className="maptiler-preview__time-text">
            {displayTime
              ? `Weather Radar: ${new Date(displayTime * 1000).toLocaleString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "UTC"
                })} UTC`
              : "Weather Radar: Loading..."}
          </div>
          {radarRange.end > radarRange.start ? (
            <div className="maptiler-preview__controls">
              <button
                type="button"
                className="maptiler-preview__play"
                onClick={handlePlayPause}
                aria-pressed={radarPlaying}
              >
                {radarPlaying ? "Pause" : "Play"}
              </button>
              <input
                type="range"
                min={radarRange.start}
                max={radarRange.end}
                step="60"
                value={displayTime || radarRange.start}
                onChange={(event) => handleScrub(event.target.value)}
                onMouseDown={() => {
                  setWasPlayingBeforeScrub(radarPlaying);
                  setRadarPlaying(false);
                  setIsScrubbing(true);
                }}
                onMouseUp={() => {
                  setIsScrubbing(false);
                  setRadarPlaying(wasPlayingBeforeScrub);
                }}
                onTouchStart={() => {
                  setWasPlayingBeforeScrub(radarPlaying);
                  setRadarPlaying(false);
                  setIsScrubbing(true);
                }}
                onTouchEnd={() => {
                  setIsScrubbing(false);
                  setRadarPlaying(wasPlayingBeforeScrub);
                }}
                className="maptiler-preview__scrubber"
                aria-label="Weather radar time scrubber"
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
