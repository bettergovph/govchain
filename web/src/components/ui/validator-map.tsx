'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Replace with your Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface ValidatorLocation {
  ip: string;
  lat: number;
  lng: number;
  moniker: string;
  country?: string;
  city?: string;
  nodeId?: string;
}

interface ValidatorMapProps {
  validators: ValidatorLocation[];
}

export function ValidatorMap({ validators }: ValidatorMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [0, 20],
      zoom: 2,
      projection: 'mercator'
    });

    map.current.addControl(new mapboxgl.NavigationControl());

    // Wait for style to load before allowing other operations
    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current || !validators.length || !mapLoaded) return;

    // Remove old markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add connection lines layer if it doesn't exist
    if (map.current.getSource('connections')) {
      map.current.removeLayer('connections-layer');
      map.current.removeSource('connections');
    }

    // Create GeoJSON for connection lines
    const connections: any = {
      type: 'FeatureCollection',
      features: []
    };

    // Connect each validator to next validator in a mesh pattern
    for (let i = 0; i < validators.length; i++) {
      const nextIndex = (i + 1) % validators.length;
      connections.features.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [validators[i].lng, validators[i].lat],
            [validators[nextIndex].lng, validators[nextIndex].lat]
          ]
        }
      });
    }

    // Add the connection lines to the map
    map.current.addSource('connections', {
      type: 'geojson',
      data: connections
    });

    map.current.addLayer({
      id: 'connections-layer',
      type: 'line',
      source: 'connections',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#3b82f6',
        'line-width': 2,
        'line-opacity': 0.4
      }
    });

    // Animate the connection lines
    let dashOffset = 0;
    const animateDashArray = () => {
      dashOffset = (dashOffset + 0.5) % 10;
      
      if (map.current && map.current.getLayer('connections-layer')) {
        map.current.setPaintProperty(
          'connections-layer',
          'line-dasharray',
          [2, 4]
        );
        map.current.setPaintProperty(
          'connections-layer',
          'line-offset',
          Math.sin(dashOffset * 0.5) * 0.5
        );
      }
      
      animationRef.current = requestAnimationFrame(animateDashArray);
    };

    animateDashArray();

    // Add markers for each validator
    validators.forEach((validator) => {
      const popupContent = `
        <div style="padding: 8px; min-width: 200px;">
          <div style="font-weight: 600; margin-bottom: 4px; color: #2563eb;">${validator.moniker}</div>
          ${validator.city ? `<div style="font-size: 12px; color: #64748b; margin-bottom: 2px;">📍 ${validator.city}, ${validator.country}</div>` : ''}
          <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">${validator.ip}</div>
          ${validator.nodeId ? `<div style="font-size: 10px; font-family: monospace; color: #64748b;">Node: ${validator.nodeId.substring(0, 12)}...</div>` : ''}
        </div>
      `;

      // Create custom marker with computer emoji
      const el = document.createElement('div');
      el.className = 'server-marker';
      el.innerHTML = '🖥️';
      el.style.fontSize = '32px';
      el.style.cursor = 'pointer';

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([validator.lng, validator.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent)
        )
        .addTo(map.current!);

      markers.current.push(marker);
    });

    // Smart zoom based on marker distribution
    if (validators.length === 1) {
      // Single marker: zoom in close
      map.current.flyTo({
        center: [validators[0].lng, validators[0].lat],
        zoom: 8,
        duration: 1500
      });
    } else if (validators.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      validators.forEach(v => bounds.extend([v.lng, v.lat]));
      
      // Calculate distance between bounds
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      const distance = Math.sqrt(
        Math.pow(ne.lng - sw.lng, 2) + Math.pow(ne.lat - sw.lat, 2)
      );
      
      // If markers are close together (distance < 30 degrees), zoom in more
      // If spread out globally, zoom out to show all
      if (distance < 30) {
        map.current.fitBounds(bounds, { 
          padding: 80, 
          maxZoom: 10,
          duration: 1500
        });
      } else {
        map.current.fitBounds(bounds, { 
          padding: 50, 
          maxZoom: 4,
          duration: 1500
        });
      }
    }
  }, [validators, mapLoaded]);

  return (
    <div ref={mapContainer} style={{ width: '100%', height: '600px', borderRadius: '0' }} />
  );
}
    // Cleanup animation on unmount or when validators change
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
