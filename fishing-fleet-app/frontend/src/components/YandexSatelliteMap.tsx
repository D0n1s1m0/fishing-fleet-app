import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Chip, Paper, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Circle from 'ol/geom/Circle';
import Overlay from 'ol/Overlay';
import { fromLonLat } from 'ol/proj';
import { XYZ } from 'ol/source';
import 'ol/ol.css';
import { useThemeMode } from '../contexts/ThemeContext';

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
  const [selectedSpot, setSelectedSpot] = useState<FishingSpot | null>(null);
  const [mapSource, setMapSource] = useState<'yandex' | 'google' | 'osm'>('yandex');
  const mapInstanceRef = useRef<Map | null>(null);
  const { themeMode } = useThemeMode();

  const mapSources = {
    yandex: new XYZ({
      url: 'https://core-renderer-tiles.maps.yandex.net/tiles?l=map&x={x}&y={y}&z={z}&scale=1&lang=ru_RU',
      attributions: '© Яндекс'
    }),
    google: new XYZ({
      url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      attributions: '© Google'
    }),
    osm: new XYZ({
      url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attributions: '© OpenStreetMap'
    })
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
              radius: 10,
              fill: new Fill({ color }),
              stroke: new Stroke({ color: '#fff', width: 3 })
            })
          });
        } else {
          return new Style({
            stroke: new Stroke({ color: '#4caf50', width: 2 }),
            fill: new Fill({ color: 'rgba(76, 175, 80, 0.15)' })
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

    mapInstanceRef.current = map;

    return () => {
      map.setTarget(undefined);
    };
  }, [spots, center, zoom]);

  const handleSourceChange = (newSource: 'yandex' | 'google' | 'osm') => {
    setMapSource(newSource);
    if (mapInstanceRef.current) {
      const layers = mapInstanceRef.current.getLayers();
      const baseLayer = layers.item(0) as TileLayer<any>;
      baseLayer.setSource(mapSources[newSource]);
    }
  };

  const getMarkerColor = (catchRate: string) => {
    return catchRate === 'high' ? '#4caf50' : catchRate === 'medium' ? '#ff9800' : '#f44336';
  };

  // Стили для переключателя карт в зависимости от темы
  const getSelectStyles = () => {
    if (themeMode === 'dark') {
      return {
        backgroundColor: '#1a2a1a',
        color: '#a5d6a7',
        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#4caf50' },
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#81c784' },
      };
    }
    if (themeMode === 'accessible') {
      return {
        backgroundColor: '#ffffff',
        color: '#1a237e',
        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1a237e', borderWidth: '3px' },
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#b71c1c', borderWidth: '3px' },
      };
    }
    return {
      backgroundColor: '#ffffff',
      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2e7d32' },
    };
  };

  return (
    <Box sx={{ position: 'relative', height, width: '100%' }}>
      <Paper sx={{ 
        position: 'absolute', 
        top: 10, 
        right: 10, 
        zIndex: 1000, 
        p: 1,
        bgcolor: themeMode === 'dark' ? '#1a2a1a' : themeMode === 'accessible' ? '#ffffff' : '#ffffff',
        border: themeMode === 'dark' ? '1px solid #4caf50' : themeMode === 'accessible' ? '3px solid #1a237e' : '1px solid #2e7d32'
      }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel sx={{ 
            color: themeMode === 'dark' ? '#a5d6a7' : themeMode === 'accessible' ? '#1a237e' : '#2e7d32',
            fontWeight: themeMode === 'accessible' ? 700 : 400
          }}>
            Карта
          </InputLabel>
          <Select
            value={mapSource}
            label="Карта"
            onChange={(e) => handleSourceChange(e.target.value as any)}
            sx={getSelectStyles()}
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: themeMode === 'dark' ? '#1a2a1a' : '#ffffff',
                  border: themeMode === 'dark' ? '1px solid #4caf50' : themeMode === 'accessible' ? '3px solid #1a237e' : '1px solid #2e7d32',
                }
              }
            }}
          >
            <MenuItem value="yandex">🗺️ Яндекс</MenuItem>
            <MenuItem value="google">🛰️ Google Спутник</MenuItem>
            <MenuItem value="osm">🌍 OpenStreetMap</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: themeMode === 'accessible' ? 16 : 8 }} />
      
      <div ref={popupRef} style={{ 
        position: 'absolute',
        backgroundColor: themeMode === 'dark' ? '#1a2a1a' : '#ffffff',
        color: themeMode === 'dark' ? '#e8f5e9' : '#1a3a1a',
        padding: '16px',
        borderRadius: themeMode === 'accessible' ? 16 : 12,
        boxShadow: themeMode === 'dark' ? '0 4px 20px rgba(0,0,0,0.6)' : '0 4px 20px rgba(0,0,0,0.15)',
        maxWidth: '320px',
        display: selectedSpot ? 'block' : 'none',
        zIndex: 1001,
        border: themeMode === 'dark' ? '2px solid #4caf50' : themeMode === 'accessible' ? '4px solid #1a237e' : '2px solid #2e7d32'
      }}>
        {selectedSpot && (
          <>
            <Typography variant="h6" gutterBottom sx={{ 
              color: themeMode === 'dark' ? '#4caf50' : themeMode === 'accessible' ? '#1a237e' : '#2e7d32',
              fontWeight: 700
            }}>
              {selectedSpot.name}
            </Typography>
            <Typography variant="body2" gutterBottom sx={{ color: themeMode === 'dark' ? '#a5d6a7' : 'text.secondary' }}>
              🌊 Глубина: {selectedSpot.depth} м
            </Typography>
            <Typography variant="body2" gutterBottom sx={{ color: themeMode === 'dark' ? '#a5d6a7' : 'text.secondary' }}>
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
                bgcolor: getMarkerColor(selectedSpot.catchRate),
                color: 'white',
                fontWeight: 600
              }}
            />
            <Typography variant="body2" sx={{ mt: 1.5, color: themeMode === 'dark' ? '#a5d6a7' : 'text.secondary' }}>
              {selectedSpot.description}
            </Typography>
          </>
        )}
      </div>
    </Box>
  );
};

export default MapComponent;
