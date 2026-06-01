import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import {
  CssBaseline, Container, Typography, Box, AppBar, Toolbar, Button,
  Card, CardContent, Grid, Paper, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Chip, Menu, MenuItem,
  Tooltip, Avatar, Alert, Snackbar, Badge, LinearProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Select, FormControl, InputLabel
} from '@mui/material'
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat'
import AddIcon from '@mui/icons-material/Add'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew'
import LoginIcon from '@mui/icons-material/Login'
import LogoutIcon from '@mui/icons-material/Logout'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import NotificationsIcon from '@mui/icons-material/Notifications'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { ThemeProvider, useThemeMode } from './contexts/ThemeContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import MapComponent from './components/YandexSatelliteMap'
import BoatCard from './components/BoatCard'
import TripList from './components/TripList'
import BoatDetails from './components/BoatDetails'
import RequestForm from './components/RequestForm'

interface FishingSpot {
  id: number; name: string; position: [number, number]; depth: number;
  fishTypes: string[]; catchRate: 'high' | 'medium' | 'low'; description: string;
}
interface Boat {
  id: number; name: string; type: string; displacement: number; build_date: string;
  passport_number: string; image_url?: string; status: 'active' | 'maintenance' | 'pending' | 'in_port';
  captain: string; crew_capacity: number; current_crew: number; current_location: string;
  max_speed: number; fuel_level: number; description: string;
  last_maintenance: string; next_maintenance: string; total_catch: number;
  fishCatch?: { [key: string]: number }; trips: any[];
}
interface Trip {
  id: number; boat_name: string; boat_id: number; departure_date: string;
  return_date: string | null; status: 'active' | 'completed' | 'planned' | 'pending';
  total_catch: number; progress: number; crew: any[]; catches: any[]; fishing_spots: string[];
}

const DEFAULT_SPOTS: FishingSpot[] = [
  { id: 1, name: 'Медвежинская банка', position: [73.5, 38], depth: 240, fishTypes: ['Треска', 'Пикша', 'Сайда'], catchRate: 'high', description: 'Крупнейшее рыболовное угодье' },
  { id: 2, name: 'Гусиная банка', position: [71.5, 45], depth: 180, fishTypes: ['Треска', 'Минтай'], catchRate: 'medium', description: 'Хорошее место для ловли трески' },
  { id: 3, name: 'Кильдинская банка', position: [69.5, 35], depth: 150, fishTypes: ['Пикша', 'Сайда', 'Камбала'], catchRate: 'high', description: 'Богатое разнообразие донных рыб' },
  { id: 4, name: 'Порт Мурманск', position: [68.97, 33.08], depth: 0, fishTypes: [], catchRate: 'low', description: 'Порт приписки' }
];

const DEFAULT_BOATS: Boat[] = [
  { id: 1, name: 'Атлант', type: 'Траулер', displacement: 3500, build_date: '2018-05-15', passport_number: 'TR-001', status: 'in_port', captain: 'Сергеев А.Н.', crew_capacity: 25, current_crew: 22, current_location: 'Порт Мурманск', max_speed: 14, fuel_level: 75, description: 'Современный траулер', last_maintenance: '2026-01-15', next_maintenance: '2026-07-15', total_catch: 450, fishCatch: { 'Треска': 250, 'Пикша': 150, 'Сайда': 50 }, trips: [] },
  { id: 2, name: 'Баренц', type: 'Сейнер', displacement: 1200, build_date: '2020-03-20', passport_number: 'SN-015', status: 'in_port', captain: 'Иванов В.П.', crew_capacity: 15, current_crew: 14, current_location: 'Порт Мурманск', max_speed: 12, fuel_level: 45, description: 'Кошельковый сейнер', last_maintenance: '2026-02-01', next_maintenance: '2026-08-01', total_catch: 280, fishCatch: { 'Треска': 180, 'Минтай': 100 }, trips: [] },
  { id: 3, name: 'Восток', type: 'Траулер', displacement: 2800, build_date: '2019-11-10', passport_number: 'TR-023', status: 'in_port', captain: 'Петров М.С.', crew_capacity: 20, current_crew: 18, current_location: 'Порт Мурманск', max_speed: 13, fuel_level: 90, description: 'Траулер-морозильщик', last_maintenance: '2026-03-10', next_maintenance: '2026-04-20', total_catch: 320, fishCatch: { 'Треска': 200, 'Камбала': 120 }, trips: [] }
];

