import React, { useState } from 'react'
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Collapse, Box, Typography, Grid, LinearProgress,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, Alert
} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import PersonIcon from '@mui/icons-material/Person'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import AddIcon from '@mui/icons-material/Add'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

interface Trip {
  id: number
  boat_name: string
  boat_id: number
  departure_date: string
  return_date: string | null
  status: 'active' | 'completed' | 'planned' | 'pending'
  total_catch: number
  progress: number
  crew: any[]
  catches: any[]
  fishing_spots: string[]
  max_capacity?: number
}

interface TripListProps {
  trips: Trip[]
  boats: any[]
  spots: any[]
  onAddTrip?: (data: any) => void
  onCompleteTrip?: (id: number) => void
  onAddCatch?: (tripId: number, catchData: { fish_type: string; amount: number; quality: string }) => void
  isAdmin?: boolean
}

function validateFullName(name: string): string | null {
  if (!name || name.trim().length < 5) {
    return 'ФИО должно содержать не менее 5 символов'
  }
  const parts = name.trim().split(/\s+/)
  if (parts.length < 2) {
    return 'Введите фамилию и имя (минимум два слова)'
  }
  if (parts.length < 3) {
    return 'Введите полное ФИО: фамилию, имя и отчество'
  }
  return null
}

const TripRow: React.FC<{ trip: Trip; onComplete?: (id: number) => void; onAddCatch?: (tripId: number, catchData: any) => void; isAdmin?: boolean }> = ({ trip, onComplete, onAddCatch, isAdmin }) => {
  const [open, setOpen] = useState(false)
  const [catchDialogOpen, setCatchDialogOpen] = useState(false)
  const [catchData, setCatchData] = useState({ fish_type: '', amount: 0, quality: 'good' })
  const [error, setError] = useState('')

  const maxCapacity = trip.max_capacity || 1000
  const remainingCapacity = maxCapacity - trip.total_catch
  const captain = trip.crew && trip.crew.length > 0 ? trip.crew[0] : null

  const handleAddCatch = () => {
    if (!catchData.fish_type) { setError('Выберите вид рыбы'); return }
    if (catchData.amount <= 0) { setError('Укажите количество больше нуля'); return }
    if (catchData.amount > remainingCapacity) { setError('Недостаточно места. Доступно: ' + remainingCapacity + ' т из ' + maxCapacity + ' т'); return }
    if (onAddCatch) { onAddCatch(trip.id, catchData); setCatchDialogOpen(false); setError(''); setCatchData({ fish_type: '', amount: 0, quality: 'good' }) }
  }

  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{trip.boat_name}</TableCell>
        <TableCell>{new Date(trip.departure_date).toLocaleDateString('ru-RU')}</TableCell>
        <TableCell>{trip.return_date ? new Date(trip.return_date).toLocaleDateString('ru-RU') : '---'}</TableCell>
        <TableCell>{trip.total_catch} т</TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip label={trip.status === 'active' ? 'Активен' : trip.status === 'completed' ? 'Завершен' : 'Запланирован'}
              color={trip.status === 'active' ? 'success' : trip.status === 'completed' ? 'default' : 'warning'} size="small" />
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Детали рейса</Typography>
                {trip.status === 'active' && isAdmin && (
                  <Button variant="outlined" startIcon={<AddIcon />} onClick={() => { setError(''); setCatchDialogOpen(true) }}>Добавить улов</Button>
                )}
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom><PersonIcon sx={{ mr: 1 }} />Капитан</Typography>
                  {captain ? <Typography variant="body1">{captain.name}</Typography> : <Typography variant="body2" color="text.secondary">Не указан</Typography>}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom><RestaurantIcon sx={{ mr: 1 }} />Улов по видам</Typography>
                  {trip.catches && trip.catches.length > 0 ? (
                    <Table size="small">
                      <TableHead><TableRow><TableCell>Вид рыбы</TableCell><TableCell>Количество (т)</TableCell><TableCell>Качество</TableCell></TableRow></TableHead>
                      <TableBody>
                        {trip.catches.map((item, idx) => (
                          <TableRow key={idx}><TableCell>{item.fish_type}</TableCell><TableCell>{item.amount}</TableCell><TableCell><Chip label={item.quality === 'excellent' ? 'Отличное' : item.quality === 'good' ? 'Хорошее' : 'Низкое'} color={item.quality === 'excellent' ? 'success' : 'primary'} size="small" /></TableCell></TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : <Alert severity="info">Улов пока не добавлен</Alert>}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom><LocationOnIcon sx={{ mr: 1 }} />Места лова</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {trip.fishing_spots && trip.fishing_spots.map((spot, idx) => (<Chip key={idx} label={spot} variant="outlined" />))}
                  </Box>
                </Grid>
                {trip.status === 'active' && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>Прогресс: {trip.progress}% ({trip.total_catch} т из {maxCapacity} т)</Typography>
                    <LinearProgress variant="determinate" value={trip.progress} sx={{ height: 8 }} />
                  </Grid>
                )}
              </Grid>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
}

const TripList: React.FC<TripListProps> = ({ trips, boats, spots, onAddTrip, onCompleteTrip, onAddCatch, isAdmin }) => {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newTrip, setNewTrip] = useState({ boat_id: 0, departure_date: new Date().toISOString().split('T')[0], fishing_spots: [''], captain_name: '' })
  const [error, setError] = useState('')

  const activeBoats = boats.filter((b: any) => b.status === 'in_port')
  const fishingSpotsList = spots.filter((s: any) => s.depth > 0)

  const handleAddTrip = () => {
    if (!newTrip.boat_id) { setError('Выберите судно'); return }
    const nameError = validateFullName(newTrip.captain_name)
    if (nameError) { setError(nameError); return }
    if (!newTrip.fishing_spots[0]) { setError('Выберите место лова'); return }
    if (onAddTrip) {
      onAddTrip({ boat_id: newTrip.boat_id, departure_date: newTrip.departure_date, fishing_spots: newTrip.fishing_spots, crew: [{ name: newTrip.captain_name.trim(), position: 'Капитан', experience: 0 }] })
      setAddDialogOpen(false)
      setError('')
      setNewTrip({ boat_id: 0, departure_date: new Date().toISOString().split('T')[0], fishing_spots: [''], captain_name: '' })
    }
  }

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ color: 'primary.main' }}>Рейсы флота ({trips.filter(t => t.status === 'active').length} активных)</Typography>
        {isAdmin && (<Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddDialogOpen(true)}>Новый рейс</Button>)}
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead><TableRow><TableCell /><TableCell>Судно</TableCell><TableCell>Дата выхода</TableCell><TableCell>Дата возвращения</TableCell><TableCell>Улов (т)</TableCell><TableCell>Статус</TableCell></TableRow></TableHead>
          <TableBody>{trips.map((trip) => (<TripRow key={trip.id} trip={trip} onComplete={onCompleteTrip} onAddCatch={onAddCatch} isAdmin={isAdmin} />))}</TableBody>
        </Table>
      </TableContainer>
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Новый рейс</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth><InputLabel>Выберите судно</InputLabel>
                <Select value={newTrip.boat_id} label="Выберите судно" onChange={(e) => setNewTrip({ ...newTrip, boat_id: Number(e.target.value) })}>
                  <MenuItem value={0}>Выберите судно...</MenuItem>
                  {activeBoats.map((boat: any) => (<MenuItem key={boat.id} value={boat.id}>{boat.name}</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Дата выхода" type="date" value={newTrip.departure_date} InputLabelProps={{ shrink: true }} onChange={(e) => setNewTrip({ ...newTrip, departure_date: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth><InputLabel>Место лова</InputLabel>
                <Select value={newTrip.fishing_spots[0] || ''} label="Место лова" onChange={(e) => setNewTrip({ ...newTrip, fishing_spots: [e.target.value] })}>
                  <MenuItem value="">Выберите место...</MenuItem>
                  {fishingSpotsList.map((spot: any) => (<MenuItem key={spot.id} value={spot.name}>{spot.name}</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Фамилия Имя Отчество" required value={newTrip.captain_name}
                helperText="Обязательно три слова: фамилия, имя и отчество"
                onChange={(e) => setNewTrip({ ...newTrip, captain_name: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions><Button onClick={() => setAddDialogOpen(false)}>Отмена</Button><Button variant="contained" onClick={handleAddTrip}>Создать рейс</Button></DialogActions>
      </Dialog>
    </>
  )
}

export default TripList
