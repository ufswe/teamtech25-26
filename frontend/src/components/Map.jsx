import "./Map.css";
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, LayerGroup, LayersControl, GeoJSON} from 'react-leaflet';
import { useState, useRef, useMemo, Popup } from 'react'; 
import 'leaflet/dist/leaflet.css';
import airportData from "../global-airports.json";
//airport data from https://github.com/jbrooksuk/JSON-Airports 

//API keys
const MAPTILER_KEY = 'dT0LApeCkzfKLrNt5WIZ';
const OWM_API_KEY = 'c7f94e4f2f8ad884069afd57801bfa01';


// helper function to get coord by IATA code from airport data 
const getAirportCoords = (iata) => {
    const airport = airportData.features.find(
        f => f.properties.iata_code === iata
    );
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
const airportBounds = [
    getAirportCoords(departureIATA),
    getAirportCoords(arrivalIATA)
].filter(Boolean);


//importing custom marker icons
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
function DraggableMarker({ position: initialPosition, icon }) {
  const [position, setPosition] = useState(initialPosition);
    const markerRef = useRef(null);

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    setPosition(marker.getLatLng());
                }
            },
        }),
        []
    );

    return (
        <Marker
            draggable={false} 
            eventHandlers={eventHandlers}
            position={position}
            icon={icon}
            ref={markerRef}
        />
    );
}


// map setup 
export default function Map() {


    const [fullscreen, setFullscreen] = useState(false);
    const containerRef = useRef(null);
    const [style, setStyle] = useState({});  
    const mapRef = useRef(null);


    // filtering airports 
    const [selectedAirports, setSelectedAirports] = useState([departureIATA, arrivalIATA]); 
    const filteredAirports = useMemo(() => {
        return {
            ...airportData,
            features: airportData.features.filter(feature =>
                selectedAirports.includes(feature.properties.iata_code)
            )
        };
    }, [selectedAirports]);


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
                
            >
                // fullscreen button
                <button
                    className="fullscreen-btn"

                    // animation transition so that map stays in place and smooth resizing 
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
                            if (mapRef.current) {
                                mapRef.current.invalidateSize();
                            }

                            if (now - start < duration) {
                                requestAnimationFrame(animateResize);
                            }
                        }

                        requestAnimationFrame(animateResize);
                    }}
                    >
                    ⛶
                </button>

                {/* // OpenStreetMap tiles with MapTiler styling */}
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url={`https://api.maptiler.com/maps/dataviz-v4/{z}/{x}/{y}@2x.png?key=${MAPTILER_KEY}`}
                    tileSize={512}
                    zoomOffset={-1}
                />
            
                {/* { layers control to toggle visibility of markers and airport data} */}
                <LayersControl position="topright">
                    
                    {/* // layer for the draggable origin and destination markers */}
                    <LayersControl.Overlay checked name="Destination/Origin Markers">
                        <LayerGroup>
                            <DraggableMarker position={dICenter} icon={destinationIcon} />
                            <DraggableMarker position={oICenter} icon={originIcon} />
                        </LayerGroup>
                    </LayersControl.Overlay>

                    {/* // layer of airport data */}
                    <LayersControl.Overlay checked name="Airports">
                            <GeoJSON 
                            data={filteredAirports} 
                            pointToLayer={(feature, latlng) => L.circleMarker(latlng, {
                                radius: 10,
                                fillColor: "#78b4f9",
                                color: "#fff",
                                weight: 1,
                                fillOpacity: 0.8
                            })}

                            // popup when u click on airport
                            onEachFeature={(feature, layer) => {
                                if (feature.properties && feature.properties.name) {
                                layer.bindPopup(`
                                    <strong>${feature.properties.name}</strong><br/>
                                    IATA: ${feature.properties.iata_code || 'N/A'}
                                `);
                                }
                            }}
                            />
                        </LayersControl.Overlay>

                </LayersControl>

                
            </MapContainer>
        </div>



    );
}