const DEFAULT_TRIPS: Trip[] = [
  { id: 1, boat_name: 'Атлант', boat_id: 1, departure_date: '2026-04-01', return_date: '2026-04-10', status: 'completed', total_catch: 45, progress: 100, crew: [{ id: 1, name: 'Сергеев А.Н.', position: 'Капитан', experience: 15 }], catches: [{ fish_type: 'Треска', amount: 30 }, { fish_type: 'Пикша', amount: 15 }], fishing_spots: ['Медвежинская банка'] },
  { id: 2, boat_name: 'Баренц', boat_id: 2, departure_date: '2026-04-03', return_date: '2026-04-08', status: 'completed', total_catch: 28, progress: 100, crew: [{ id: 2, name: 'Иванов В.П.', position: 'Капитан', experience: 12 }], catches: [{ fish_type: 'Минтай', amount: 28 }], fishing_spots: ['Гусиная банка'] },
];

const useAppStore = () => {
  const [fishingSpots, setFishingSpots] = useState<FishingSpot[]>(() => { try { return JSON.parse(localStorage.getItem('fishingSpots') || '[]'); } catch { return DEFAULT_SPOTS; } });
  const [boats, setBoats] = useState<Boat[]>(() => { try { return JSON.parse(localStorage.getItem('boats') || '[]'); } catch { return DEFAULT_BOATS; } });
  const [trips, setTrips] = useState<Trip[]>(() => { try { return JSON.parse(localStorage.getItem('trips') || '[]'); } catch { return DEFAULT_TRIPS; } });
  const [requests, setRequests] = useState<any[]>(() => { try { return JSON.parse(localStorage.getItem('requests') || '[]'); } catch { return []; } });

  useEffect(() => { localStorage.setItem('fishingSpots', JSON.stringify(fishingSpots)); }, [fishingSpots]);
  useEffect(() => { localStorage.setItem('boats', JSON.stringify(boats)); }, [boats]);
  useEffect(() => { localStorage.setItem('trips', JSON.stringify(trips)); }, [trips]);
  useEffect(() => { localStorage.setItem('requests', JSON.stringify(requests)); }, [requests]);

  useEffect(() => { setBoats(prev => prev.map(b => { const hasActiveTrip = trips.some(t => t.boat_id === b.id && t.status === 'active'); if (b.status === 'maintenance' || b.status === 'pending') return b; return { ...b, status: hasActiveTrip ? 'active' : 'in_port' }; })); }, [trips]);

  const updateBoat = (boatId: number, updates: Partial<Boat>) => setBoats(boats.map(b => b.id === boatId ? { ...b, ...updates } : b));
  const deleteBoat = (boatId: number) => setBoats(boats.filter(b => b.id !== boatId));
  const approveBoat = (boatId: number) => setBoats(boats.map(b => b.id === boatId ? { ...b, status: 'in_port' } : b));
  const deleteSpot = (spotId: number) => setFishingSpots(fishingSpots.filter(s => s.id !== spotId));
  const addRequest = (type: string, data: any, createdBy: string) => setRequests([...requests, { id: Date.now(), type, data, status: 'pending', createdBy, createdAt: new Date().toISOString().split('T')[0] }]);
  const approveRequest = (reqId: number) => { const req = requests.find(r => r.id === reqId); if (!req) return; if (req.type === 'boat') setBoats([...boats, { ...req.data, id: Date.now(), status: 'in_port', current_crew: 0, fuel_level: 100, total_catch: 0, fishCatch: {}, trips: [] }]); else if (req.type === 'spot') setFishingSpots([...fishingSpots, { ...req.data, id: Date.now() }]); setRequests(requests.map(r => r.id === reqId ? { ...r, status: 'approved' } : r)); };
  const rejectRequest = (reqId: number) => setRequests(requests.map(r => r.id === reqId ? { ...r, status: 'rejected' } : r));
  const addTrip = (tripData: any) => { const boat = boats.find(b => b.id === tripData.boat_id); setTrips([...trips, { ...tripData, id: Date.now(), boat_name: boat?.name || 'Неизвестно', status: 'active', total_catch: 0, progress: 0 }]); if (boat) updateBoat(boat.id, { current_location: tripData.fishing_spots?.[0] || boat.current_location }); };
  const completeTrip = (tripId: number) => { const trip = trips.find(t => t.id === tripId); if (trip) { const boat = boats.find(b => b.id === trip.boat_id); if (boat) { const newFishCatch = { ...boat.fishCatch }; trip.catches?.forEach((c: any) => { newFishCatch[c.fish_type] = (newFishCatch[c.fish_type] || 0) + c.amount; }); updateBoat(boat.id, { current_location: 'Порт Мурманск', total_catch: boat.total_catch + trip.total_catch, fishCatch: newFishCatch }); } } setTrips(trips.map(t => t.id === tripId ? { ...t, status: 'completed', return_date: new Date().toISOString().split('T')[0], progress: 100 } : t)); };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const activeTripsCount = trips.filter(t => t.status === 'active').length;
  const fishingSpotsList = fishingSpots.filter(s => s.depth > 0 && s.position);
  const totalBoats = boats.filter(b => b.status !== 'pending').length;
  const totalCatch = boats.reduce((sum, boat) => sum + (boat.total_catch || 0), 0);
  const activeBoatsList = boats.filter(b => b.status === 'active');
  const totalCatchByFish = () => { const result: { [key: string]: number } = {}; boats.forEach(boat => { if (boat.fishCatch) Object.entries(boat.fishCatch).forEach(([fish, amount]) => { result[fish] = (result[fish] || 0) + amount; }); }); return Object.entries(result).map(([name, amount]) => ({ name, amount })); };

  return { fishingSpots: fishingSpotsList, allSpots: fishingSpots, boats, trips, requests, pendingCount, activeTripsCount, totalBoats, totalCatch, activeBoatsList, totalCatchByFish: totalCatchByFish(), addRequest, approveRequest, rejectRequest, updateBoat, deleteBoat, approveBoat, deleteSpot, addTrip, completeTrip };
};

function LoginDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { login } = useAuth(); const [username, setUsername] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState('');
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Вход</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField fullWidth label="Логин" margin="normal" value={username} onChange={(e) => setUsername(e.target.value)} />
        <TextField fullWidth label="Пароль" type="password" margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Typography variant="body2" sx={{ mt: 2, p: 1, bgcolor: '#e8f5e9' }}>guest/guest | client/client | admin/admin</Typography>
      </DialogContent>
      <DialogActions><Button onClick={onClose}>Отмена</Button><Button variant="contained" onClick={async () => { try { await login(username, password); onClose(); } catch { setError('Неверный логин или пароль'); } }}>Войти</Button></DialogActions>
    </Dialog>
  );
}

function RegisterDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ username: '', email: '', full_name: '', password: '' }); const [error, setError] = useState('');
  const handleRegister = () => {
    if (!form.username || !form.password || !form.email || !form.full_name) { setError('Заполните все поля'); return; }
    if (form.username.length < 3) { setError('Логин не менее 3 символов'); return; }
    if (form.password.length < 3) { setError('Пароль не менее 3 символов'); return; }
    const users = JSON.parse(localStorage.getItem('octofish_users') || '[]');
    if (users.find((u: any) => u.username === form.username)) { setError('Логин занят'); return; }
    users.push({ ...form, role: 'client' });
    localStorage.setItem('octofish_users', JSON.stringify(users));
    onClose(); setForm({ username: '', email: '', full_name: '', password: '' }); setError('');
    alert('Регистрация успешна! Войдите как ' + form.full_name);
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Регистрация</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField fullWidth label="Логин" margin="normal" value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
        <TextField fullWidth label="Email" type="email" margin="normal" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        <TextField fullWidth label="ФИО" margin="normal" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
        <TextField fullWidth label="Пароль" type="password" margin="normal" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
      </DialogContent>
      <DialogActions><Button onClick={onClose}>Отмена</Button><Button variant="contained" onClick={handleRegister}>Зарегистрироваться</Button></DialogActions>
    </Dialog>
  );
}

