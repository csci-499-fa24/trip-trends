import React, { useRef, useEffect } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Icon, Style } from 'ol/style';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import { boundingExtent } from 'ol/extent';
import pinIcon from '../../img/redPin.png';
import '../../css/singletrip.css'

// Custom marker icon style
const customDefaultMarker = new Style({
    image: new Icon({
        src: pinIcon.src,
        scale: 0.06,
    }),
});

const customHoverMarker = new Style({
    image: new Icon({
        src: pinIcon.src,
        scale: 0.075,
    })
});

const MapComponent = ({ allTripLocations, toggleTripDetails }) => {
    const mapRef = useRef(null);

    useEffect(() => {
        // Initialize the OpenLayers map after the component mounts
        if (mapRef.current) {
            const mapContainer = mapRef.current;
            const features = allTripLocations.map(location => {
                if (location.latitude && location.longitude) {
                    const feature = new Feature({
                        geometry: new Point(fromLonLat([parseFloat(location.longitude), parseFloat(location.latitude)])),
                    });
                    feature.set("trip_id", location.trip_id);
                    feature.setStyle(customDefaultMarker);
                    return feature;
                }
                return null;
            }).filter(Boolean); // Remove any null values

            const vectorSource = new VectorSource({ features });
            const vectorLayer = new VectorLayer({ source: vectorSource });

            const map = new Map({
                target: mapRef.current,
                layers: [
                    new TileLayer({
                        source: new OSM(),
                    }),
                    vectorLayer,
                ],
                view: new View({
                    center: fromLonLat([-74.0060, 40.7128]), // Default NYC coords
                    zoom: 13,
                }),
            });

            if (features.length > 0) {
                // Zoom out to fit all the markers
                const extent = boundingExtent(features.map(feature => feature.getGeometry().getCoordinates()));
                // Validate extent
                if (extent.length === 4 &&
                    extent.every(coord => Number.isFinite(coord))) {
                    try {
                        map.getView().fit(extent, { padding: [40, 40, 40, 40], maxZoom: 15 });
                    } catch (error) {
                        console.error('Error fitting view to extent:', error);
                    }
                } else {
                    console.error('Invalid extent:', extent);
                }
            } else {
                console.error('No features found.');
            }

            // Listen for map interactions (drag, zoom, etc.)
            map.on('pointerdown', () => {
                mapContainer.classList.add('active'); // Enable map interactions
            });

            // When the pointer leaves the map, disable interaction
            map.on('pointerup', () => {
                mapContainer.classList.remove('active'); // Allow scrolling again
            });

            map.on('mouseout', () => {
                mapContainer.classList.remove('active'); // Reset on mouse out
            });

            // Click markers to trigger dropdown and scroll to divider
            map.on('singleclick', (event) => {
                const feature = map.forEachFeatureAtPixel(event.pixel, (feat) => feat);
                if (feature) {
                    const tripId = feature.get('trip_id');

                    // Scroll to the Recent Trips section and expand the clicked trip
                    const tripElement = document.getElementById(`trip-${tripId}`); // Use a unique ID to target the trip divider
                    if (tripElement) {
                        tripElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        tripElement.classList.add('trip-card-highlight');
                        setTimeout(() => {
                            tripElement.classList.remove('trip-card-highlight');
                        }, 2000);
                    }
                } else {
                    console.log('No marker found.');
                }
            });

            // Create tooltip element
            const tooltip = document.createElement('div');
            tooltip.className = 'marker-tooltip';
            document.body.appendChild(tooltip);

            // Event listener to allow hovering on markers
            map.on('pointermove', (e) => {
                const pixel = map.getEventPixel(e.originalEvent);
                const feature = map.forEachFeatureAtPixel(pixel, (feature) => feature);

                vectorSource.getFeatures().forEach((feature) => {
                    feature.setStyle(customDefaultMarker);
                });

                if (feature) {
                    const coordinates = feature.getGeometry().getCoordinates();
                    const location = allTripLocations.find(loc =>
                        fromLonLat([parseFloat(loc.longitude), parseFloat(loc.latitude)])
                            .toString() === coordinates.toString()
                    )?.location; // Get location name based on the coordinates matching the marker hovered over

                    feature.setStyle(customHoverMarker);

                    tooltip.innerHTML = location || 'Unknown Location';
                    tooltip.style.left = `${e.originalEvent.pageX + 10}px`;
                    tooltip.style.top = `${e.originalEvent.pageY + 10}px`;
                    tooltip.style.opacity = 1;
                } else {
                    tooltip.style.opacity = 0;
                }
            });


            return () => map.setTarget(undefined);
        }
    }, [allTripLocations, toggleTripDetails]); // rerenders when trip locations are updated

    return <div ref={mapRef} style={{ height: '537px', width: '85%' }}></div>;
};

export default MapComponent;
