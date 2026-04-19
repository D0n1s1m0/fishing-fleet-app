import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Chip, Paper, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Circle as CircleStyle, Fill, Stroke, Style, Icon } from 'ol/style';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Circle from 'ol/geom/Circle';
import Overlay from 'ol/Overlay';
import { fromLonLat } from 'ol/proj';
import { OSM, XYZ } from 'ol/source';
import 'ol/ol.css';

interface FishingSpot {
  id: number;
  name: string;
  position: [number, number];
  depth: number;
  fishTypes: string[];
  catchRate: 'high' | 'medium' | 'low';
  description: string;
}

interface MapComponentProps {
  spots: FishingSpot[];
  center?: [number, number];
  zoom?: number;
  height?: string | number;
}

const MapComponent: React.FC<MapComponentProps> = ({ 
  spots, 
  center = [69.5, 35], 
  zoom = 5,
  height = 500 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<Overlay | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<FishingSpot | null>(null);
  const [mapSource, setMapSource] = useState<'yandex' | 'google' | 'osm'>('yandex');

  const mapSources = {
    yandex: new XYZ({
      url: 'https://core-renderer-tiles.maps.yandex.net/tiles?l=map&x={x}&y={y}&z={z}&scale=1&lang=ru_RU',
      attributions: '© Яндекс'
    }),
    google: new XYZ({
      url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      attributions: '© Google'
    }),
    osm: new OSM()
  };

  useEffect(() => {
    if (!mapRef.current) return;

    const vectorSource = new VectorSource();
    
    spots.forEach((spot) => {
      const coordinates = fromLonLat([spot.position[1], spot.position[0]]);
      
      const pointFeature = new Feature({
        geometry: new Point(coordinates),
        spotData: spot
      });

      const circleFeature = new Feature({
        geometry: new Circle(coordinates, 
          spot.catchRate === 'high' ? 50000 : 
          spot.catchRate === 'medium' ? 30000 : 15000
        )
      });

      vectorSource.addFeature(pointFeature);
      vectorSource.addFeature(circleFeature);
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: (feature) => {
        const geometry = feature.getGeometry();
        const spotData = feature.get('spotData');

        if (geometry instanceof Point && spotData) {
          const color = spotData.catchRate === 'high' ? '#4caf50' : 
                        spotData.catchRate === 'medium' ? '#ff9800' : '#f44336';
          return new Style({
            image: new CircleStyle({
              radius: 8,
              fill: new Fill({ color }),
              stroke: new Stroke({ color: '#fff', width: 2 })
            })
          });
        } else {
          return new Style({
            stroke: new Stroke({ 
              color: '#4caf50', 
              width: 2 
            }),
            fill: new Fill({ 
              color: 'rgba(76, 175, 80, 0.1)' 
            })
          });
        }
      }
    });

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({ source: mapSources[mapSource] }),
        vectorLayer
      ],
      view: new View({
        center: fromLonLat([center[1], center[0]]),
        zoom: zoom
      })
    });

    const overlay = new Overlay({
      element: popupRef.current!,
      autoPan: true,
      autoPanAnimation: { duration: 250 }
    });
    map.addOverlay(overlay);
    overlayRef.current = overlay;

    map.on('click', (evt) => {
      const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
      if (feature) {
        const spotData = feature.get('spotData');
        if (spotData) {
          setSelectedSpot(spotData);
          overlay.setPosition(evt.coordinate);
        } else {
          setSelectedSpot(null);
          overlay.setPosition(undefined);
        }
      } else {
        setSelectedSpot(null);
        overlay.setPosition(undefined);
      }
    });

    return () => {
      map.setTarget(undefined);
    };
  }, [spots, center, zoom]);

  return (
    <Box sx={{ position: 'relative', height, width: '100%' }}>
      <Paper sx={{ 
        position: 'absolute', 
        top: 10, 
        right: 10, 
        zIndex: 1000, 
        p: 1,
        bgcolor: 'rgba(255,255,255,0.95)'
      }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Карта</InputLabel>
          <Select
            value={mapSource}
            label="Карта"
            onChange={(e) => {
              setMapSource(e.target.value as any);
              // Перезагружаем страницу для смены источника
              window.location.reload();
            }}
          >
            <MenuItem value="yandex">🗺️ Яндекс</MenuItem>
            <MenuItem value="google">🌐 Google</MenuItem>
            <MenuItem value="osm">🏢 OpenStreetMap</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: 8 }} />
      
      <div ref={popupRef} style={{ 
        position: 'absolute',
        backgroundColor: 'white',
        padding: '12px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        maxWidth: '300px',
        display: selectedSpot ? 'block' : 'none',
        zIndex: 1001
      }}>
        {selectedSpot && (
          <>
            <Typography variant="h6" gutterBottom sx={{ color: '#1a5276' }}>
              {selectedSpot.name}
            </Typography>
            <Typography variant="body2" gutterBottom>
              🌊 Глубина: {selectedSpot.depth} м
            </Typography>
            <Typography variant="body2" gutterBottom>
              🐟 Виды рыб: {selectedSpot.fishTypes.join(', ')}
            </Typography>
            <Chip 
              label={`Уловистость: ${
                selectedSpot.catchRate === 'high' ? 'Высокая' : 
                selectedSpot.catchRate === 'medium' ? 'Средняя' : 'Низкая'
              }`}
              size="small"
              sx={{ 
                mt: 1,
                bgcolor: selectedSpot.catchRate === 'high' ? '#4caf50' : 
                         selectedSpot.catchRate === 'medium' ? '#ff9800' : '#f44336',
                color: 'white'
              }}
            />
            <Typography variant="body2" sx={{ mt: 1 }}>
              {selectedSpot.description}
            </Typography>
          </>
        )}
      </div>
    </Box>
  );
};

export default MapComponent;
