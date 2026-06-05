import React from 'react';
import {
  Card, CardContent, Typography, Box, Chip, LinearProgress, Tooltip, Divider
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SpeedIcon from '@mui/icons-material/Speed';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AnchorIcon from '@mui/icons-material/Anchor';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';

interface Boat {
  id: number;
  name: string;
  type: string;
  displacement: number;
  build_date: string;
  image_url?: string;
  status: 'active' | 'maintenance' | 'pending' | 'in_port';
  captain: string;
  crew_capacity: number;
  current_crew: number;
  current_location: string;
  max_speed: number;
  fuel_level: number;
  description: string;
  last_maintenance: string;
  next_maintenance: string;
  total_catch: number;
}

interface BoatCardProps {
  boat: Boat;
  onClick: () => void;
}

const BoatPlaceholder = ({ name }: { name: string }) => (
  <Box sx={{
    height: 200,
    background: 'linear-gradient(135deg, #1a5276 0%, #2980b9 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white'
  }}>
    <DirectionsBoatIcon sx={{ fontSize: 80, mb: 1, opacity: 0.9 }} />
    <Typography variant="h6" sx={{ fontFamily: '"Times New Roman", Times, serif' }}>
      {name}
    </Typography>
  </Box>
);

const BoatCard: React.FC<BoatCardProps> = ({ boat, onClick }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'maintenance': return 'warning';
      case 'pending': return 'info';
      case 'in_port': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'В рейсе';
      case 'maintenance': return 'На обслуживании';
      case 'pending': return 'На проверке';
      case 'in_port': return 'В порту';
      default: return status;
    }
  };

  return (
    <Card 
      sx={{ 
        cursor: 'pointer', 
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': { 
          transform: 'translateY(-5px)',
          boxShadow: 8
        }
      }} 
      onClick={onClick}
    >
      <BoatPlaceholder name={boat.name} />
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="h6" sx={{ fontFamily: '"Times New Roman", Times, serif', fontWeight: 600, color: 'primary.main' }}>
            {boat.name}
          </Typography>
          <Chip 
            label={getStatusLabel(boat.status)}
            color={getStatusColor(boat.status) as any}
            size="small"
            sx={{ fontFamily: '"Times New Roman", Times, serif' }}
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontFamily: '"Times New Roman", Times, serif' }}>
          {boat.type} | {new Date(boat.build_date).toLocaleDateString('ru-RU')}
        </Typography>
        
        <Divider sx={{ my: 1.5 }} />
        
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
          <Tooltip title="Капитан">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PersonIcon fontSize="small" color="primary" />
              <Typography variant="body2" noWrap sx={{ fontFamily: '"Times New Roman", Times, serif' }}>{boat.captain}</Typography>
            </Box>
          </Tooltip>
          
          <Tooltip title="Скорость">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <SpeedIcon fontSize="small" color="primary" />
              <Typography variant="body2" sx={{ fontFamily: '"Times New Roman", Times, serif' }}>{boat.max_speed} узл.</Typography>
            </Box>
          </Tooltip>
          
          <Tooltip title="Местоположение">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LocationOnIcon fontSize="small" color="primary" />
              <Typography variant="body2" noWrap sx={{ fontFamily: '"Times New Roman", Times, serif' }}>{boat.current_location}</Typography>
            </Box>
          </Tooltip>
          
          <Tooltip title="Экипаж">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AnchorIcon fontSize="small" color="primary" />
              <Typography variant="body2" sx={{ fontFamily: '"Times New Roman", Times, serif' }}>{boat.current_crew}/{boat.crew_capacity}</Typography>
            </Box>
          </Tooltip>
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Times New Roman", Times, serif' }}>
              <WaterDropIcon fontSize="small" sx={{ verticalAlign: 'middle' }} /> Топливо
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Times New Roman", Times, serif' }}>
              {boat.fuel_level}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={boat.fuel_level} 
            sx={{ height: 8 }}
            color={boat.fuel_level > 50 ? 'success' : boat.fuel_level > 20 ? 'warning' : 'error'}
          />
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Times New Roman", Times, serif' }}>
            Улов: {boat.total_catch} т
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Times New Roman", Times, serif' }}>
            <CalendarTodayIcon fontSize="small" sx={{ verticalAlign: 'middle' }} /> 
            ТО: {new Date(boat.next_maintenance).toLocaleDateString('ru-RU')}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BoatCard;
