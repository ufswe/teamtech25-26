import "./Map.css";
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, LayerGroup, LayersControl, GeoJSON, Polyline } from 'react-leaflet';
import { useState, useRef, useMemo, useEffect } from 'react'; 
import 'leaflet/dist/leaflet.css';
import airportData from "../global-airports.json";
//airport data from https://github.com/jbrooksuk/JSON-Airports // not anymore, using what backend is using 

// !!!!! This is not the map component being used 
// this is the version using leaflet which did not support an animated weather radar

//API keys
const MAPTILER_KEY = 'dT0LApeCkzfKLrNt5WIZ';


// helper function to get coord by IATA code from airport data 
const getAirportCoords = (iata) => {
    const airport = airportData.features.find(f => f.properties.iata_code === iata);
    if (airport) {
        const [lng, lat] = airport.geometry.coordinates;
        return [lat, lng];
    }
    return null;
};

// update marker position when airports are selected 
const departureIATA = "GNV"; // hardcoded for testing, fix later to be what the user selected 
const arrivalIATA = "MCO";

//initial positions for the markers
const dICenter = getAirportCoords(departureIATA);
const oICenter = getAirportCoords(arrivalIATA);

// zoom to fit map to when airports are selected

const originIcon = new L.Icon({
    iconUrl: '/origin.png', 
    iconRetinaUrl: '/origin.png',
    iconSize: [25, 35],     
    iconAnchor: [12.5, 35],  
});

const destinationIcon = new L.Icon({
    iconUrl: '/destination.png', 
    iconRetinaUrl: '/destination.png',
    iconSize: [25, 35],     
    iconAnchor: [12.5, 35],  
});



//marker still has draggable functionality just in case but i disabled it 
function DraggableMarker({ position, icon }) {
    return <Marker position={position} icon={icon} draggable={false} />;
}

function parseDateInput(value) {
    if (!value) return null;
    const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/);
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
}

function buildHourlyFrames(startDate, endDate) {
    const rangeStart = parseDateInput(startDate);
    const rangeEnd = parseDateInput(endDate);
    if (!rangeStart || !rangeEnd || Number.isNaN(rangeStart) || Number.isNaN(rangeEnd)) {
        return [{ time: Math.floor(Date.now() / 1000) }];
    }
    const min = Math.min(rangeStart, rangeEnd);
    const max = Math.max(rangeStart, rangeEnd);
    const step = 60 * 60; // hourly frames
    const output = [];
    for (let t = min; t <= max; t += step) output.push({ time: t });
    return output.length ? output : [{ time: Math.floor(Date.now() / 1000) }];
}

function selectRadarVariable(variables) {
    if (!Array.isArray(variables)) return null;
    const radarMatch = variables.find((variable) => {
        const meta = variable?.metadata?.weather_variable || {};
        const name = String(meta?.name || "").toLowerCase();
        const id = String(meta?.variable_id || "").toLowerCase();
        return name.includes("radar") || id.includes("radar");
    });
    return radarMatch || null;
}

