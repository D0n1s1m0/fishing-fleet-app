import React, { useState } from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Collapse, Box, Typography, Grid, LinearProgress,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface CrewMember {
  id: number;
  name: string;
  position: string;
  experience: number;
}

interface Catch {
  fish_type: string;
  amount: number;
  quality: 'excellent' | 'good' | 'poor';
}

interface Trip {
  id: number;
  boat_name: string;
  boat_id: number;
  departure_date: string;
  return_date: string | null;
  status: 'active' | 'completed' | 'planned' | 'pending';
  total_catch: number;
  progress: number;
  crew: CrewMember[];
  catches: Catch[];
  fishing_spots: string[];
}

interface Boat {
  id: number;
  name: string;
  status: string;
}

interface FishingSpot {
  id: number;
  name: string;
  depth: number;
}

interface TripListProps {
  trips: Trip[];
  boats: Boat[];
  spots: FishingSpot[];
  onAddTrip?: (data: any) => void;
  onCompleteTrip?: (id: number) => void;
  isAdmin?: boolean;
}

const TripRow: React.FC<{ trip: Trip; onComplete?: (id: number) => void; isAdmin?: boolean }> = ({ trip, onComplete, isAdmin }) => {
  const [open, setOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'default';
      case 'planned': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return '🚢 Активен';
      case 'completed': return '✅ Завершен';
      case 'planned': return '📋 Запланирован';
      default: return status;
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'success';
      case 'good': return 'primary';
      case 'poor': return 'error';
      default: return 'default';
    }
  };

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{trip.boat_name}</TableCell>
        <TableCell>{new Date(trip.departure_date).toLocaleDateString('ru-RU')}</TableCell>
        <TableCell>{trip.return_date ? new Date(trip.return_date).toLocaleDateString('ru-RU') : '—'}</TableCell>
        <TableCell>{trip.total_catch} т</TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              label={getStatusLabel(trip.status)}
              color={getStatusColor(trip.status) as any}
              size="small"
            />
            {trip.status === 'active' && isAdmin && onComplete && (
              <IconButton size="small" color="success" onClick={() => onComplete(trip.id)} title="Завершить рейс">
                <CheckCircleIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Typography variant="h6" gutterBottom>Детали рейса</Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Экипаж ({trip.crew.length} чел.)
                  </Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>ФИО</TableCell>
                        <TableCell>Должность</TableCell>
                        <TableCell>Опыт (лет)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {trip.crew.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>{member.name}</TableCell>
                          <TableCell>{member.position}</TableCell>
                          <TableCell>{member.experience}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    <RestaurantIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Улов по видам
                  </Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Вид рыбы</TableCell>
                        <TableCell>Количество (т)</TableCell>
                        <TableCell>Качество</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {trip.catches.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{item.fish_type}</TableCell>
                          <TableCell>{item.amount}</TableCell>
                          <TableCell>
                            <Chip 
                              label={item.quality === 'excellent' ? 'Отличное' : item.quality === 'good' ? 'Хорошее' : 'Низкое'}
                              color={getQualityColor(item.quality) as any}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    <LocationOnIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Места лова
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {trip.fishing_spots.map((spot, idx) => (
                      <Chip key={idx} label={spot} variant="outlined" />
                    ))}
                  </Box>
                </Grid>
                
                {trip.status === 'active' && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Прогресс рейса: {trip.progress}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={trip.progress} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Grid>
                )}
              </Grid>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const TripList: React.FC<TripListProps> = ({ trips, boats, spots, onAddTrip, onCompleteTrip, isAdmin }) => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newTrip, setNewTrip] = useState({
    boat_id: 0,
    departure_date: new Date().toISOString().split('T')[0],
    fishing_spots: [''],
    crew: [{ id: 1, name: '', position: 'Капитан', experience: 0 }],
    catches: []
  });

  const activeBoats = boats.filter(b => b.status === 'in_port' || b.status === 'active');
  const fishingSpotsList = spots.filter(s => s.depth > 0);

  const handleAddTrip = () => {
    if (onAddTrip && newTrip.boat_id > 0 && newTrip.fishing_spots[0]) {
      onAddTrip(newTrip);
      setAddDialogOpen(false);
      setNewTrip({
        boat_id: 0,
        departure_date: new Date().toISOString().split('T')[0],
        fishing_spots: [''],
        crew: [{ id: 1, name: '', position: 'Капитан', experience: 0 }],
        catches: []
      });
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ color: 'primary.main' }}>
          🚢 Рейсы флота ({trips.filter(t => t.status === 'active').length} активных)
        </Typography>
        {(isAdmin || true) && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddDialogOpen(true)}
          >
            Новый рейс
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Судно</TableCell>
              <TableCell>Дата выхода</TableCell>
              <TableCell>Дата возвращения</TableCell>
              <TableCell>Улов (т)</TableCell>
              <TableCell>Статус</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trips.map((trip) => (
              <TripRow key={trip.id} trip={trip} onComplete={onCompleteTrip} isAdmin={isAdmin} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Новый рейс</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Выберите судно</InputLabel>
                <Select
                  value={newTrip.boat_id}
                  label="Выберите судно"
                  onChange={(e) => setNewTrip({ ...newTrip, boat_id: Number(e.target.value) })}
                >
                  <MenuItem value={0}>Выберите судно...</MenuItem>
                  {activeBoats.map(boat => (
                    <MenuItem key={boat.id} value={boat.id}>{boat.name} ({boat.status === 'active' ? 'в рейсе' : 'в порту'})</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Дата выхода"
                type="date"
                value={newTrip.departure_date}
                onChange={(e) => setNewTrip({ ...newTrip, departure_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Место лова</InputLabel>
                <Select
                  value={newTrip.fishing_spots[0] || ''}
                  label="Место лова"
                  onChange={(e) => setNewTrip({ ...newTrip, fishing_spots: [e.target.value] })}
                >
                  <MenuItem value="">Выберите место...</MenuItem>
                  {fishingSpotsList.map(spot => (
                    <MenuItem key={spot.id} value={spot.name}>{spot.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Капитан</Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="ФИО капитана"
                value={newTrip.crew[0].name}
                onChange={(e) => setNewTrip({
                  ...newTrip,
                  crew: [{ ...newTrip.crew[0], name: e.target.value }]
                })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleAddTrip}>
            Создать рейс
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TripList;
