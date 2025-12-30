import { useEffect, useRef, useState, useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { useTheme } from '@/hooks/use-theme'; // Assuming you might have a theme hook, or default to light
import { Loader2, AlertTriangle, X } from 'lucide-react';
import { OccupancyBadge } from './OccupancyBadge';
import { useOccupancy } from '@/hooks/use-locations';

interface MapLocation {
  id: number;
  name: string;
  lat: number;
  lng: number;
  type: string;
  description?: string | null;
}

interface MapWrapperProps {
  apiKey?: string;
  locations: MapLocation[];
  selectedLocationId: number | null;
  onSelectLocation: (id: number | null) => void;
}

// Separate component to handle map interactions (hooks must be inside APIProvider)
function MapEvents({ selectedLocation, onMarkerClick }: { selectedLocation: MapLocation | null, onMarkerClick: (loc: MapLocation) => void }) {
  const map = useMap();
  const prevSelectedId = useRef<number | null>(null);

  useEffect(() => {
    if (!map || !selectedLocation) return;
    
    // Only pan if selection changed to avoid re-centering on every render
    if (selectedLocation.id !== prevSelectedId.current) {
      map.panTo({ lat: selectedLocation.lat, lng: selectedLocation.lng });
      map.setZoom(17); // Zoom in when selected
      prevSelectedId.current = selectedLocation.id;
    }
  }, [map, selectedLocation]);

  return null;
}

// Marker component to fetch its own occupancy status for color coding
function OccupancyMarker({ location, isSelected, onClick }: { location: MapLocation, isSelected: boolean, onClick: () => void }) {
  const { data: occupancy } = useOccupancy(location.id);
  
  const pinColor = useMemo(() => {
    if (!occupancy) return "#94a3b8"; // Slate-400 default
    switch (occupancy.level) {
      case 'low': return "#22c55e"; // Green-500
      case 'moderate': return "#eab308"; // Yellow-500
      case 'high': return "#f97316"; // Orange-500
      case 'critical': return "#ef4444"; // Red-500
      default: return "#94a3b8";
    }
  }, [occupancy]);

  return (
    <AdvancedMarker
      position={{ lat: location.lat, lng: location.lng }}
      onClick={onClick}
      zIndex={isSelected ? 100 : 1}
    >
      <div className={`
        relative group cursor-pointer transition-all duration-300
        ${isSelected ? 'scale-125' : 'hover:scale-110'}
      `}>
        <Pin 
          background={pinColor} 
          borderColor={isSelected ? "#1e293b" : "#ffffff"}
          glyphColor={isSelected ? "#ffffff" : "#1e293b"}
          scale={isSelected ? 1.2 : 1.0}
        />
        {/* Tooltip on hover */}
        {!isSelected && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
            {location.name}
          </div>
        )}
      </div>
    </AdvancedMarker>
  );
}

export function MapWrapper({ apiKey, locations, selectedLocationId, onSelectLocation }: MapWrapperProps) {
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [userApiKey, setUserApiKey] = useState<string | null>(null);
  
  // Try to get key from env, fallback to user input
  const effectiveKey = apiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY || userApiKey;

  const selectedLocation = useMemo(() => 
    locations.find(l => l.id === selectedLocationId) || null
  , [locations, selectedLocationId]);
  
  const { data: activeOccupancy } = useOccupancy(selectedLocationId);

  // Default center (e.g., a generic campus or coordinate 0,0)
  // Calculating centroid of locations if available
  const defaultCenter = useMemo(() => {
    if (locations.length > 0) {
      const lat = locations.reduce((sum, l) => sum + l.lat, 0) / locations.length;
      const lng = locations.reduce((sum, l) => sum + l.lng, 0) / locations.length;
      return { lat, lng };
    }
    return { lat: 37.4221, lng: -122.0841 }; // GooglePlex default
  }, [locations]);

  if (!effectiveKey) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-muted/30 p-8 text-center border-2 border-dashed border-muted-foreground/25 rounded-3xl m-4">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 text-primary animate-pulse">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2 font-display">Map Configuration Required</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          To display the campus map, a valid Google Maps API Key is required. 
        </p>
        <div className="flex gap-2 w-full max-w-md">
          <input 
            type="text" 
            placeholder="Enter API Key (starts with AIza...)" 
            className="flex-1 px-4 py-2 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
          />
          <button 
            onClick={() => setUserApiKey(apiKeyInput)}
            disabled={!apiKeyInput}
            className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-lg shadow-primary/20"
          >
            Load Map
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          This key is stored only in your browser memory for this session.
        </p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={effectiveKey}>
      <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl shadow-black/5 border border-border/50 relative">
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={15}
          mapId="DEMO_MAP_ID" // Required for AdvancedMarker
          gestureHandling={'greedy'}
          disableDefaultUI={true}
          className="w-full h-full outline-none"
        >
          {locations.map(loc => (
            <OccupancyMarker 
              key={loc.id} 
              location={loc} 
              isSelected={loc.id === selectedLocationId}
              onClick={() => onSelectLocation(loc.id)}
            />
          ))}

          {selectedLocation && (
            <InfoWindow
              position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
              onCloseClick={() => onSelectLocation(null)}
              headerContent={
                <div className="text-sm font-bold text-gray-900 pr-4">{selectedLocation.name}</div>
              }
            >
              <div className="min-w-[200px] p-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500 uppercase">{selectedLocation.type}</span>
                </div>
                {activeOccupancy ? (
                  <div className="flex flex-col gap-1">
                    <OccupancyBadge level={activeOccupancy.level} percentage={activeOccupancy.percentage} />
                    <p className="text-xs text-gray-500 mt-1">Last updated: just now</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Loader2 className="w-3 h-3 animate-spin" /> Loading status...
                  </div>
                )}
              </div>
            </InfoWindow>
          )}

          <MapEvents selectedLocation={selectedLocation} onMarkerClick={(loc) => onSelectLocation(loc.id)} />
        </Map>

        {/* Floating Map Controls overlay if needed */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-2">
          {/* Custom zoom controls could go here */}
        </div>
      </div>
    </APIProvider>
  );
}