function RainViewerAnimatedPrecip({ startDate, endDate, frame, onFramesChange, onVisibilityChange }) {
    const [activeFrame, setActiveFrame] = useState(null);
    const [tileOpacity, setTileOpacity] = useState(0.6);

    useEffect(() => {
        return () => {
            if (onVisibilityChange) onVisibilityChange(false);
        };
    }, [onVisibilityChange]);

    useEffect(() => {
        let active = true;
        const rangeStart = parseDateInput(startDate);
        const rangeEnd = parseDateInput(endDate);

        fetch("https://api.rainviewer.com/public/weather-maps.json")
            .then(res => res.json())
            .then(data => {
                if (!active) return;
                const host = data?.host || "https://tilecache.rainviewer.com";
                const past = data?.radar?.past || [];
                const nowcast = data?.radar?.nowcast || [];
                const merged = [...past, ...nowcast].filter(f => f && f.time && f.path);

                let frames = merged.map(f => ({
                    time: f.time,
                    path: f.path,
                    host
                }));

                if (rangeStart && rangeEnd && !Number.isNaN(rangeStart) && !Number.isNaN(rangeEnd)) {
                    const min = Math.min(rangeStart, rangeEnd);
                    const max = Math.max(rangeStart, rangeEnd);
                    const filtered = frames.filter(f => f.time >= min && f.time <= max);
                    if (filtered.length) frames = filtered;
                }

                if (onFramesChange) onFramesChange(frames);
            })
            .catch(() => {
                if (!active) return;
                if (onFramesChange) onFramesChange([]);
            });

        return () => {
            active = false;
        };
    }, [startDate, endDate, onFramesChange]);

    useEffect(() => {
        if (!frame || !frame.path || !frame.host) return;
        if (!activeFrame) {
            setActiveFrame(frame);
            return;
        }
        if (activeFrame.path !== frame.path) {
            setTileOpacity(0);
            const next = frame;
            const timer = setTimeout(() => {
                setActiveFrame(next);
            }, 120);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [frame, activeFrame]);

    if (!activeFrame || !activeFrame.path || !activeFrame.host) return null;

    return (
        <TileLayer
            url={`${activeFrame.host}${activeFrame.path}/256/{z}/{x}/{y}/2/1_1.png`}
            opacity={tileOpacity}
            attribution="&copy; RainViewer"
            maxNativeZoom={7}
            maxZoom={18}
            minZoom={0}
            className="precip-layer"
            keepBuffer={2}
            eventHandlers={{
                add: () => onVisibilityChange && onVisibilityChange(true),
                remove: () => onVisibilityChange && onVisibilityChange(false),
                load: () => setTileOpacity(0.6)
            }}
        />
    );
}

function MapTilerRadarLayer({ frame, enabled, onFramesChange, onVisibilityChange }) {
    const [activeFrame, setActiveFrame] = useState(null);
    const [tileOpacity, setTileOpacity] = useState(0.65);
    const [attribution, setAttribution] = useState("MapTiler Weather");

    useEffect(() => {
        return () => {
            if (onVisibilityChange) onVisibilityChange(false);
        };
    }, [onVisibilityChange]);

    useEffect(() => {
        let active = true;
        if (!enabled) {
            if (onFramesChange) onFramesChange([]);
            setActiveFrame(null);
            return () => {
                active = false;
            };
        }

        fetch(`https://api.maptiler.com/weather/latest.json?key=${MAPTILER_KEY}`)
            .then(res => res.json())
            .then(data => {
                if (!active) return;
                const radarVariable = selectRadarVariable(data?.variables);
                const keyframes = radarVariable?.keyframes || [];
                const frames = keyframes
                    .map((keyframe) => ({
                        time: Date.parse(keyframe?.timestamp) / 1000,
                        tilesetId: keyframe?.id
                    }))
                    .filter(frameItem => frameItem.tilesetId && Number.isFinite(frameItem.time))
                    .sort((a, b) => a.time - b.time);

                if (radarVariable?.metadata?.weather_variable?.attribution) {
                    setAttribution(`MapTiler Weather (${radarVariable.metadata.weather_variable.attribution})`);
                } else {
                    setAttribution("MapTiler Weather");
                }

                if (onFramesChange) onFramesChange(frames);
            })
            .catch(() => {
                if (!active) return;
                if (onFramesChange) onFramesChange([]);
            });

        return () => {
            active = false;
        };
    }, [enabled, onFramesChange]);

    useEffect(() => {
        if (!frame || !frame.tilesetId) return;
        if (!activeFrame) {
            setActiveFrame(frame);
            return;
        }
        if (activeFrame.tilesetId !== frame.tilesetId) {
            setTileOpacity(0);
            const next = frame;
            const timer = setTimeout(() => {
                setActiveFrame(next);
            }, 120);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [frame, activeFrame]);

    if (!activeFrame || !activeFrame.tilesetId) return null;

    return (
        <TileLayer
            url={`https://api.maptiler.com/tiles/${activeFrame.tilesetId}/{z}/{x}/{y}?key=${MAPTILER_KEY}`}
            opacity={tileOpacity}
            attribution={`&copy; ${attribution}`}
            maxZoom={18}
            minZoom={0}
            className="precip-layer"
            keepBuffer={2}
            eventHandlers={{
                add: () => onVisibilityChange && onVisibilityChange(true),
                remove: () => onVisibilityChange && onVisibilityChange(false),
                load: () => setTileOpacity(0.65)
            }}
        />
    );
}


// map setup
export default function FlightMap({
     weatherRadarVisible = true, 
     pathPoints = [] }) {  // PASS NODE COORDINATES IN HERE

    const [fullscreen, setFullscreen] = useState(false);
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const [style, setStyle] = useState({});  

    const [selectedAirports, setSelectedAirports] = useState([departureIATA, arrivalIATA]);
    const [precipTime, setPrecipTime] = useState(null);
    const [precipEnabled, setPrecipEnabled] = useState(false);
    const [precipFrameIndex, setPrecipFrameIndex] = useState(0);
    const [precipPlaying, setPrecipPlaying] = useState(true);
    const [isScrubbing, setIsScrubbing] = useState(false);
    const [wasPlayingBeforeScrub, setWasPlayingBeforeScrub] = useState(false);

    const [radarTime, setRadarTime] = useState(null);
    const [radarEnabled, setRadarEnabled] = useState(false);
    const [radarFrameIndex, setRadarFrameIndex] = useState(0);
    const [radarPlaying, setRadarPlaying] = useState(true);
    const [radarIsScrubbing, setRadarIsScrubbing] = useState(false);
    const [radarWasPlayingBeforeScrub, setRadarWasPlayingBeforeScrub] = useState(false);
    const showPath = true; // toggle for showing node path

    // placeholder range until connected to user-selected dates
    const precipStartDate = "03/15/2023 00:00";
    const precipEndDate = "03/16/2023 00:00";
    const defaultFrames = useMemo(
        () => buildHourlyFrames(precipStartDate, precipEndDate),
        [precipStartDate, precipEndDate]
    );
    const [precipFrames, setPrecipFrames] = useState(defaultFrames);
    const [radarFrames, setRadarFrames] = useState(defaultFrames);

    useEffect(() => {
        if (!precipFrames.length) setPrecipFrames(defaultFrames);
    }, [defaultFrames, precipFrames.length]);

    useEffect(() => {
        if (!radarFrames.length) setRadarFrames(defaultFrames);
    }, [defaultFrames, radarFrames.length]);

    useEffect(() => {
        if (!precipFrames.length) return;
        if (precipFrameIndex >= precipFrames.length) setPrecipFrameIndex(0);
    }, [precipFrames, precipFrameIndex]);

    useEffect(() => {
        if (!radarFrames.length) return;
        if (radarFrameIndex >= radarFrames.length) setRadarFrameIndex(0);
    }, [radarFrames, radarFrameIndex]);

    useEffect(() => {
        if (!precipFrames.length) return;
        setPrecipTime(precipFrames[precipFrameIndex]?.time);
    }, [precipFrames, precipFrameIndex]);

    useEffect(() => {
        if (!radarFrames.length) return;
        setRadarTime(radarFrames[radarFrameIndex]?.time);
    }, [radarFrames, radarFrameIndex]);

    useEffect(() => {
        if (!precipEnabled || !precipPlaying || isScrubbing || precipFrames.length <= 1) return undefined;
        const interval = setInterval(() => {
            setPrecipFrameIndex(prev => (prev + 1) % precipFrames.length);
        }, 1000);
        return () => clearInterval(interval);
    }, [precipEnabled, precipPlaying, isScrubbing, precipFrames.length]);

    useEffect(() => {
        if (!radarEnabled || !radarPlaying || radarIsScrubbing || radarFrames.length <= 1) return undefined;
        const interval = setInterval(() => {
            setRadarFrameIndex(prev => (prev + 1) % radarFrames.length);
        }, 1000);
        return () => clearInterval(interval);
    }, [radarEnabled, radarPlaying, radarIsScrubbing, radarFrames.length]);

    const filteredAirports = useMemo(() => ({
        ...airportData,
        features: airportData.features.filter(f =>
            selectedAirports.includes(f.properties.iata_code)
        )
    }), [selectedAirports]);

    const selectedCoords = useMemo(() => (
        airportData.features
            .filter(f => selectedAirports.includes(f.properties.iata_code))
            .map(f => {
                const [lng, lat] = f.geometry.coordinates;
                return [lat, lng];
            })
            .filter(Boolean)
    ), [selectedAirports]);

    const airportBounds = selectedCoords.length ? selectedCoords : [dICenter, oICenter].filter(Boolean);

    // computing path (default to straight line unless pathPoints is provided)
    const waypointPath = Array.isArray(pathPoints) && pathPoints.length
        ? pathPoints
        : [dICenter, oICenter].filter(Boolean);

    useEffect(() => {
        if (mapRef.current && airportBounds.length) {
            mapRef.current.fitBounds(airportBounds, { padding: [30, 30] });
        }
    }, [airportBounds]);


    function getFlightCategoryColor(cat) {
        switch(cat) {
            case "VFR": return "green";
            case "MVFR": return "blue";
            case "IFR": return "red";
            case "LIFR": return "purple";
            default: return "gray";
        }
    }

    // add popups to each airport point
    const onEachAirport = (feature, layer) => {
        if (feature.properties && feature.properties.name) {
            layer.bindPopup(`<strong>Airport:</strong> ${feature.properties.name}`);
        }
    };

    return (
        <div  
            ref={containerRef}
            style={style}
            className={`map-container ${fullscreen ? "fullscreen" : ""}`}
        >
            <MapContainer
                bounds={airportBounds}
                scrollWheelZoom={true}
                className="map"
                ref={mapRef}
                whenCreated={(mapInstance) => {
                    mapRef.current = mapInstance;
                }}
            >
                {/*showPath is the toggle variable i.e when user hits enter
                This is where the array of coordinates [lat,long] is given 
                and polyline connects the dots 
                */}
                {showPath && waypointPath.length ? (
                    <Polyline positions={waypointPath} color="#a3d4ff" weight={3} />
                ) : null}

                {/* fullscreen button */}
                <button
                    className="fullscreen-btn"
                    onClick={() => {
                        const rect = containerRef.current.getBoundingClientRect();

                        if (!fullscreen) {
                            setStyle({
                                top: rect.top,
                                left: rect.left,
                                width: rect.width,
                                height: rect.height
                            });

                            requestAnimationFrame(() => {
                                setFullscreen(true);
                                setTimeout(() => {
                                    setStyle({
                                        top: "50%",
                                        left: "50%",
                                        transform: "translate(-50%, -50%)",
                                        width: "90vw",
                                        height: "90vh"
                                    });
                                }, 10);
                            });

                        } else {
                            setFullscreen(false);
                            setStyle({});
                        }

                        // makes sure that map stays in place
                        const start = performance.now();
                        const duration = 450;

                        function animateResize(now) {
                            if (mapRef.current) mapRef.current.invalidateSize();
                            if (now - start < duration) requestAnimationFrame(animateResize);
                        }

                        requestAnimationFrame(animateResize);
                    }}
                >
                    ⛶
                </button>

                {/* OpenStreetMap tiles with MapTiler styling */}
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url={`https://api.maptiler.com/maps/dataviz-v4/{z}/{x}/{y}@2x.png?key=${MAPTILER_KEY}`}
                    tileSize={512}
                    zoomOffset={-1}
                />

                {/* layers control */}
                <LayersControl position="topright">

                    {/* draggable origin and destination markers */}
                    <LayersControl.Overlay checked name="Destination/Origin Markers">
                        <LayerGroup>
                            <DraggableMarker position={dICenter} icon={destinationIcon} />
                            <DraggableMarker position={oICenter} icon={originIcon} />
                        </LayerGroup>
                    </LayersControl.Overlay>

                    {/* airport data */}
                    <LayersControl.Overlay checked name="Airports">
                        <GeoJSON
                            data={filteredAirports}
                            pointToLayer={(feature, latlng) =>
                                L.circleMarker(latlng, {
                                    radius: 10,
                                    fillColor: "#78b4f9",
                                    color: "#fff",
                                    weight: 1,
                                    fillOpacity: 0.8
                                })
                            }
                            onEachFeature={onEachAirport}
                        />
                    </LayersControl.Overlay>

                {/* RainViewer Animated Precipitation */}
                <LayersControl.Overlay name="Precipitation">
                    <RainViewerAnimatedPrecip
                        startDate={precipStartDate}
                        endDate={precipEndDate}
                        frame={precipFrames[precipFrameIndex]}
                        onFramesChange={setPrecipFrames}
                        onVisibilityChange={setPrecipEnabled}
                    />
                </LayersControl.Overlay>

                {/* MapTiler Weather Radar */}
                {weatherRadarVisible ? (
                    <LayersControl.Overlay checked name="Weather Radar (MapTiler)">
                        <MapTilerRadarLayer
                            frame={radarFrames[radarFrameIndex]}
                            enabled={weatherRadarVisible}
                            onFramesChange={setRadarFrames}
                            onVisibilityChange={setRadarEnabled}
                        />
                    </LayersControl.Overlay>
                ) : null}

                </LayersControl>
            </MapContainer>
            {precipEnabled && precipFrames.length ? (
                <div className="precip-time-bar">
                    <div className="precip-time-text">
                        {precipTime
                            ? `Precipitation: ${
                                new Date(precipTime * 1000).toLocaleString("en-US", {
                                    month: "short",
                                    day: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    timeZone: "UTC"
                                })
                            } UTC`
                            : "Precipitation: Loading..."}
                    </div>
                    {precipFrames.length > 1 ? (
                        <div className="precip-controls">
                            <button
                                type="button"
                                className="precip-play-btn"
                                onClick={() => setPrecipPlaying(prev => !prev)}
                                aria-pressed={precipPlaying}
                            >
                                {precipPlaying ? "Pause" : "Play"}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max={Math.max(precipFrames.length - 1, 0)}
                                value={precipFrameIndex}
                                onChange={(e) => setPrecipFrameIndex(Number(e.target.value))}
                                onMouseDown={() => {
                                    setWasPlayingBeforeScrub(precipPlaying);
                                    setPrecipPlaying(false);
                                    setIsScrubbing(true);
                                }}
                                onMouseUp={() => {
                                    setIsScrubbing(false);
                                    setPrecipPlaying(wasPlayingBeforeScrub);
                                }}
                                onTouchStart={() => {
                                    setWasPlayingBeforeScrub(precipPlaying);
                                    setPrecipPlaying(false);
                                    setIsScrubbing(true);
                                }}
                                onTouchEnd={() => {
                                    setIsScrubbing(false);
                                    setPrecipPlaying(wasPlayingBeforeScrub);
                                }}
                                className="precip-scrubber"
                                aria-label="Precipitation time scrubber"
                            />
                        </div>
                    ) : null}
                </div>
            ) : null}
            {weatherRadarVisible && radarEnabled && radarFrames.length ? (
                <div className="precip-time-bar">
                    <div className="precip-time-text">
                        {radarTime
                            ? `Weather Radar: ${
                                new Date(radarTime * 1000).toLocaleString("en-US", {
                                    month: "short",
                                    day: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    timeZone: "UTC"
                                })
                            } UTC`
                            : "Weather Radar: Loading..."}
                    </div>
                    {radarFrames.length > 1 ? (
                        <div className="precip-controls">
                            <button
                                type="button"
                                className="precip-play-btn"
                                onClick={() => setRadarPlaying(prev => !prev)}
                                aria-pressed={radarPlaying}
                            >
                                {radarPlaying ? "Pause" : "Play"}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max={Math.max(radarFrames.length - 1, 0)}
                                value={radarFrameIndex}
                                onChange={(e) => setRadarFrameIndex(Number(e.target.value))}
                                onMouseDown={() => {
                                    setRadarWasPlayingBeforeScrub(radarPlaying);
                                    setRadarPlaying(false);
                                    setRadarIsScrubbing(true);
                                }}
                                onMouseUp={() => {
                                    setRadarIsScrubbing(false);
                                    setRadarPlaying(radarWasPlayingBeforeScrub);
                                }}
                                onTouchStart={() => {
                                    setRadarWasPlayingBeforeScrub(radarPlaying);
                                    setRadarPlaying(false);
                                    setRadarIsScrubbing(true);
                                }}
                                onTouchEnd={() => {
                                    setRadarIsScrubbing(false);
                                    setRadarPlaying(radarWasPlayingBeforeScrub);
                                }}
                                className="precip-scrubber"
                                aria-label="Weather radar time scrubber"
                            />
                        </div>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}