function AppHeader({ pendingCount, onAddRequest }: any) {
  const navigate = useNavigate(); const { user, logout, isAdmin, isGuest } = useAuth();
  const { themeMode, setThemeMode } = useThemeMode(); const [loginOpen, setLoginOpen] = useState(false); const [registerOpen, setRegisterOpen] = useState(false); const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const getThemeIcon = () => themeMode === 'dark' ? <DarkModeIcon /> : themeMode === 'accessible' ? <AccessibilityNewIcon /> : <LightModeIcon />;
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <DirectionsBoatIcon sx={{ mr: 2, cursor: 'pointer' }} onClick={() => navigate('/')} />
          <Typography variant="h6" sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>OctoFish</Typography>
          <Button color="inherit" onClick={() => navigate('/')}>Главная</Button>
          <Button color="inherit" onClick={() => navigate('/boats')}>Суда</Button>
          <Button color="inherit" onClick={() => navigate('/trips')}>Рейсы</Button>
          <Button color="inherit" onClick={() => navigate('/spots')} startIcon={<LocationOnIcon />}>Места лова</Button>
          {!isGuest && <Button color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)} startIcon={<AddIcon />}>Заявка</Button>}
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => { onAddRequest('boat'); setAnchorEl(null); }}>Судно</MenuItem>
            <MenuItem onClick={() => { onAddRequest('trip'); setAnchorEl(null); }}>Рейс</MenuItem>
            <MenuItem onClick={() => { onAddRequest('spot'); setAnchorEl(null); }}>Место лова</MenuItem>
          </Menu>
          {isAdmin && <IconButton color="inherit" onClick={() => navigate('/admin')}><Badge badgeContent={pendingCount} color="error"><NotificationsIcon /></Badge></IconButton>}
          <IconButton color="inherit" onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : themeMode === 'dark' ? 'accessible' : 'light')}>{getThemeIcon()}</IconButton>
          {user ? (
            <>
              <Chip avatar={<Avatar>{user.role[0]}</Avatar>} label={user.full_name} sx={{ ml: 1 }} />
              <IconButton color="inherit" onClick={logout}><LogoutIcon /></IconButton>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={() => setLoginOpen(true)} startIcon={<LoginIcon />}>Войти</Button>
              <Button color="inherit" onClick={() => setRegisterOpen(true)} startIcon={<PersonAddIcon />}>Регистрация</Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
      <RegisterDialog open={registerOpen} onClose={() => setRegisterOpen(false)} />
    </>
  );
}

