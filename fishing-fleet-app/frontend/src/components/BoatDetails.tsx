import React, { useState, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Card, CardMedia,
  Typography, Box, Chip, List, ListItem, ListItemIcon, ListItemText,
  IconButton, TextField, Tabs, Tab, Slider, Alert, Snackbar, InputAdornment,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import StraightenIcon from '@mui/icons-material/Straighten';
import SpeedIcon from '@mui/icons-material/Speed';
import PeopleIcon from '@mui/icons-material/People';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import NumbersIcon from '@mui/icons-material/Numbers';

interface FishingSpot {
  id: number;
  name: string;
  position: [number, number];
  depth: number;
  fishTypes: string[];
  catchRate: string;
  description: string;
}

interface Boat {
  id: number;
  name: string;
  type: string;
  displacement: number;
  build_date: string;
  passport_number: string;
  image_url?: string;
  status: 'active' | 'maintenance' | 'pending';
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
  trips: any[];
  length?: number;
  width?: number;
  engine_power?: number;
}

interface BoatDetailsProps {
  boat: Boat | null;
  spots: FishingSpot[];
  open: boolean;
  onClose: () => void;
  onUpdate?: (updates: Partial<Boat>) => void;
  isAdmin?: boolean;
}

const BoatDetails: React.FC<BoatDetailsProps> = ({ boat, spots, open, onClose, onUpdate, isAdmin }) => {
  const [editMode, setEditMode] = useState(false);
  const [editedBoat, setEditedBoat] = useState<Boat | null>(boat);
  const [selectedTab, setSelectedTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setEditedBoat(boat);
    setEditMode(false);
  }, [boat]);

  if (!boat || !editedBoat) return null;

  const handleSave = () => {
    if (onUpdate && editedBoat) {
      onUpdate(editedBoat);
      setSnackbar({ open: true, message: '✅ Изменения сохранены!' });
      setEditMode(false);
    }
  };

  const handleCancel = () => {
    setEditedBoat(boat);
    setEditMode(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedBoat({ ...editedBoat, image_url: reader.result as string });
        setSnackbar({ open: true, message: '📸 Фото загружено!' });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setEditedBoat({ ...editedBoat, image_url: url });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'maintenance': return 'warning';
      case 'pending': return 'info';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return '🚢 Активно';
      case 'maintenance': return '🔧 Обслуживание';
      case 'pending': return '⏳ На проверке';
      default: return status;
    }
  };

  const updateField = (field: keyof Boat, value: any) => {
    setEditedBoat({ ...editedBoat, [field]: value });
  };

  const locationOptions = [
    { value: 'Порт Мурманск', label: '🏠 Порт Мурманск' },
    ...spots.filter(s => s.depth > 0).map(spot => ({
      value: spot.name,
      label: `🎣 ${spot.name}`
    }))
  ];

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DirectionsBoatIcon />
              {editMode ? (
                <TextField 
                  value={editedBoat.name} 
                  onChange={(e) => updateField('name', e.target.value)} 
                  size="small" 
                  sx={{ width: 200 }}
                />
              ) : (
                <Typography variant="h6">{boat.name}</Typography>
              )}
              <Chip 
                label={getStatusLabel(boat.status)}
                color={getStatusColor(boat.status) as any}
                size="small"
              />
            </Box>
            <Box>
              {isAdmin && (
                editMode ? (
                  <>
                    <IconButton onClick={handleSave} color="primary">
                      <SaveIcon />
                    </IconButton>
                    <IconButton onClick={handleCancel} color="error">
                      <CloseIcon />
                    </IconButton>
                  </>
                ) : (
                  <IconButton onClick={() => setEditMode(true)}>
                    <EditIcon />
                  </IconButton>
                )
              )}
              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                {editMode ? (
                  <Box sx={{ p: 2 }}>
                    <Box 
                      sx={{ 
                        height: 200, 
                        bgcolor: 'grey.100', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        mb: 2,
                        borderRadius: 1,
                        backgroundImage: editedBoat.image_url ? `url(${editedBoat.image_url})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      {!editedBoat.image_url && (
                        <Typography color="text.secondary">Нет фото</Typography>
                      )}
                    </Box>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleImageUpload}
                    />
                    
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      onClick={() => fileInputRef.current?.click()}
                      sx={{ mb: 1 }}
                    >
                      Загрузить фото
                    </Button>
                    
                    <TextField
                      fullWidth
                      size="small"
                      label="Или вставьте ссылку на фото"
                      value={editedBoat.image_url || ''}
                      onChange={(e) => handleImageUrlChange(e.target.value)}
                      placeholder="https://..."
                    />
                  </Box>
                ) : (
                  <CardMedia
                    component="img"
                    height="250"
                    image={editedBoat.image_url || `https://via.placeholder.com/400x250/1a5276/ffffff?text=${encodeURIComponent(boat.name)}`}
                    alt={boat.name}
                  />
                )}
              </Card>
              
              {!editMode && (
                <Box sx={{ p: 2 }}>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><NumbersIcon /></ListItemIcon>
                      <ListItemText primary="Паспорт" secondary={boat.passport_number} />
                    </ListItem>
                  </List>
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Tabs value={selectedTab} onChange={(_, v) => setSelectedTab(v)} sx={{ mb: 2 }}>
                <Tab label="Основное" />
                <Tab label="Характеристики" />
                <Tab label="История" />
              </Tabs>
              
              {selectedTab === 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>Капитан</Typography>
                    {editMode ? (
                      <TextField 
                        fullWidth 
                        size="small" 
                        value={editedBoat.captain} 
                        onChange={(e) => updateField('captain', e.target.value)} 
                      />
                    ) : (
                      <Typography variant="body1" paragraph>{boat.captain}</Typography>
                    )}
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>Тип судна</Typography>
                    {editMode ? (
                      <TextField 
                        fullWidth 
                        size="small" 
                        value={editedBoat.type} 
                        onChange={(e) => updateField('type', e.target.value)} 
                      />
                    ) : (
                      <Typography variant="body1" paragraph>{boat.type}</Typography>
                    )}
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>Местоположение</Typography>
                    {editMode ? (
                      <FormControl fullWidth size="small">
                        <InputLabel>Местоположение</InputLabel>
                        <Select
                          value={editedBoat.current_location}
                          label="Местоположение"
                          onChange={(e) => updateField('current_location', e.target.value)}
                        >
                          {locationOptions.map(opt => (
                            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <LocationOnIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="body1">{boat.current_location}</Typography>
                      </Box>
                    )}
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>Описание</Typography>
                    {editMode ? (
                      <TextField 
                        fullWidth 
                        multiline 
                        rows={3} 
                        size="small" 
                        value={editedBoat.description} 
                        onChange={(e) => updateField('description', e.target.value)} 
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {boat.description}
                      </Typography>
                    )}
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>Экипаж</Typography>
                    {editMode ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField 
                          type="number" 
                          size="small" 
                          value={editedBoat.current_crew} 
                          onChange={(e) => updateField('current_crew', parseInt(e.target.value))} 
                          sx={{ width: 80 }}
                        />
                        <Typography>/</Typography>
                        <TextField 
                          type="number" 
                          size="small" 
                          value={editedBoat.crew_capacity} 
                          onChange={(e) => updateField('crew_capacity', parseInt(e.target.value))} 
                          sx={{ width: 80 }}
                        />
                      </Box>
                    ) : (
                      <Typography variant="body1">{boat.current_crew} / {boat.crew_capacity} чел.</Typography>
                    )}
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>Уровень топлива</Typography>
                    {editMode ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Slider 
                          value={editedBoat.fuel_level} 
                          onChange={(_, v) => updateField('fuel_level', v as number)} 
                          min={0} 
                          max={100} 
                          sx={{ width: 150 }}
                        />
                        <TextField 
                          type="number" 
                          size="small" 
                          value={editedBoat.fuel_level} 
                          onChange={(e) => updateField('fuel_level', parseInt(e.target.value))} 
                          sx={{ width: 80 }}
                          InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                        />
                      </Box>
                    ) : (
                      <Typography variant="body1">{boat.fuel_level}%</Typography>
                    )}
                  </Grid>
                </Grid>
              )}
              
              {selectedTab === 1 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>Водоизмещение</Typography>
                    {editMode ? (
                      <TextField 
                        fullWidth 
                        type="number" 
                        size="small" 
                        value={editedBoat.displacement} 
                        onChange={(e) => updateField('displacement', parseFloat(e.target.value))} 
                        InputProps={{ endAdornment: <InputAdornment position="end">т</InputAdornment> }}
                      />
                    ) : (
                      <Typography variant="body1">{boat.displacement} т</Typography>
                    )}
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>Макс. скорость</Typography>
                    {editMode ? (
                      <TextField 
                        fullWidth 
                        type="number" 
                        size="small" 
                        value={editedBoat.max_speed} 
                        onChange={(e) => updateField('max_speed', parseFloat(e.target.value))} 
                        InputProps={{ endAdornment: <InputAdornment position="end">узл</InputAdornment> }}
                      />
                    ) : (
                      <Typography variant="body1">{boat.max_speed} узлов</Typography>
                    )}
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>Длина</Typography>
                    {editMode ? (
                      <TextField 
                        fullWidth 
                        type="number" 
                        size="small" 
                        value={editedBoat.length || 85} 
                        onChange={(e) => updateField('length', parseFloat(e.target.value))} 
                        InputProps={{ endAdornment: <InputAdornment position="end">м</InputAdornment> }}
                      />
                    ) : (
                      <Typography variant="body1">{boat.length || 85} м</Typography>
                    )}
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>Ширина</Typography>
                    {editMode ? (
                      <TextField 
                        fullWidth 
                        type="number" 
                        size="small" 
                        value={editedBoat.width || 16} 
                        onChange={(e) => updateField('width', parseFloat(e.target.value))} 
                        InputProps={{ endAdornment: <InputAdornment position="end">м</InputAdornment> }}
                      />
                    ) : (
                      <Typography variant="body1">{boat.width || 16} м</Typography>
                    )}
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>Мощность двигателя</Typography>
                    {editMode ? (
                      <TextField 
                        fullWidth 
                        type="number" 
                        size="small" 
                        value={editedBoat.engine_power || 5200} 
                        onChange={(e) => updateField('engine_power', parseFloat(e.target.value))} 
                        InputProps={{ endAdornment: <InputAdornment position="end">л.с.</InputAdornment> }}
                      />
                    ) : (
                      <Typography variant="body1">{boat.engine_power || 5200} л.с.</Typography>
                    )}
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>Номер паспорта</Typography>
                    {editMode ? (
                      <TextField 
                        fullWidth 
                        size="small" 
                        value={editedBoat.passport_number} 
                        onChange={(e) => updateField('passport_number', e.target.value)} 
                      />
                    ) : (
                      <Typography variant="body1">{boat.passport_number}</Typography>
                    )}
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>Дата постройки</Typography>
                    {editMode ? (
                      <TextField 
                        fullWidth 
                        type="date" 
                        size="small" 
                        value={editedBoat.build_date} 
                        onChange={(e) => updateField('build_date', e.target.value)} 
                        InputLabelProps={{ shrink: true }}
                      />
                    ) : (
                      <Typography variant="body1">{new Date(boat.build_date).toLocaleDateString('ru-RU')}</Typography>
                    )}
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>Последнее ТО</Typography>
                    {editMode ? (
                      <TextField 
                        fullWidth 
                        type="date" 
                        size="small" 
                        value={editedBoat.last_maintenance} 
                        onChange={(e) => updateField('last_maintenance', e.target.value)} 
                        InputLabelProps={{ shrink: true }}
                      />
                    ) : (
                      <Typography variant="body1">{new Date(boat.last_maintenance).toLocaleDateString('ru-RU')}</Typography>
                    )}
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>Следующее ТО</Typography>
                    {editMode ? (
                      <TextField 
                        fullWidth 
                        type="date" 
                        size="small" 
                        value={editedBoat.next_maintenance} 
                        onChange={(e) => updateField('next_maintenance', e.target.value)} 
                        InputLabelProps={{ shrink: true }}
                      />
                    ) : (
                      <Typography variant="body1">{new Date(boat.next_maintenance).toLocaleDateString('ru-RU')}</Typography>
                    )}
                  </Grid>
                </Grid>
              )}
              
              {selectedTab === 2 && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>История рейсов</Typography>
                  {boat.trips && boat.trips.length > 0 ? (
                    boat.trips.map((trip, idx) => (
                      <Card key={idx} sx={{ mb: 2, p: 2 }}>
                        <Typography variant="subtitle2">Рейс #{idx + 1}</Typography>
                        <Typography variant="body2">Дата: {trip.departure_date}</Typography>
                        <Typography variant="body2">Улов: {trip.catch_amount} т</Typography>
                      </Card>
                    ))
                  ) : (
                    <Alert severity="info">Нет данных о рейсах</Alert>
                  )}
                  
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>Общий улов</Typography>
                  {editMode ? (
                    <TextField 
                      type="number" 
                      size="small" 
                      value={editedBoat.total_catch} 
                      onChange={(e) => updateField('total_catch', parseFloat(e.target.value))} 
                      InputProps={{ endAdornment: <InputAdornment position="end">т</InputAdornment> }}
                    />
                  ) : (
                    <Typography variant="h6" color="primary">{boat.total_catch} т</Typography>
                  )}
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          {editMode && (
            <>
              <Button onClick={handleCancel}>Отмена</Button>
              <Button variant="contained" onClick={handleSave} startIcon={<SaveIcon />}>
                Сохранить все изменения
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })} 
        message={snackbar.message} 
      />
    </>
  );
};

export default BoatDetails;
