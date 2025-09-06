'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface Restaurant {
  id: string;
  name: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  cuisine: string[];
  rating?: number;
}

interface OlaMapProps {
  restaurants: Restaurant[];
  onRestaurantClick?: (restaurant: Restaurant) => void;
  center?: [number, number];
  zoom?: number;
  className?: string;
}

export default function OlaMap({ 
  restaurants, 
  onRestaurantClick,
  center = [77.6245, 12.9352], // Default to Bangalore
  zoom = 12,
  className = ""
}: OlaMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const apiKey = "1CtKt30A4Fbs7dDUQVITLH6JBdJph8Ybtn5sQa4S";
    
    if (!apiKey) {
      console.warn('Ola Maps API key not found. Please add NEXT_PUBLIC_OLA_MAPS_API_KEY to your .env.local file');
      return;
    }

    // Initialize map with OpenStreetMap tiles
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm-source': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: 'osm-layer',
            type: 'raster',
            source: 'osm-source'
          }
        ]
      },
      center: center,
      zoom: zoom,
      attributionControl: false
    });

    map.current.addControl(new maplibregl.NavigationControl());

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [center, zoom]);

  // Add restaurant markers when map is loaded
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove existing markers
    const existingMarkers = document.querySelectorAll('.restaurant-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Add new markers
    restaurants.forEach((restaurant) => {
      // Create custom marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'restaurant-marker';
      markerElement.style.cssText = `
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #f97316, #ea580c);
        border: 3px solid white;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        transition: all 0.2s ease;
        font-size: 18px;
      `;
      
      // Add restaurant icon
      markerElement.innerHTML = `
        <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
          <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41-5.51-5.51z"/>
        </svg>
      `;

      markerElement.onmouseenter = () => {
        markerElement.style.transform = 'scale(1.1)';
        markerElement.style.zIndex = '1000';
      };

      markerElement.onmouseleave = () => {
        markerElement.style.transform = 'scale(1)';
        markerElement.style.zIndex = 'auto';
      };

      // Create marker
      const marker = new maplibregl.Marker({
        element: markerElement
      })
        .setLngLat([restaurant.location.longitude, restaurant.location.latitude])
        .addTo(map.current!);

      // Create popup
      const popup = new maplibregl.Popup({
        offset: 25,
        closeButton: false,
        className: 'restaurant-popup'
      }).setHTML(`
        <div class="p-3 min-w-[200px]">
          <h3 class="font-bold text-lg mb-1">${restaurant.name}</h3>
          <p class="text-sm text-gray-600 mb-2">${restaurant.address}</p>
          <div class="flex items-center mb-2">
            <div class="flex items-center">
              ${Array.from({ length: 5 }, (_, i) => 
                `<svg class="w-4 h-4 ${i < Math.floor(restaurant.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>`
              ).join('')}
            </div>
            <span class="ml-2 text-sm font-medium">${restaurant.rating || 'N/A'}</span>
          </div>
          <div class="flex flex-wrap gap-1">
            ${restaurant.cuisine.map(c => 
              `<span class="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">${c}</span>`
            ).join('')}
          </div>
        </div>
      `);

      markerElement.addEventListener('click', () => {
        if (onRestaurantClick) {
          onRestaurantClick(restaurant);
        }
        popup.addTo(map.current!);
      });

      marker.setPopup(popup);
    });

    // Fit map to show all restaurants
    if (restaurants.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      restaurants.forEach(restaurant => {
        bounds.extend([restaurant.location.longitude, restaurant.location.latitude]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }

  }, [restaurants, mapLoaded, onRestaurantClick]);

  return (
    <div 
      ref={mapContainer} 
      className={`relative w-full h-full rounded-lg overflow-hidden ${className}`}
      style={{ 
        minHeight: '400px',
        position: 'relative',
        zIndex: 1
      }}
    />
  );
}