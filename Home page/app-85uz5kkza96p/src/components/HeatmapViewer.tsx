import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet.heat';
import type { DataPoint, HeatmapConfig } from '@/types/heatmap';
import type { ColorScheme } from './ColorSchemeSelector';
import type { MeasurementMode } from './MeasurementTools';
import {
  calculatePathDistance,
  calculatePolygonArea,
  createMeasurementPolyline,
  createMeasurementPolygon,
  createMeasurementMarker,
} from '@/utils/measurements';

interface HeatmapViewerProps {
  data: DataPoint[];
  config: HeatmapConfig;
  colorScheme?: ColorScheme;
  showGrid?: boolean;
  measurementMode?: MeasurementMode;
  onCoordinateChange?: (lat: number, lon: number) => void;
  onMeasurementComplete?: (measurement: { distance?: number; area?: number }) => void;
  onMeasurementClear?: () => void;
}

export default function HeatmapViewer({
  data,
  config,
  colorScheme = 'thermal',
  showGrid = false,
  measurementMode = null,
  onCoordinateChange,
  onMeasurementComplete,
  onMeasurementClear
}: HeatmapViewerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const heatLayerRef = useRef<L.HeatLayer | null>(null);
  const gridLayerRef = useRef<L.LayerGroup | null>(null);
  const measurementLayerRef = useRef<L.LayerGroup | null>(null);
  const measurementPointsRef = useRef<L.LatLng[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastUpdateRef = useRef<number>(0);

  const getColorGradient = (scheme: ColorScheme): Record<number, string> => {
    const gradients: Record<ColorScheme, Record<number, string>> = {
      thermal: { 0.0: '#0000FF', 0.2: '#00FFFF', 0.4: '#00FF00', 0.6: '#FFFF00', 0.8: '#FF8800', 1.0: '#FF0000' },
      rainbow: { 0.0: '#8B00FF', 0.17: '#4B0082', 0.33: '#0000FF', 0.5: '#00FF00', 0.67: '#FFFF00', 0.83: '#FF7F00', 1.0: '#FF0000' },
      viridis: { 0.0: '#440154', 0.25: '#31688e', 0.5: '#35b779', 0.75: '#b5de2b', 1.0: '#fde724' },
      plasma: { 0.0: '#0d0887', 0.2: '#7e03a8', 0.4: '#cc4778', 0.6: '#f89540', 0.8: '#fcce25', 1.0: '#f0f921' },
      ocean: { 0.0: '#000066', 0.2: '#0000CC', 0.4: '#0066FF', 0.6: '#00CCFF', 0.8: '#66FFFF', 1.0: '#FFFFFF' },
      grayscale: { 0.0: '#000000', 0.2: '#333333', 0.4: '#666666', 0.6: '#999999', 0.8: '#CCCCCC', 1.0: '#FFFFFF' }
    };
    return gradients[scheme];
  };

  const throttledCoordinateUpdate = useCallback((lat: number, lon: number) => {
    const now = Date.now();
    if (now - lastUpdateRef.current > 150) {
      lastUpdateRef.current = now;
      if (onCoordinateChange) {
        onCoordinateChange(lat, lon);
      }
    }
  }, [onCoordinateChange]);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current, {
        center: [20, 0],
        zoom: 2,
        minZoom: 1,
        maxZoom: 18,
        zoomControl: false,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        dragging: true,
        touchZoom: true,
        boxZoom: true,
        keyboard: true,
        worldCopyJump: true,
        fadeAnimation: false,
        zoomAnimation: false,
        markerZoomAnimation: false,
        preferCanvas: true
      });

      // Add custom zoom control in top-right position
      L.control.zoom({
        position: 'topright'
      }).addTo(mapRef.current);

      // Add scale control
      L.control.scale({
        position: 'bottomleft',
        imperial: true,
        metric: true
      }).addTo(mapRef.current);

      // Base layers for layer control
      const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 19
      });

      const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      });

      const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      });

      const terrainLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 19
      });

      // Add default satellite layer
      satelliteLayer.addTo(mapRef.current);

      // Add labels overlay
      const labelsLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png', {
        attribution: '',
        subdomains: 'abcd',
        maxZoom: 19,
        pane: 'shadowPane'
      }).addTo(mapRef.current);

      // Layer control
      const baseMaps = {
        'Satellite': satelliteLayer,
        'Street': streetLayer,
        'Dark': darkLayer,
        'Terrain': terrainLayer
      };

      const overlayMaps = {
        'Labels': labelsLayer
      };

      L.control.layers(baseMaps, overlayMaps, {
        position: 'topright',
        collapsed: true
      }).addTo(mapRef.current);

      if (onCoordinateChange) {
        mapRef.current.on('mousemove', (e: L.LeafletMouseEvent) => {
          throttledCoordinateUpdate(e.latlng.lat, e.latlng.lng);
        });
      }

      // Add click event to show data point info
      mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
        if (measurementMode) return; // Don't interfere with measurement mode

        const clickedLat = e.latlng.lat;
        const clickedLon = e.latlng.lng;

        // Find nearest data point within reasonable distance
        const nearestPoint = data.reduce((nearest, point) => {
          const distance = Math.sqrt(
            Math.pow(point.lat - clickedLat, 2) +
            Math.pow(point.lon - clickedLon, 2)
          );
          if (!nearest || distance < nearest.distance) {
            return { point, distance };
          }
          return nearest;
        }, null as { point: DataPoint; distance: number } | null);

        if (nearestPoint && nearestPoint.distance < 1) {
          const popup = L.popup()
            .setLatLng([nearestPoint.point.lat, nearestPoint.point.lon])
            .setContent(`
              <div style="font-family: sans-serif; padding: 4px;">
                <strong>Data Point</strong><br/>
                <strong>Lat:</strong> ${nearestPoint.point.lat.toFixed(4)}<br/>
                <strong>Lon:</strong> ${nearestPoint.point.lon.toFixed(4)}<br/>
                <strong>Value:</strong> ${nearestPoint.point.value.toFixed(4)}
              </div>
            `)
            .openOn(mapRef.current!);
        }
      });

      console.log('Map initialized successfully with enhanced interactivity');

      // Initialize measurement layer
      measurementLayerRef.current = L.layerGroup().addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.stop();
          mapRef.current.off();
          mapRef.current.remove();
        } catch (error) {
          console.warn('Error during map cleanup:', error);
        } finally {
          mapRef.current = null;
        }
      }
    };
  }, [onCoordinateChange, throttledCoordinateUpdate, measurementMode, data]);

  // Handle measurement mode changes
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (!measurementMode || !measurementLayerRef.current) return;

      measurementPointsRef.current.push(e.latlng);

      // Add marker
      createMeasurementMarker(e.latlng, map);

      // Update measurement display
      if (measurementMode === 'distance' && measurementPointsRef.current.length >= 2) {
        // Clear previous polyline
        measurementLayerRef.current.clearLayers();

        // Redraw all markers
        measurementPointsRef.current.forEach((latlng) => {
          createMeasurementMarker(latlng, map);
        });

        // Draw polyline
        createMeasurementPolyline(measurementPointsRef.current, map);

        // Calculate distance
        const coords: [number, number][] = measurementPointsRef.current.map(
          (ll) => [ll.lat, ll.lng]
        );
        const distance = calculatePathDistance(coords);

        if (onMeasurementComplete) {
          onMeasurementComplete({ distance });
        }
      } else if (measurementMode === 'area' && measurementPointsRef.current.length >= 3) {
        // Clear previous polygon
        measurementLayerRef.current.clearLayers();

        // Redraw all markers
        measurementPointsRef.current.forEach((latlng) => {
          createMeasurementMarker(latlng, map);
        });

        // Draw polygon
        createMeasurementPolygon(measurementPointsRef.current, map);

        // Calculate area
        const coords: [number, number][] = measurementPointsRef.current.map(
          (ll) => [ll.lat, ll.lng]
        );
        const area = calculatePolygonArea(coords);

        if (onMeasurementComplete) {
          onMeasurementComplete({ area });
        }
      }
    };

    const handleMapDblClick = (e: L.LeafletMouseEvent) => {
      if (!measurementMode) return;

      // Prevent default zoom behavior
      L.DomEvent.stopPropagation(e);

      // Finish measurement
      if (measurementPointsRef.current.length >= 2) {
        // Measurement is complete, disable mode
        measurementPointsRef.current = [];
      }
    };

    if (measurementMode) {
      map.on('click', handleMapClick);
      map.on('dblclick', handleMapDblClick);
      map.doubleClickZoom.disable();

      // Change cursor
      map.getContainer().style.cursor = 'crosshair';
    } else {
      map.off('click', handleMapClick);
      map.off('dblclick', handleMapDblClick);
      map.doubleClickZoom.enable();

      // Reset cursor
      map.getContainer().style.cursor = '';
    }

    return () => {
      map.off('click', handleMapClick);
      map.off('dblclick', handleMapDblClick);
      map.doubleClickZoom.enable();
      map.getContainer().style.cursor = '';
    };
  }, [measurementMode, onMeasurementComplete]);

  // Handle measurement clear
  useEffect(() => {
    if (onMeasurementClear && measurementLayerRef.current) {
      const clearMeasurements = () => {
        if (measurementLayerRef.current) {
          measurementLayerRef.current.clearLayers();
        }
        measurementPointsRef.current = [];
      };

      // Expose clear function
      (window as any).__clearMeasurements = clearMeasurements;
    }
  }, [onMeasurementClear]);

  useEffect(() => {
    if (!mapRef.current) {
      console.warn('Map not initialized');
      return;
    }

    if (data.length === 0) {
      console.warn('No data to display');
      if (heatLayerRef.current) {
        mapRef.current.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
      return;
    }

    const container = mapRef.current.getContainer();
    if (!container || container.offsetWidth === 0 || container.offsetHeight === 0) {
      console.warn('Map container has invalid dimensions, waiting...');
      return;
    }

    console.log(`Rendering heatmap with ${data.length} points`);
    console.log('Sample data points:', data.slice(0, 3));
    console.log('Config:', config);
    console.log('Heatmap settings - Radius:', config.radius, 'Opacity:', config.maxOpacity, 'Intensity:', config.intensity);

    if (heatLayerRef.current) {
      mapRef.current.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    try {
      const heatData: [number, number, number][] = data.map(point => [
        point.lat,
        point.lon,
        point.value
      ]);

      console.log('Heat data sample:', heatData.slice(0, 3));

      heatLayerRef.current = L.heatLayer(heatData, {
        radius: config.radius,
        blur: config.blur,
        maxZoom: 18,
        max: config.intensity,
        minOpacity: config.minOpacity,
        maxOpacity: config.maxOpacity,
        gradient: getColorGradient(colorScheme)
      });

      if (mapRef.current) {
        heatLayerRef.current.addTo(mapRef.current);
        console.log('Heatmap layer added to map - radius:', config.radius, 'opacity:', config.maxOpacity, 'intensity:', config.intensity);
      }
    } catch (error) {
      console.error('Error creating heatmap layer:', error);
      heatLayerRef.current = null;
    }

  }, [data, config, colorScheme]);

  useEffect(() => {
    if (!mapRef.current) return;

    if (gridLayerRef.current) {
      mapRef.current.removeLayer(gridLayerRef.current);
      gridLayerRef.current = null;
    }

    if (showGrid) {
      gridLayerRef.current = L.layerGroup();

      // Add latitude lines (horizontal) - extend beyond visible bounds for world wrapping
      for (let lat = -90; lat <= 90; lat += 30) {
        const latLine = L.polyline(
          [[lat, -540], [lat, 540]], // Extended range for world wrapping
          {
            color: '#ffffff',
            weight: 1,
            opacity: 0.4,
            dashArray: '5, 5',
            interactive: false // Don't interfere with map interactions
          }
        );
        gridLayerRef.current.addLayer(latLine);
      }

      // Add longitude lines (vertical) - multiple copies for world wrapping
      for (let offset = -360; offset <= 360; offset += 360) {
        for (let lon = -180; lon <= 180; lon += 30) {
          const lonLine = L.polyline(
            [[-90, lon + offset], [90, lon + offset]],
            {
              color: '#ffffff',
              weight: 1,
              opacity: 0.4,
              dashArray: '5, 5',
              interactive: false // Don't interfere with map interactions
            }
          );
          gridLayerRef.current.addLayer(lonLine);
        }
      }

      gridLayerRef.current.addTo(mapRef.current);
    }
  }, [showGrid]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{
        zIndex: 0,
        pointerEvents: 'auto',
        position: 'relative'
      }}
    />
  );
}
