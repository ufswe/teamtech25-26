import { useEffect, useMemo, useRef, useState } from "react";
import * as maptilersdk from "@maptiler/sdk";
import { RadarLayer } from "@maptiler/weather";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import "./MapTilerRadarPreview.css";
import airportData from "../global-airports.json";

// This is the new version of the Map component using maptiler with an animated weather radar

const MAPTILER_KEY = "dT0LApeCkzfKLrNt5WIZ";
const DEFAULT_START_DATE = "4/6/2026 00:00";
const DEFAULT_END_DATE = "4/8/2026 00:00";
const RADAR_SPEED_FACTOR = 14400; // 1 real second = 4 forecast hours

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

const getRadarRange = (layerStart, layerEnd, selectedStart, selectedEnd) => {
  if (!layerStart || !layerEnd) return { start: 0, end: 0 };
  const hasStart = Number.isFinite(selectedStart);
  const hasEnd = Number.isFinite(selectedEnd);
  let rangeStart = hasStart ? clamp(selectedStart, layerStart, layerEnd) : layerStart;
  let rangeEnd = hasEnd ? clamp(selectedEnd, layerStart, layerEnd) : layerEnd;
  rangeStart = Math.min(rangeStart, rangeEnd);
  rangeEnd = Math.max(rangeStart, rangeEnd);
  if (rangeEnd - rangeStart < 3600) {
    rangeEnd = Math.min(rangeStart + 3600, layerEnd);
  }
  return { start: rangeStart, end: rangeEnd };
};



