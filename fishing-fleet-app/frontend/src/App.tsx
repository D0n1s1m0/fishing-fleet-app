import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import {
  CssBaseline, Container, Typography, Box, AppBar, Toolbar, Button,
  Card, CardContent, Grid, Paper, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Chip, Menu, MenuItem,
  Tooltip, Avatar, Alert, Snackbar, Badge, LinearProgress
} from '@mui/material';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import AddIcon from '@mui/icons-material/Add';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import NotificationsIcon from '@mui/icons-material/Notifications';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import { ThemeProvider, useThemeMode } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MapComponent from './components/YandexSatelliteMap';
import BoatCard from './components/BoatCard';
import TripList from './components/TripList';
import BoatDetails from './components/BoatDetails';
import RequestForm from './components/RequestForm';

// Типы
interface FishingSpot {
  id: number;
  name: string;
  position: [number, number];
  depth: number;
  fishTypes: string[];
  catchRate: 'high' | 'medium' | 'low';
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
  trips: any[];
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
  crew: any[];
  catches: any[];
  fishing_spots: string[];
}

// Начальные данные
const DEFAULT_SPOTS: FishingSpot[] = [
  { id: 1, name: 'Медвежинская банка', position: [73.5, 38], depth: 240, fishTypes: ['Треска', 'Пикша', 'Сайда'], catchRate: 'high', description: 'Крупнейшее рыболовное угодье' },
  { id: 2, name: 'Гусиная банка', position: [71.5, 45], depth: 180, fishTypes: ['Треска', 'Минтай'], catchRate: 'medium', description: 'Хорошее место для ловли трески' },
  { id: 3, name: 'Кильдинская банка', position: [69.5, 35], depth: 150, fishTypes: ['Пикша', 'Сайда', 'Камбала'], catchRate: 'high', description: 'Богатое разнообразие донных рыб' },
  { id: 4, name: 'Порт Мурманск', position: [68.97, 33.08], depth: 0, fishTypes: [], catchRate: 'low', description: 'Порт приписки' }
];

const DEFAULT_BOATS: Boat[] = [
  { id: 1, name: 'Атлант', type: 'Траулер', displacement: 3500, build_date: '2018-05-15', passport_number: 'TR-001', status: 'active', captain: 'Сергеев А.Н.', crew_capacity: 25, current_crew: 22, current_location: 'Медвежинская банка', max_speed: 14, fuel_level: 75, description: 'Современный траулер', last_maintenance: '2026-01-15', next_maintenance: '2026-07-15', total_catch: 450, trips: [] },
  { id: 2, name: 'Баренц', type: 'Сейнер', displacement: 1200, build_date: '2020-03-20', passport_number: 'SN-015', status: 'active', captain: 'Иванов В.П.', crew_capacity: 15, current_crew: 14, current_location: 'Гусиная банка', max_speed: 12, fuel_level: 45, description: 'Кошельковый сейнер', last_maintenance: '2026-02-01', next_maintenance: '2026-08-01', total_catch: 280, trips: [] },
  { id: 3, name: 'Восток', type: 'Траулер', displacement: 2800, build_date: '2019-11-10', passport_number: 'TR-023', status: 'in_port', captain: 'Петров М.С.', crew_capacity: 20, current_crew: 18, current_location: 'Порт Мурманск', max_speed: 13, fuel_level: 90, description: 'Траулер-морозильщик', last_maintenance: '2026-03-10', next_maintenance: '2026-04-20', total_catch: 320, trips: [] }
];

const DEFAULT_TRIPS: Trip[] = [
  { id: 1, boat_name: 'Атлант', boat_id: 1, departure_date: '2026-04-01', return_date: null, status: 'active', total_catch: 45, progress: 65, crew: [{ id: 1, name: 'Сергеев А.Н.', position: 'Капитан', experience: 15 }], catches: [{ fish_type: 'Треска', amount: 30, quality: 'excellent' }], fishing_spots: ['Медвежинская банка'] },
  { id: 2, boat_name: 'Баренц', boat_id: 2, departure_date: '2026-04-03', return_date: null, status: 'active', total_catch: 28, progress: 40, crew: [{ id: 2, name: 'Иванов В.П.', position: 'Капитан', experience: 12 }], catches: [{ fish_type: 'Минтай', amount: 28, quality: 'good' }], fishing_spots: ['Гусиная банка'] }
];

