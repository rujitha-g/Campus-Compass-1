## Packages
@vis.gl/react-google-maps | Google Maps React components
framer-motion | For smooth transitions and animations
clsx | Utility for conditional classes (often used with tailwind-merge)
tailwind-merge | Utility for merging tailwind classes

## Notes
- Google Maps API key should be provided via environment variable (VITE_GOOGLE_MAPS_API_KEY) or input by user if missing.
- Backend provides `/api/locations` and `/api/locations/:id/occupancy`.
- Occupancy levels map to colors: low (green), moderate (yellow), high (orange), critical (red).
- Map should default to a campus view if no specific location is selected.