export default function MapTilerRadarPreview({
  weatherRadarVisible = true,
  pathPoints = [],
  startDate = DEFAULT_START_DATE,
  endDate = DEFAULT_END_DATE,
  selectedAirports = [],
  onMapReady = () => {}
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
  const [mapReady, setMapReady] = useState(false);
  const [radarPlaying, setRadarPlaying] = useState(true);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [wasPlayingBeforeScrub, setWasPlayingBeforeScrub] = useState(false);
  const playAnchorRef = useRef({ time: 0, realMs: 0 });
  const animationRef = useRef({ rafId: null, lastMs: 0, time: 0 });
  const restoreViewRef = useRef(false);


  const bringPathToFront = () => {
    if (!mapRef.current) return;
    if (mapRef.current.getLayer("flight-path")) {
      mapRef.current.moveLayer("flight-path");
    }
  };

  const setupRadarLayer = (mapInstance) => {
    if (!mapInstance) return;
    // We already call setup from map "load", so don't block on styleLoaded here.

    if (radarLayerRef.current) {
      try {
        const existingId = radarLayerRef.current.id;
        if (existingId && mapInstance.getLayer && mapInstance.getLayer(existingId)) {
          mapInstance.removeLayer(existingId);
        } else {
          mapInstance.removeLayer(radarLayerRef.current);
        }
      } catch {
        // ignore
      }
      radarLayerRef.current = null;
    }

    setRadarTime(null);
    setDisplayTime(null);
    setRadarRange({ start: 0, end: 0 });
    setRadarReady(false);

    const radarLayer = new RadarLayer({ opacity: 0.85 });
    radarLayerRef.current = radarLayer;
    const handleSourceReady = () => {
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
    };

    // Wire listeners before adding the layer so we don't miss a fast "sourceReady".
    radarLayer.on("sourceReady", handleSourceReady);
    radarLayer.on("tick", (event) => {
      if (!radarPlaying || isScrubbing) {
        setRadarTime(event.time);
        setDisplayTime(event.time);
        playAnchorRef.current = { time: event.time, realMs: Date.now() };
      }
    });

    mapInstance.addLayer(radarLayer);
    bringPathToFront();

    // If the source is already ready, sync immediately on next frame.
    requestAnimationFrame(() => {
      const layerStart = radarLayer.getAnimationStart?.();
      const layerEnd = radarLayer.getAnimationEnd?.();
      if (Number.isFinite(layerStart) && Number.isFinite(layerEnd)) {
        handleSourceReady();
      }
    });

    if (typeof radarLayer.onSourceReadyAsync === "function") {
      radarLayer.onSourceReadyAsync().then(() => handleSourceReady());
    }
  };

  const selectedCoords = useMemo(() => (
    airportData.features
      .filter((feature) => selectedAirports.includes(feature.properties.iata_code))
      .map((feature) => {
        const [lng, lat] = feature.geometry.coordinates;
        return [lat, lng];
      })
      .filter(Boolean)
  ), [selectedAirports]);

  const waypointPath = useMemo(() => {
    if (Array.isArray(pathPoints) && pathPoints.length) return pathPoints;
    if (selectedCoords.length) return selectedCoords;
    return [];
  }, [pathPoints, selectedCoords]);

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

    const storedView = sessionStorage.getItem("flight.mapView");
    let initialCenter = [-98.5, 39.5];
    let initialZoom = 3;
    if (storedView) {
      try {
        const parsed = JSON.parse(storedView);
        if (Array.isArray(parsed.center) && parsed.center.length === 2) {
          initialCenter = parsed.center;
        }
        if (typeof parsed.zoom === "number") {
          initialZoom = parsed.zoom;
        }
        restoreViewRef.current = true;
      } catch {
        // ignore
      }
    }

    maptilersdk.config.apiKey = MAPTILER_KEY;
    const map = new maptilersdk.Map({
      container: mapContainerRef.current,
      style: `https://api.maptiler.com/maps/dataviz-v4/style.json?key=${MAPTILER_KEY}`,
      center: initialCenter,
      zoom: initialZoom,
      navigationControl: false
    });

    mapRef.current = map;
    map.on("moveend", () => {
      const center = map.getCenter();
      sessionStorage.setItem("flight.mapView", JSON.stringify({
        center: [center.lng, center.lat],
        zoom: map.getZoom()
      }));
    });

    map.on("load", () => {
      setMapReady(true);
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

      setupRadarLayer(map);
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

  const depMarkerRef = useRef(null);
  const arrMarkerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    if (!waypointPath.length) {
      if (depMarkerRef.current) depMarkerRef.current.remove();
      if (arrMarkerRef.current) arrMarkerRef.current.remove();
      depMarkerRef.current = null;
      arrMarkerRef.current = null;
      return;
    }

    const first = waypointPath[0];
    const last = waypointPath[waypointPath.length - 1];

    if (!depMarkerRef.current) {
      depMarkerRef.current = new maptilersdk.Marker({ color: "#78B4F9" })
        .setLngLat([first[1], first[0]])
        .addTo(mapRef.current);
    } else {
      depMarkerRef.current.setLngLat([first[1], first[0]]);
    }

    if (!arrMarkerRef.current) {
      arrMarkerRef.current = new maptilersdk.Marker({ color: "#1D3557" })
        .setLngLat([last[1], last[0]])
        .addTo(mapRef.current);
    } else {
      arrMarkerRef.current.setLngLat([last[1], last[0]]);
    }
  }, [waypointPath, mapReady]);

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
    bringPathToFront();
    onMapReady();
  }, [lineFeature]);

  useEffect(() => {
    if (!mapRef.current || !waypointPath.length) return;
    if (restoreViewRef.current) {
      restoreViewRef.current = false;
      return;
    }
    if (waypointPath.length === 1) {
      const [lat, lng] = waypointPath[0];
      mapRef.current.easeTo({ center: [lng, lat], zoom: 6, duration: 900 });
      return;
    }
    const bounds = waypointPath.reduce((acc, [lat, lng]) => {
      acc.extend([lng, lat]);
      return acc;
    }, new maptilersdk.LngLatBounds(
      [waypointPath[0][1], waypointPath[0][0]],
      [waypointPath[0][1], waypointPath[0][0]]
    ));
    mapRef.current.fitBounds(bounds, { padding: 70, duration: 1200, maxZoom: 6 });
  }, [waypointPath]);

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

  useEffect(() => {
    if (!mapReady || !weatherRadarVisible) return;
    setupRadarLayer(mapRef.current);
  }, [mapReady, weatherRadarVisible]);

  useEffect(() => {
    const handleVisibility = () => {
      if (!mapRef.current) return;
      mapRef.current.resize();
      if (!weatherRadarVisible && radarLayerRef.current && radarReady) {
        const time = displayTime || radarRange.start;
        if (time) radarLayerRef.current.setAnimationTime(time);
        radarLayerRef.current.setOpacity(0);
      }
      bringPathToFront();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleVisibility);
    window.addEventListener("resize", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleVisibility);
      window.removeEventListener("resize", handleVisibility);
    };
  }, [displayTime, radarRange.start, radarReady, weatherRadarVisible]);

  useEffect(() => {
    if (weatherRadarVisible) {
      setRadarPlaying(true);
    } else {
      setRadarPlaying(false);
    }
  }, [weatherRadarVisible]);

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
      mapRef.current.easeTo({ center: [lng, lat], zoom: 6, duration: 900 });
      return;
    }
    const bounds = waypointPath.reduce((acc, [lat, lng]) => {
      acc.extend([lng, lat]);
      return acc;
    }, new maptilersdk.LngLatBounds(
      [waypointPath[0][1], waypointPath[0][0]],
      [waypointPath[0][1], waypointPath[0][0]]
    ));
    mapRef.current.fitBounds(bounds, { padding: 70, duration: 1200, maxZoom: 6 });
  };

  return (
    <div className="maptiler-preview-wrapper">
      <div
        ref={wrapperRef}
        style={containerStyle}
        className={`maptiler-preview ${fullscreen ? "maptiler-preview--fullscreen" : ""}`}
      >
        <div ref={mapContainerRef} className="maptiler-preview__map" />
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
            -
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
        <span className="maptiler-preview__fullscreen-icon">[ ]</span>
      </button>
        {weatherRadarVisible ? (
          <>
            <div className="maptiler-preview__time">
              <div className="maptiler-preview__time-text">
                {Number.isFinite(displayTime)
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
          </>
        ) : null}
      </div>
      {weatherRadarVisible ? (
        <div className="maptiler-preview__range maptiler-preview__range--below">
          *Weather API only shows 5 days in the future.
        </div>
      ) : null}
    </div>
  );
}