// Сброс localStorage
const resetStorage = () => {
  localStorage.setItem('fishingSpots', JSON.stringify(DEFAULT_SPOTS));
  localStorage.setItem('boats', JSON.stringify(DEFAULT_BOATS));
  localStorage.setItem('trips', JSON.stringify(DEFAULT_TRIPS));
  localStorage.setItem('requests', JSON.stringify([]));
};

if (!localStorage.getItem('fishingSpots') || !localStorage.getItem('boats')) {
  resetStorage();
}

// Хранилище
const useAppStore = () => {
  const [fishingSpots, setFishingSpots] = useState<FishingSpot[]>(() => {
    try {
      const saved = localStorage.getItem('fishingSpots');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((s: any) => ({
            ...s,
            fishTypes: Array.isArray(s.fishTypes) ? s.fishTypes : [],
            position: Array.isArray(s.position) && s.position.length >= 2 ? s.position : [69.0, 35.0]
          }));
        }
      }
    } catch (e) {}
    return DEFAULT_SPOTS;
  });
  
  const [boats, setBoats] = useState<Boat[]>(() => {
    try {
      const saved = localStorage.getItem('boats');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_BOATS;
  });
  
  const [trips, setTrips] = useState<Trip[]>(() => {
    try {
      const saved = localStorage.getItem('trips');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_TRIPS;
  });
  
  const [requests, setRequests] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('requests') || '[]'); } catch { return []; }
  });

  useEffect(() => { localStorage.setItem('fishingSpots', JSON.stringify(fishingSpots)); }, [fishingSpots]);
  useEffect(() => { localStorage.setItem('boats', JSON.stringify(boats)); }, [boats]);
  useEffect(() => { localStorage.setItem('trips', JSON.stringify(trips)); }, [trips]);
  useEffect(() => { localStorage.setItem('requests', JSON.stringify(requests)); }, [requests]);

  useEffect(() => {
    setBoats(prev => prev.map(b => {
      const hasActiveTrip = trips.some(t => t.boat_id === b.id && t.status === 'active');
      if (b.status === 'maintenance' || b.status === 'pending') return b;
      return { ...b, status: hasActiveTrip ? 'active' : 'in_port' };
    }));
  }, [trips]);

  const addRequest = (type: string, data: any, createdBy: string) => {
    setRequests([...requests, { id: Date.now(), type, data, status: 'pending', createdBy, createdAt: new Date().toISOString().split('T')[0] }]);
  };

  const approveRequest = (reqId: number) => {
    const req = requests.find(r => r.id === reqId);
    if (!req) return;
    if (req.type === 'boat') {
      setBoats([...boats, { ...req.data, id: Date.now(), status: 'in_port', current_crew: 0, fuel_level: 100, total_catch: 0, trips: [] }]);
    } else if (req.type === 'spot') {
      const newSpot = { ...req.data, id: Date.now(), fishTypes: req.data.fishTypes || [], position: req.data.position || [69.0, 35.0] };
      setFishingSpots([...fishingSpots, newSpot]);
    }
    setRequests(requests.map(r => r.id === reqId ? { ...r, status: 'approved' } : r));
  };

  const rejectRequest = (reqId: number) => {
    setRequests(requests.map(r => r.id === reqId ? { ...r, status: 'rejected' } : r));
  };

  const updateBoat = (boatId: number, updates: Partial<Boat>) => {
    setBoats(boats.map(b => b.id === boatId ? { ...b, ...updates } : b));
  };

  const deleteBoat = (boatId: number) => setBoats(boats.filter(b => b.id !== boatId));
  const approveBoat = (boatId: number) => setBoats(boats.map(b => b.id === boatId ? { ...b, status: 'in_port' } : b));
  const deleteSpot = (spotId: number) => setFishingSpots(fishingSpots.filter(s => s.id !== spotId));
  
  const addTrip = (tripData: any) => {
    const boat = boats.find(b => b.id === tripData.boat_id);
    setTrips([...trips, { ...tripData, id: Date.now(), boat_name: boat?.name || 'Неизвестно', status: 'active', total_catch: 0, progress: 0 }]);
    if (boat) updateBoat(boat.id, { current_location: tripData.fishing_spots?.[0] || boat.current_location });
  };

  const completeTrip = (tripId: number) => {
    const trip = trips.find(t => t.id === tripId);
    if (trip) {
      const boat = boats.find(b => b.id === trip.boat_id);
      if (boat) {
        updateBoat(boat.id, { current_location: 'Порт Мурманск', total_catch: boat.total_catch + trip.total_catch });
      }
    }
    setTrips(trips.map(t => t.id === tripId ? { ...t, status: 'completed', return_date: new Date().toISOString().split('T')[0], progress: 100 } : t));
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const activeTripsCount = trips.filter(t => t.status === 'active').length;
  const fishingSpotsList = fishingSpots.filter(s => s.depth > 0 && s.position && Array.isArray(s.position));
  const totalBoats = boats.filter(b => b.status !== 'pending').length;
  const totalCatch = boats.reduce((sum, boat) => sum + (boat.total_catch || 0), 0);
  const activeBoatsList = boats.filter(b => b.status === 'active');
  const tripsList = trips.filter(t => t.status === 'active');

  const catchByFishType = () => {
    const result: { [key: string]: number } = {};
    trips.forEach(t => {
      t.catches?.forEach((c: any) => {
        result[c.fish_type] = (result[c.fish_type] || 0) + (c.amount || 0);
      });
    });
    if (Object.keys(result).length === 0) {
      return [
        { name: 'Треска', amount: Math.round(totalCatch * 0.5) },
        { name: 'Пикша', amount: Math.round(totalCatch * 0.3) },
        { name: 'Минтай', amount: Math.round(totalCatch * 0.2) }
      ];
    }
    return Object.entries(result).map(([name, amount]) => ({ name, amount }));
  };

  return { 
    fishingSpots: fishingSpotsList, allSpots: fishingSpots, boats, trips, requests, pendingCount, activeTripsCount,
    totalBoats, totalCatch, activeBoatsList, tripsList, catchByFishType: catchByFishType(),
    addRequest, approveRequest, rejectRequest, updateBoat, deleteBoat, approveBoat, deleteSpot, addTrip, completeTrip 
  };
};

