import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import {
  CssBaseline, Container, Typography, Box, AppBar, Toolbar, Button,
  Card, CardContent, Grid, Paper, IconButton, Chip, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert
} from '@mui/material'
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew'
import LoginIcon from '@mui/icons-material/Login'
import LogoutIcon from '@mui/icons-material/Logout'
import PersonAddIcon from '@mui/icons-material/PersonAdd'

const boats = [
  { id: 1, name: 'Атлант', type: 'Траулер', captain: 'Сергеев А.Н.', status: 'in_port', total_catch: 450, fish_catch: { 'Треска': 250, 'Пикша': 150, 'Сайда': 50 } },
  { id: 2, name: 'Баренц', type: 'Сейнер', captain: 'Иванов В.П.', status: 'in_port', total_catch: 280, fish_catch: { 'Треска': 180, 'Минтай': 100 } },
  { id: 3, name: 'Восток', type: 'Траулер', captain: 'Петров М.С.', status: 'in_port', total_catch: 320, fish_catch: { 'Треска': 200, 'Камбала': 120 } },
]

function App() {
  const [theme, setTheme] = useState('light')
  const [user, setUser] = useState<any>(null)
  const [loginOpen, setLoginOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [loginData, setLoginData] = useState({ username: '', password: '' })
  const [registerData, setRegisterData] = useState({ username: '', email: '', full_name: '', password: '' })
  const [error, setError] = useState('')

  const [registeredUsers, setRegisteredUsers] = useState<any[]>(() => {
    const saved = localStorage.getItem('octofish_users')
    return saved ? JSON.parse(saved) : [
      { username: 'guest', password: 'guest', role: 'guest', full_name: 'Гость' },
      { username: 'client', password: 'client', role: 'client', full_name: 'Иван Петров' },
      { username: 'admin', password: 'admin', role: 'admin', full_name: 'Администратор' },
    ]
  })

  const saveUsers = (users: any[]) => {
    setRegisteredUsers(users)
    localStorage.setItem('octofish_users', JSON.stringify(users))
  }

  const handleLogin = () => {
    const found = registeredUsers.find((u: any) => u.username === loginData.username && u.password === loginData.password)
    if (found) {
      setUser({ name: found.full_name, role: found.role })
      setLoginOpen(false)
      setError('')
      setLoginData({ username: '', password: '' })
    } else {
      setError('Неверный логин или пароль')
    }
  }

  const handleRegister = () => {
    if (!registerData.username || !registerData.password || !registerData.email || !registerData.full_name) {
      setError('Заполните все поля')
      return
    }
    if (registerData.username.length < 3) {
      setError('Логин должен содержать не менее 3 символов')
      return
    }
    if (registerData.password.length < 3) {
      setError('Пароль должен содержать не менее 3 символов')
      return
    }
    const exists = registeredUsers.find((u: any) => u.username === registerData.username)
    if (exists) {
      setError('Пользователь с таким логином уже существует')
      return
    }
    const newUser = {
      username: registerData.username,
      password: registerData.password,
      role: 'client',
      full_name: registerData.full_name,
      email: registerData.email,
    }
    saveUsers([...registeredUsers, newUser])
    setRegisterOpen(false)
    setError('')
    setRegisterData({ username: '', email: '', full_name: '', password: '' })
    alert('Регистрация успешна! Теперь вы можете войти как ' + registerData.full_name)
  }

  const totalCatch = boats.reduce((s, b) => s + b.total_catch, 0)

  return (
    <BrowserRouter>
      <CssBaseline />
      <AppBar position="static" sx={{ bgcolor: theme === 'dark' ? '#0a0f0a' : '#1b5e20' }}>
        <Toolbar>
          <DirectionsBoatIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>OctoFish</Typography>
          <Button color="inherit" component={Link} to="/">Главная</Button>
          <Button color="inherit" component={Link} to="/boats">Суда</Button>
          <Button color="inherit" component={Link} to="/spots" startIcon={<LocationOnIcon />}>Места лова</Button>
          <IconButton color="inherit" onClick={() => setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'accessible' : 'light')}>
            {theme === 'dark' ? <DarkModeIcon /> : theme === 'accessible' ? <AccessibilityNewIcon /> : <LightModeIcon />}
          </IconButton>
          {user ? (
            <>
              <Chip avatar={<Avatar>{user.role[0].toUpperCase()}</Avatar>} label={user.name} sx={{ ml: 1 }} />
              <IconButton color="inherit" onClick={() => setUser(null)}><LogoutIcon /></IconButton>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={() => { setLoginOpen(true); setError('') }} startIcon={<LoginIcon />}>Войти</Button>
              <Button color="inherit" onClick={() => { setRegisterOpen(true); setError('') }} startIcon={<PersonAddIcon />}>Регистрация</Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Dialog open={loginOpen} onClose={() => setLoginOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Вход в OctoFish</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField fullWidth label="Логин" margin="normal" value={loginData.username} onChange={e => setLoginData({...loginData, username: e.target.value})} />
          <TextField fullWidth label="Пароль" type="password" margin="normal" value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})} />
          <Typography variant="body2" sx={{ mt: 2, p: 1, bgcolor: '#e8f5e9' }}>
            guest/guest | client/client | admin/admin
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoginOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleLogin}>Войти</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={registerOpen} onClose={() => setRegisterOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Регистрация в OctoFish</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField fullWidth label="Логин" margin="normal" value={registerData.username} onChange={e => setRegisterData({...registerData, username: e.target.value})} />
          <TextField fullWidth label="Email" type="email" margin="normal" value={registerData.email} onChange={e => setRegisterData({...registerData, email: e.target.value})} />
          <TextField fullWidth label="ФИО" margin="normal" value={registerData.full_name} onChange={e => setRegisterData({...registerData, full_name: e.target.value})} />
          <TextField fullWidth label="Пароль" type="password" margin="normal" value={registerData.password} onChange={e => setRegisterData({...registerData, password: e.target.value})} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegisterOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleRegister}>Зарегистрироваться</Button>
        </DialogActions>
      </Dialog>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={
            <Box>
              <Typography variant="h4" gutterBottom>OctoFish - Панель управления</Typography>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={3}><Card sx={{ bgcolor: '#2e7d32', color: 'white' }}><CardContent><Typography variant="h6">Суда</Typography><Typography variant="h3">{boats.length}</Typography></CardContent></Card></Grid>
                <Grid item xs={3}><Card sx={{ bgcolor: '#1565c0', color: 'white' }}><CardContent><Typography variant="h6">Рейсы</Typography><Typography variant="h3">0</Typography></CardContent></Card></Grid>
                <Grid item xs={3}><Card sx={{ bgcolor: '#e65100', color: 'white' }}><CardContent><Typography variant="h6">Улов (т)</Typography><Typography variant="h3">{totalCatch}</Typography></CardContent></Card></Grid>
                <Grid item xs={3}><Card sx={{ bgcolor: '#0288d1', color: 'white' }}><CardContent><Typography variant="h6">Места лова</Typography><Typography variant="h3">3</Typography></CardContent></Card></Grid>
              </Grid>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Суда и их улов</Typography>
                {boats.map(b => (
                  <Box key={b.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                    <Box>
                      <Typography>{b.name}</Typography>
                      <Typography variant="caption">{b.captain} | {b.status === 'active' ? 'В рейсе' : 'В порту'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {b.fish_catch && Object.entries(b.fish_catch).map(([fish, amount]) => (
                        <Chip key={fish} label={`${fish}: ${amount} т`} size="small" variant="outlined" />
                      ))}
                      <Chip label={`Всего: ${b.total_catch} т`} size="small" color="primary" />
                    </Box>
                  </Box>
                ))}
              </Paper>
            </Box>
          } />
          <Route path="/boats" element={<Typography variant="h4">Суда флота</Typography>} />
          <Route path="/spots" element={<Typography variant="h4">Места лова</Typography>} />
        </Routes>
      </Container>
    </BrowserRouter>
  )
}

export default App
