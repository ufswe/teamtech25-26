import "./Map.css";
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, LayerGroup, LayersControl, GeoJSON} from 'react-leaflet';
import { useState, useRef, useMemo, Popup } from 'react'; 
import 'leaflet/dist/leaflet.css';
import airportData from "../global-airports.json";
//airport data from https://github.com/jbrooksuk/JSON-Airports 


//coordinates set to uf when map first loaded 
const center = {
    lat: 29.65,
    lng: -82.35,
}

//API keys
const MAPTILER_KEY = 'dT0LApeCkzfKLrNt5WIZ';
const OWM_API_KEY = 'c7f94e4f2f8ad884069afd57801bfa01';

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

const airportIcon = new L.Icon({
    iconUrl: '/airport.png', 
    iconRetinaUrl: '/airport.png',
    iconSize: [30, 30],     
    iconAnchor: [15, 15],  
});

//initial positions for the markers
const dICenter = [29.65, -82.35];
const oICenter = [29.64, -82.34];

//marker 
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
            draggable={true} 
            eventHandlers={eventHandlers}
            position={position}
            icon={icon}
            ref={markerRef}
        />
    );
}


// map setup 
export default function Map() {

    const [airports, setAirports] = useState(null);


    // add popups to each airport point
    const onEachAirport = (feature, layer) => {
        if (feature.properties && feature.properties.name) {
            layer.bindPopup(`<strong>Airport:</strong> ${feature.properties.name}`);
        }
    };

    return (
        <div className="map-container">
            <MapContainer
                center={[center.lat, center.lng]}
                zoom={13}
                scrollWheelZoom={true}
                className="map"
            >
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
                            data={airportData} 
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
                                    IATA: ${feature.properties.iata || 'N/A'}
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