function HomePage({ boats, trips, spots, activeTripsCount, totalBoats, totalCatch, activeBoatsList, totalCatchByFish }: any) {
  const navigate = useNavigate(); const { isAdmin } = useAuth();
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}><DirectionsBoatIcon sx={{ mr: 1, verticalAlign: 'middle' }} />OctoFish - Панель управления</Typography>
      <Alert severity="info" sx={{ mb: 3 }}>{isAdmin ? 'Вы вошли как Администратор.' : useAuth().isClient ? 'Вы вошли как Клиент.' : 'Вы вошли как Гость.'}</Alert>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}><Card sx={{ cursor: 'pointer', background: '#2e7d32', color: 'white' }} onClick={() => navigate('/boats')}><CardContent><Typography variant="h6">Всего судов</Typography><Typography variant="h3">{totalBoats}</Typography></CardContent></Card></Grid>
        <Grid item xs={12} sm={6} md={3}><Card sx={{ cursor: 'pointer', background: '#1565c0', color: 'white' }} onClick={() => navigate('/trips')}><CardContent><Typography variant="h6">Активных рейсов</Typography><Typography variant="h3">{activeTripsCount}</Typography></CardContent></Card></Grid>
        <Grid item xs={12} sm={6} md={3}><Card sx={{ background: '#e65100', color: 'white' }}><CardContent><Typography variant="h6">Общий улов</Typography><Typography variant="h3">{totalCatch}</Typography></CardContent></Card></Grid>
        <Grid item xs={12} sm={6} md={3}><Card sx={{ cursor: 'pointer', background: '#0288d1', color: 'white' }} onClick={() => navigate('/spots')}><CardContent><Typography variant="h6">Мест лова</Typography><Typography variant="h3">{spots.length}</Typography></CardContent></Card></Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Суда и их улов</Typography>
            <TableContainer>
              <Table>
                <TableHead><TableRow><TableCell>Судно</TableCell><TableCell>Капитан</TableCell><TableCell>Статус</TableCell><TableCell>Общий улов</TableCell><TableCell>Детализация</TableCell></TableRow></TableHead>
                <TableBody>
                  {boats.filter((b: Boat) => b.status !== 'pending').map((boat: Boat) => (
                    <TableRow key={boat.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate('/boats')}>
                      <TableCell><strong>{boat.name}</strong></TableCell><TableCell>{boat.captain}</TableCell>
                      <TableCell><Chip label={boat.status === 'active' ? 'В рейсе' : 'В порту'} color={boat.status === 'active' ? 'success' : 'default'} size="small" /></TableCell>
                      <TableCell><strong>{boat.total_catch} т</strong></TableCell>
                      <TableCell>{boat.fishCatch && Object.keys(boat.fishCatch).length > 0 ? Object.entries(boat.fishCatch).map(([fish, amount]) => <Chip key={fish} label={`${fish}: ${amount} т`} size="small" variant="outlined" sx={{ mr: 0.5 }} />) : 'Нет данных'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Общий улов по видам рыб</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead><TableRow><TableCell>Вид рыбы</TableCell><TableCell align="right">Количество (т)</TableCell><TableCell align="right">Доля</TableCell></TableRow></TableHead>
                <TableBody>
                  {totalCatchByFish.map((item: any) => (
                    <TableRow key={item.name}>
                      <TableCell>{item.name}</TableCell><TableCell align="right"><strong>{item.amount}</strong></TableCell>
                      <TableCell align="right"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}><LinearProgress variant="determinate" value={totalCatch > 0 ? (item.amount / totalCatch) * 100 : 0} sx={{ width: 100, height: 8 }} /><Typography variant="caption">{totalCatch > 0 ? Math.round((item.amount / totalCatch) * 100) : 0}%</Typography></Box></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Последние рейсы</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead><TableRow><TableCell>Судно</TableCell><TableCell>Дата</TableCell><TableCell>Улов</TableCell><TableCell>Статус</TableCell></TableRow></TableHead>
                <TableBody>
                  {trips.slice(-5).reverse().map((trip: Trip) => (
                    <TableRow key={trip.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate('/trips')}>
                      <TableCell>{trip.boat_name}</TableCell><TableCell>{new Date(trip.departure_date).toLocaleDateString('ru-RU')}</TableCell><TableCell>{trip.total_catch} т</TableCell>
                      <TableCell><Chip label={trip.status === 'completed' ? 'Завершен' : 'Активен'} color={trip.status === 'completed' ? 'default' : 'success'} size="small" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

function BoatsPage({ boats, allSpots, onUpdateBoat, onDeleteBoat, onApproveBoat }: any) {
  const [selectedBoat, setSelectedBoat] = useState<Boat | null>(null); const { isAdmin } = useAuth();
  const activeBoats = boats.filter((b: Boat) => b.status !== 'pending');
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom><DirectionsBoatIcon sx={{ mr: 1 }} />Суда ({activeBoats.length})</Typography>
      {isAdmin && boats.filter((b: Boat) => b.status === 'pending').length > 0 && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'warning.light' }}><Typography variant="h6">На проверке</Typography>
          {boats.filter((b: Boat) => b.status === 'pending').map((boat: Boat) => (
            <Box key={boat.id} sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}><Typography>{boat.name}</Typography><Box><Button size="small" color="success" onClick={() => onApproveBoat(boat.id)}>Одобрить</Button><Button size="small" color="error" onClick={() => onDeleteBoat(boat.id)}>Отклонить</Button></Box></Box>
          ))}
        </Paper>
      )}
      <Grid container spacing={3}>
        {activeBoats.map((boat: Boat) => (
          <Grid item xs={12} sm={6} md={4} key={boat.id}>
            <Box sx={{ position: 'relative' }}>
              <BoatCard boat={boat} onClick={() => setSelectedBoat(boat)} />
              {isAdmin && <Box sx={{ position: 'absolute', top: 8, right: 8 }}><IconButton size="small" sx={{ bgcolor: 'white', mr: 0.5 }} onClick={(e) => { e.stopPropagation(); setSelectedBoat(boat); }}><EditIcon fontSize="small" /></IconButton><IconButton size="small" sx={{ bgcolor: 'white' }} onClick={(e) => { e.stopPropagation(); onDeleteBoat(boat.id); }}><DeleteIcon fontSize="small" color="error" /></IconButton></Box>}
            </Box>
          </Grid>
        ))}
      </Grid>
      <BoatDetails boat={selectedBoat} spots={allSpots} open={!!selectedBoat} onClose={() => setSelectedBoat(null)} onUpdate={(u: any) => selectedBoat && onUpdateBoat(selectedBoat.id, u)} isAdmin={isAdmin} />
    </Container>
  );
}

function TripsPage({ trips, boats, spots, onAddTrip, onCompleteTrip }: any) {
  const { isAdmin } = useAuth();
  return <Container maxWidth="lg" sx={{ mt: 4 }}><TripList trips={trips} boats={boats} spots={spots} onAddTrip={onAddTrip} onCompleteTrip={onCompleteTrip} isAdmin={isAdmin} /></Container>;
}

function SpotsPage({ spots, onDeleteSpot }: any) {
  const { isAdmin } = useAuth();
  const validSpots = spots.filter((s: FishingSpot) => s && s.position && Array.isArray(s.position) && s.position.length >= 2);
  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom><LocationOnIcon sx={{ mr: 1 }} />Места лова ({validSpots.length})</Typography>
      <Paper sx={{ p: 2, mb: 3 }}><Typography variant="h6" gutterBottom>Карта</Typography>{validSpots.length > 0 ? <MapComponent spots={validSpots} height={500} /> : <Alert severity="warning">Нет доступных мест лова</Alert>}</Paper>
      <Grid container spacing={3}>
        {validSpots.map((spot: FishingSpot) => (
          <Grid item xs={12} sm={6} md={4} key={spot.id}>
            <Card sx={{ position: 'relative' }}>
              {isAdmin && <Box sx={{ position: 'absolute', top: 8, right: 8 }}><IconButton size="small" sx={{ bgcolor: 'white' }} onClick={() => onDeleteSpot(spot.id)}><DeleteIcon fontSize="small" color="error" /></IconButton></Box>}
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><Box sx={{ width: 12, height: 12, bgcolor: spot.catchRate === 'high' ? '#4caf50' : spot.catchRate === 'medium' ? '#ff9800' : '#f44336', mr: 1 }} /><Typography variant="h6">{spot.name}</Typography></Box>
                <Typography variant="body2">Координаты: {spot.position[0]}°N, {spot.position[1]}°E</Typography>
                <Typography variant="body2">Глубина: {spot.depth} м</Typography>
                <Typography variant="body2">Виды рыб: {Array.isArray(spot.fishTypes) ? spot.fishTypes.join(', ') : 'Нет данных'}</Typography>
                <Chip label={spot.catchRate === 'high' ? 'Высокая уловистость' : spot.catchRate === 'medium' ? 'Средняя' : 'Низкая'} size="small" sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

function AdminPanel({ requests, onApprove, onReject }: any) {
  const pending = requests.filter((r: any) => r.status === 'pending');
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom><CheckCircleIcon sx={{ mr: 1 }} />Заявки ({pending.length})</Typography>
      <Paper sx={{ p: 3 }}>
        {pending.length === 0 ? <Alert severity="info">Нет заявок</Alert> : pending.map((req: any) => (
          <Card key={req.id} sx={{ p: 2, mb: 2 }}><Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Box><Chip label={req.type === 'boat' ? 'Судно' : req.type === 'trip' ? 'Рейс' : 'Место'} size="small" sx={{ mb: 1 }} /><Typography variant="h6">{req.data.name || req.data.boat_name}</Typography><Typography variant="body2">От: {req.createdBy} | {req.createdAt}</Typography></Box><Box><Button color="success" onClick={() => onApprove(req.id)}>Одобрить</Button><Button color="error" onClick={() => onReject(req.id)}>Отклонить</Button></Box></Box></Card>
        ))}
      </Paper>
    </Container>
  );
}

function AppContent() {
  const store = useAppStore(); const { user } = useAuth();
  const [requestType, setRequestType] = useState<'boat' | 'trip' | 'spot' | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppHeader pendingCount={store.pendingCount} onAddRequest={(t: any) => setRequestType(t)} />
        <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
          <Routes>
            <Route path="/" element={<HomePage boats={store.boats} trips={store.trips} spots={store.fishingSpots} activeTripsCount={store.activeTripsCount} totalBoats={store.totalBoats} totalCatch={store.totalCatch} activeBoatsList={store.activeBoatsList} totalCatchByFish={store.totalCatchByFish} />} />
            <Route path="/boats" element={<BoatsPage boats={store.boats} allSpots={store.allSpots} onUpdateBoat={store.updateBoat} onDeleteBoat={store.deleteBoat} onApproveBoat={store.approveBoat} />} />
            <Route path="/trips" element={<TripsPage trips={store.trips} boats={store.boats} spots={store.fishingSpots} onAddTrip={store.addTrip} onCompleteTrip={store.completeTrip} />} />
            <Route path="/spots" element={<SpotsPage spots={store.fishingSpots} onDeleteSpot={store.deleteSpot} />} />
            <Route path="/admin" element={<AdminPanel requests={store.requests} onApprove={store.approveRequest} onReject={store.rejectRequest} />} />
          </Routes>
        </Box>
      </Box>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
      {requestType && <RequestForm open={true} onClose={() => setRequestType(null)} type={requestType} spots={store.allSpots} boats={store.boats} onSubmit={(d: any) => { store.addRequest(requestType, d, user?.full_name || 'user'); setSnackbar({ open: true, message: 'Заявка отправлена' }); setRequestType(null); }} />}
    </Router>
  );
}

function App() { return <ThemeProvider><CssBaseline /><AuthProvider><AppContent /></AuthProvider></ThemeProvider>; }
export default App;