// Компонент входа
function LoginDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Вход</DialogTitle>
      <DialogContent>
        <TextField fullWidth label="Логин" margin="normal" value={username} onChange={(e) => setUsername(e.target.value)} />
        <TextField fullWidth label="Пароль" type="password" margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Typography variant="body2" sx={{ mt: 2, p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
          👤 guest/guest | 👔 client/client | 👑 admin/admin
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button variant="contained" onClick={async () => { await login(username, password); onClose(); }}>Войти</Button>
      </DialogActions>
    </Dialog>
  );
}

// Хедер
function AppHeader({ pendingCount, onAddRequest }: any) {
  const navigate = useNavigate();
  const { user, logout, isAdmin, isGuest } = useAuth();
  const { themeMode, setThemeMode } = useThemeMode();
  const [loginOpen, setLoginOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const getThemeIcon = () => themeMode === 'dark' ? <DarkModeIcon /> : themeMode === 'accessible' ? <AccessibilityNewIcon /> : <LightModeIcon />;
  
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <DirectionsBoatIcon sx={{ mr: 2, cursor: 'pointer' }} onClick={() => navigate('/')} />
          <Typography variant="h6" sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>🚢 Северный Флот</Typography>
          <Button color="inherit" onClick={() => navigate('/')}>Главная</Button>
          <Button color="inherit" onClick={() => navigate('/boats')}>Суда</Button>
          <Button color="inherit" onClick={() => navigate('/trips')}>Рейсы</Button>
          <Button color="inherit" onClick={() => navigate('/spots')} startIcon={<LocationOnIcon />}>Места лова</Button>
          
          {!isGuest && (
            <Button color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)} startIcon={<AddIcon />}>Заявка</Button>
          )}
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => { onAddRequest('boat'); setAnchorEl(null); }}>🚢 Судно</MenuItem>
            <MenuItem onClick={() => { onAddRequest('trip'); setAnchorEl(null); }}>🛥️ Рейс</MenuItem>
            <MenuItem onClick={() => { onAddRequest('spot'); setAnchorEl(null); }}>📍 Место</MenuItem>
          </Menu>
          
          {isAdmin && (
            <IconButton color="inherit" onClick={() => navigate('/admin')}>
              <Badge badgeContent={pendingCount} color="error"><NotificationsIcon /></Badge>
            </IconButton>
          )}
          
          <IconButton color="inherit" onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : themeMode === 'dark' ? 'accessible' : 'light')}>{getThemeIcon()}</IconButton>
          
          {user ? (
            <>
              <Chip avatar={<Avatar>{user.role[0]}</Avatar>} label={user.full_name} sx={{ ml: 1 }} />
              <IconButton color="inherit" onClick={logout}><LogoutIcon /></IconButton>
            </>
          ) : <Button color="inherit" onClick={() => setLoginOpen(true)} startIcon={<LoginIcon />}>Войти</Button>}
        </Toolbar>
      </AppBar>
      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}

