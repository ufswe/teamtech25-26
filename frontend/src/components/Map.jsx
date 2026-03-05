import "./Map.css";
import L, { icon } from 'leaflet';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import { useState, useRef, useMemo, useCallback } from 'react'; 
import 'leaflet/dist/leaflet.css';

//coordinates set to uf when map first loaded 
const center = {
    lat: 29.65,
    lng: -82.35,
}

//maptiler API key
const MAPTILER_KEY = 'dT0LApeCkzfKLrNt5WIZ';

//importing custom marker iconsn 
const originIcon = new L.Icon({
    iconUrl: '/Marker.png', 
    iconRetinaUrl: '/Marker.png',
    iconSize: [25, 35],     
    iconAnchor: [12.5, 35],  
});

const destinationIcon = new L.Icon({
    iconUrl: '/Marker2.png', 
    iconRetinaUrl: '/Marker2.png',
    iconSize: [25, 35],     
    iconAnchor: [12.5, 35],  
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
    return (
        <div className="map-container">
            <MapContainer
                center={[29.64, -82.35]}
                zoom={13}
                scrollWheelZoom={true}
                className="map"
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://api.maptiler.com/maps/dataviz-v4/{z}/{x}/{y}@2x.png?key=dT0LApeCkzfKLrNt5WIZ"
                    tileSize={512}
                    zoomOffset={-1}
                />

                <DraggableMarker position={dICenter} icon={destinationIcon} />
                <DraggableMarker position={oICenter} icon={originIcon} />
                
            </MapContainer>
        </div>



    );
}
