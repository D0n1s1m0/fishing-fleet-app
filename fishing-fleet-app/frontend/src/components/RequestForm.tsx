import React, { useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Grid, MenuItem, Alert, FormControl, InputLabel, Select
} from '@mui/material'

interface RequestFormProps {
  open: boolean
  onClose: () => void
  type: 'boat' | 'trip' | 'spot'
  spots?: any[]
  boats?: any[]
  onSubmit: (data: any) => void
}

const RequestForm: React.FC<RequestFormProps> = ({ open, onClose, type, spots, boats, onSubmit }) => {
  const [formData, setFormData] = useState<any>({
    name: '',
    boat_id: 0,
    boat_name: '',
    departure_date: new Date().toISOString().split('T')[0],
    fishing_spots: [''],
    crew: [{ name: '', position: 'Капитан', experience: 0 }],
    position: [69.0, 35.0],
    depth: 0,
    fishTypes: [],
    catchRate: 'medium',
    description: ''
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (type === 'trip') {
      if (!formData.boat_id) {
        newErrors.boat_id = 'Выберите судно для рейса'
      }
      if (!formData.crew[0]?.name || formData.crew[0].name.trim().length === 0) {
        newErrors.captain = 'Укажите капитана рейса'
      }
      if (!formData.fishing_spots[0]) {
        newErrors.spot = 'Выберите место лова'
      }
    }

    if (type === 'boat') {
      if (!formData.name || formData.name.trim().length < 2) {
        newErrors.name = 'Название судна должно содержать не менее 2 символов'
      }
    }

    if (type === 'spot') {
      if (!formData.name || formData.name.trim().length < 2) {
        newErrors.name = 'Название места лова должно содержать не менее 2 символов'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    const data = { ...formData }
    if (type === 'spot') {
      data.position = [parseFloat(data.position[0]) || 69.0, parseFloat(data.position[1]) || 35.0]
      data.depth = parseFloat(data.depth) || 0
      if (typeof data.fishTypes === 'string') {
        data.fishTypes = data.fishTypes.split(',').map((s: string) => s.trim()).filter(Boolean)
      }
    }
    onSubmit(data)
  }

  const renderBoatForm = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField fullWidth label="Название судна" value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={!!errors.name} helperText={errors.name} required />
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel>Тип судна</InputLabel>
          <Select value={formData.type || 'Траулер'} label="Тип судна"
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
            <MenuItem value="Траулер">Траулер</MenuItem>
            <MenuItem value="Сейнер">Сейнер</MenuItem>
            <MenuItem value="Краболов">Краболов</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={6}>
        <TextField fullWidth label="Водоизмещение (т)" type="number"
          value={formData.displacement || ''}
          onChange={(e) => setFormData({ ...formData, displacement: e.target.value })} />
      </Grid>
      <Grid item xs={6}>
        <TextField fullWidth label="Год постройки" type="date"
          value={formData.build_date || ''}
          onChange={(e) => setFormData({ ...formData, build_date: e.target.value })}
          InputLabelProps={{ shrink: true }} />
      </Grid>
      <Grid item xs={12}>
        <TextField fullWidth label="Капитан" value={formData.captain || ''}
          onChange={(e) => setFormData({ ...formData, captain: e.target.value })} />
      </Grid>
    </Grid>
  )

  const renderTripForm = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <FormControl fullWidth error={!!errors.boat_id}>
          <InputLabel>Выберите судно</InputLabel>
          <Select value={formData.boat_id || 0} label="Выберите судно"
            onChange={(e) => {
              const boat = boats?.find(b => b.id === e.target.value)
              setFormData({ ...formData, boat_id: e.target.value, boat_name: boat?.name || '' })
            }}>
            <MenuItem value={0}>Выберите судно...</MenuItem>
            {boats?.filter(b => b.status === 'in_port' || b.status === 'active').map((boat: any) => (
              <MenuItem key={boat.id} value={boat.id}>{boat.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {errors.boat_id && <Alert severity="error" sx={{ mt: 1 }}>{errors.boat_id}</Alert>}
      </Grid>
      <Grid item xs={6}>
        <TextField fullWidth label="Дата выхода" type="date"
          value={formData.departure_date} InputLabelProps={{ shrink: true }}
          onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })} />
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth error={!!errors.spot}>
          <InputLabel>Место лова</InputLabel>
          <Select value={formData.fishing_spots[0] || ''} label="Место лова"
            onChange={(e) => setFormData({ ...formData, fishing_spots: [e.target.value] })}>
            <MenuItem value="">Выберите место...</MenuItem>
            {spots?.filter((s: any) => s.depth > 0).map((spot: any) => (
              <MenuItem key={spot.id} value={spot.name}>{spot.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {errors.spot && <Alert severity="error" sx={{ mt: 1 }}>{errors.spot}</Alert>}
      </Grid>
      <Grid item xs={12}>
        <TextField fullWidth label="Капитан рейса" required
          value={formData.crew[0]?.name || ''}
          error={!!errors.captain}
          helperText={errors.captain || 'Укажите ФИО капитана, который будет управлять судном'}
          onChange={(e) => setFormData({
            ...formData,
            crew: [{ name: e.target.value, position: 'Капитан', experience: 0 }]
          })} />
      </Grid>
    </Grid>
  )

  const renderSpotForm = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField fullWidth label="Название места лова" value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={!!errors.name} helperText={errors.name} required />
      </Grid>
      <Grid item xs={6}>
        <TextField fullWidth label="Широта" type="number"
          value={formData.position[0] || 69.0}
          onChange={(e) => setFormData({ ...formData, position: [parseFloat(e.target.value) || 69.0, formData.position[1] || 35.0] })}
          inputProps={{ step: 0.1, min: -90, max: 90 }} />
      </Grid>
      <Grid item xs={6}>
        <TextField fullWidth label="Долгота" type="number"
          value={formData.position[1] || 35.0}
          onChange={(e) => setFormData({ ...formData, position: [formData.position[0] || 69.0, parseFloat(e.target.value) || 35.0] })}
          inputProps={{ step: 0.1, min: -180, max: 180 }} />
      </Grid>
      <Grid item xs={12}>
        <TextField fullWidth label="Глубина (м)" type="number"
          value={formData.depth || ''}
          onChange={(e) => setFormData({ ...formData, depth: parseFloat(e.target.value) || 0 })} />
      </Grid>
      <Grid item xs={12}>
        <TextField fullWidth label="Виды рыб (через запятую)"
          value={Array.isArray(formData.fishTypes) ? formData.fishTypes.join(', ') : formData.fishTypes || ''}
          onChange={(e) => setFormData({ ...formData, fishTypes: e.target.value })} />
      </Grid>
    </Grid>
  )

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {type === 'boat' && 'Заявка на добавление судна'}
        {type === 'trip' && 'Заявка на создание рейса'}
        {type === 'spot' && 'Заявка на новое место лова'}
      </DialogTitle>
      <DialogContent>
        {type === 'trip' && <Alert severity="info" sx={{ mb: 2 }}>Все поля обязательны для заполнения</Alert>}
        {type === 'boat' && renderBoatForm()}
        {type === 'trip' && renderTripForm()}
        {type === 'spot' && renderSpotForm()}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button variant="contained" onClick={handleSubmit}>Отправить заявку</Button>
      </DialogActions>
    </Dialog>
  )
}

export default RequestForm