// Главная
function HomePage({ boats, trips, spots, activeTripsCount, totalBoats, totalCatch, activeBoatsList, tripsList, catchByFishType }: any) {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>
        <DirectionsBoatIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Панель управления • Северный Флот
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        {isAdmin && '👑 Вы вошли как Администратор. Вам доступны все функции управления.'}
        {!isAdmin && useAuth().isClient && '👔 Вы вошли как Клиент. Вы можете подавать заявки.'}
        {!isAdmin && !useAuth().isClient && '👤 Вы вошли как Гость. Вам доступен просмотр.'}
      </Alert>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ cursor: 'pointer', background: 'linear-gradient(135deg, #1a5276 0%, #2980b9 100%)', color: 'white' }} onClick={() => navigate('/boats')}>
            <CardContent>
              <Typography variant="h6">Всего судов</Typography>
              <Typography variant="h3">{totalBoats}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>Активных: {activeBoatsList.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ cursor: 'pointer', background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)', color: 'white' }} onClick={() => navigate('/trips')}>
            <CardContent>
              <Typography variant="h6">Активных рейсов</Typography>
              <Typography variant="h3">{activeTripsCount}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>Завершено: {trips.filter((t: Trip) => t.status === 'completed').length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #e74c3c 0%, #ec7063 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Общий улов</Typography>
              <Typography variant="h3">{totalCatch}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>тонн (со всех судов)</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ cursor: 'pointer', background: 'linear-gradient(135deg, #f39c12 0%, #f5b041 100%)', color: 'white' }} onClick={() => navigate('/spots')}>
            <CardContent>
              <Typography variant="h6">Мест лова</Typography>
              <Typography variant="h3">{spots.length}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>доступно</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>🚢 Суда и их улов</Typography>
            {boats.filter((b: Boat) => b.status !== 'pending').map((boat: Boat) => (
              <Box key={boat.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1, cursor: 'pointer' }} onClick={() => navigate('/boats')}>
                <Box>
                  <Typography variant="body1">{boat.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {boat.captain} • {boat.status === 'active' ? '🚢 В рейсе' : boat.status === 'in_port' ? '⚓ В порту' : '🔧 Обслуживание'}
                  </Typography>
                </Box>
                <Typography variant="body1" fontWeight="bold" color="primary">{boat.total_catch} т</Typography>
              </Box>
            ))}
            <Button fullWidth sx={{ mt: 2 }} onClick={() => navigate('/boats')}>Все суда →</Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>🛥️ Активные рейсы ({tripsList.length})</Typography>
            {tripsList.length === 0 ? <Alert severity="info">Нет активных рейсов</Alert> : tripsList.map((trip: Trip) => (
              <Box key={trip.id} sx={{ py: 1, cursor: 'pointer' }} onClick={() => navigate('/trips')}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body1">{trip.boat_name}</Typography>
                  <Typography variant="body2" color="text.secondary">{new Date(trip.departure_date).toLocaleDateString('ru-RU')}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">Улов: {trip.total_catch} т • {trip.fishing_spots[0]}</Typography>
                  <LinearProgress variant="determinate" value={trip.progress} sx={{ flexGrow: 1, height: 6, borderRadius: 3 }} />
                  <Typography variant="caption">{trip.progress}%</Typography>
                </Box>
              </Box>
            ))}
            <Button fullWidth sx={{ mt: 2 }} onClick={() => navigate('/trips')}>Все рейсы →</Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>🐟 Распределение улова</Typography>
            <Grid container spacing={2}>
              {catchByFishType.map((item: any) => (
                <Grid item xs={12} sm={6} md={4} key={item.name}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">{item.name}</Typography>
                    <Typography variant="body1" fontWeight="bold">{item.amount} т</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={totalCatch > 0 ? Math.min((item.amount / totalCatch) * 100, 100) : 0} sx={{ height: 8, borderRadius: 4 }} />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

// Суда
function BoatsPage({ boats, allSpots, onUpdateBoat, onDeleteBoat, onApproveBoat }: any) {
  const [selectedBoat, setSelectedBoat] = useState<Boat | null>(null);
  const { isAdmin } = useAuth();
  const activeBoats = boats.filter((b: Boat) => b.status !== 'pending');
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom><DirectionsBoatIcon sx={{ mr: 1 }} />Суда ({activeBoats.length})</Typography>
      
      {isAdmin && boats.filter((b: Boat) => b.status === 'pending').length > 0 && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'warning.light' }}>
          <Typography variant="h6">На проверке</Typography>
          {boats.filter((b: Boat) => b.status === 'pending').map((boat: Boat) => (
            <Box key={boat.id} sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
              <Typography>{boat.name}</Typography>
              <Box>
                <Button size="small" color="success" onClick={() => onApproveBoat(boat.id)}>Одобрить</Button>
                <Button size="small" color="error" onClick={() => onDeleteBoat(boat.id)}>Отклонить</Button>
              </Box>
            </Box>
          ))}
        </Paper>
      )}
      
      <Grid container spacing={3}>
        {activeBoats.map((boat: Boat) => (
          <Grid item xs={12} sm={6} md={4} key={boat.id}>
            <Box sx={{ position: 'relative' }}>
              <BoatCard boat={boat} onClick={() => setSelectedBoat(boat)} />
              {isAdmin && (
                <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                  <IconButton size="small" sx={{ bgcolor: 'white', mr: 0.5 }} onClick={(e) => { e.stopPropagation(); setSelectedBoat(boat); }}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" sx={{ bgcolor: 'white' }} onClick={(e) => { e.stopPropagation(); onDeleteBoat(boat.id); }}><DeleteIcon fontSize="small" color="error" /></IconButton>
                </Box>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>
      
      <BoatDetails boat={selectedBoat} spots={allSpots} open={!!selectedBoat} onClose={() => setSelectedBoat(null)} onUpdate={(u: any) => selectedBoat && onUpdateBoat(selectedBoat.id, u)} isAdmin={isAdmin} />
    </Container>
  );
}

// Рейсы
function TripsPage({ trips, boats, spots, onAddTrip, onCompleteTrip }: any) {
  const { isAdmin } = useAuth();
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <TripList trips={trips} boats={boats} spots={spots} onAddTrip={onAddTrip} onCompleteTrip={onCompleteTrip} isAdmin={isAdmin} />
    </Container>
  );
}

// Места лова - ИСПРАВЛЕНО
function SpotsPage({ spots, onDeleteSpot }: any) {
  const { isAdmin } = useAuth();
  const validSpots = spots.filter((s: FishingSpot) => s && s.position && Array.isArray(s.position) && s.position.length >= 2);
  
  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom><LocationOnIcon sx={{ mr: 1 }} />Места лова ({validSpots.length})</Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>🗺️ Карта</Typography>
        {validSpots.length > 0 ? (
          <MapComponent spots={validSpots} height={500} />
        ) : (
          <Alert severity="warning">Нет доступных мест лова</Alert>
        )}
      </Paper>
      
      <Grid container spacing={3}>
        {validSpots.map((spot: FishingSpot) => (
          <Grid item xs={12} sm={6} md={4} key={spot.id}>
            <Card sx={{ position: 'relative' }}>
              {isAdmin && (
                <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                  <IconButton size="small" sx={{ bgcolor: 'white' }} onClick={() => onDeleteSpot(spot.id)}><DeleteIcon fontSize="small" color="error" /></IconButton>
                </Box>
              )}
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: spot.catchRate === 'high' ? '#4caf50' : spot.catchRate === 'medium' ? '#ff9800' : '#f44336', mr: 1 }} />
                  <Typography variant="h6">{spot.name}</Typography>
                </Box>
                <Typography variant="body2">📍 {spot.position[0]}°N, {spot.position[1]}°E</Typography>
                <Typography variant="body2">🌊 {spot.depth} м</Typography>
                <Typography variant="body2">🐟 {Array.isArray(spot.fishTypes) ? spot.fishTypes.join(', ') : 'Нет данных'}</Typography>
                <Chip label={spot.catchRate === 'high' ? 'Высокая' : spot.catchRate === 'medium' ? 'Средняя' : 'Низкая'} size="small" sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

// Админ
function AdminPanel({ requests, onApprove, onReject }: any) {
  const pending = requests.filter((r: any) => r.status === 'pending');
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom><CheckCircleIcon sx={{ mr: 1 }} />Заявки ({pending.length})</Typography>
      <Paper sx={{ p: 3 }}>
        {pending.length === 0 ? <Alert severity="info">Нет заявок</Alert> : pending.map((req: any) => (
          <Card key={req.id} sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Chip label={req.type === 'boat' ? 'Судно' : req.type === 'trip' ? 'Рейс' : 'Место'} size="small" sx={{ mb: 1 }} />
                <Typography variant="h6">{req.data.name || req.data.boat_name}</Typography>
                <Typography variant="body2">От: {req.createdBy} • {req.createdAt}</Typography>
              </Box>
              <Box>
                <Button color="success" onClick={() => onApprove(req.id)}>Одобрить</Button>
                <Button color="error" onClick={() => onReject(req.id)}>Отклонить</Button>
              </Box>
            </Box>
          </Card>
        ))}
      </Paper>
    </Container>
  );
}

// App
function AppContent() {
  const store = useAppStore();
  const { user } = useAuth();
  const [requestType, setRequestType] = useState<'boat' | 'trip' | 'spot' | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  
  const handleReset = () => { resetStorage(); window.location.reload(); };
  
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppHeader pendingCount={store.pendingCount} onAddRequest={(t: any) => setRequestType(t)} />
        <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
          <Routes>
            <Route path="/" element={<HomePage boats={store.boats} trips={store.trips} spots={store.fishingSpots} activeTripsCount={store.activeTripsCount} totalBoats={store.totalBoats} totalCatch={store.totalCatch} activeBoatsList={store.activeBoatsList} tripsList={store.tripsList} catchByFishType={store.catchByFishType} />} />
            <Route path="/boats" element={<BoatsPage boats={store.boats} allSpots={store.allSpots} onUpdateBoat={store.updateBoat} onDeleteBoat={store.deleteBoat} onApproveBoat={store.approveBoat} />} />
            <Route path="/trips" element={<TripsPage trips={store.trips} boats={store.boats} spots={store.fishingSpots} onAddTrip={store.addTrip} onCompleteTrip={store.completeTrip} />} />
            <Route path="/spots" element={<SpotsPage spots={store.fishingSpots} onDeleteSpot={store.deleteSpot} />} />
            <Route path="/admin" element={<AdminPanel requests={store.requests} onApprove={store.approveRequest} onReject={store.rejectRequest} />} />
          </Routes>
        </Box>
        <Box sx={{ p: 1, textAlign: 'center' }}>
          <Button size="small" onClick={handleReset} sx={{ opacity: 0.5 }}>Сбросить данные</Button>
        </Box>
      </Box>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
      {requestType && <RequestForm open={true} onClose={() => setRequestType(null)} type={requestType} spots={store.allSpots} boats={store.boats} onSubmit={(d: any) => { store.addRequest(requestType, d, user?.full_name || 'user'); setSnackbar({ open: true, message: 'Заявка отправлена!' }); setRequestType(null); }} />}
    </Router>
  );
}

function App() {
  return <ThemeProvider><CssBaseline /><AuthProvider><AppContent /></AuthProvider></ThemeProvider>;
}

export default App;
