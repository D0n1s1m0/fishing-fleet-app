import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Grid, MenuItem, Alert, FormControl, InputLabel, Select
} from '@mui/material';

interface RequestFormProps {
  open: boolean;
  onClose: () => void;
  type: 'boat' | 'trip' | 'spot';
  spots?: any[];
  boats?: any[];
  onSubmit: (data: any) => void;
}

const RequestForm: React.FC<RequestFormProps> = ({ open, onClose, type, spots, boats, onSubmit }) => {
  const [formData, setFormData] = useState<any>({
    name: '',
    type: 'Траулер',
    position: [69.0, 35.0],
    depth: 0,
    fishTypes: [],
    catchRate: 'medium',
    description: ''
  });

  const handleSubmit = () => {
    const data = { ...formData };
    
    if (type === 'spot') {
      // Убеждаемся что координаты - числа
      data.position = [
        parseFloat(data.position[0]) || 69.0,
        parseFloat(data.position[1]) || 35.0
      ];
      data.depth = parseFloat(data.depth) || 0;
      // Преобразуем строку с видами рыб в массив
      if (typeof data.fishTypes === 'string') {
        data.fishTypes = data.fishTypes.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    }
    
    if (type === 'boat') {
      data.displacement = parseFloat(data.displacement) || 0;
      data.crew_capacity = parseInt(data.crew_capacity) || 10;
      data.max_speed = parseFloat(data.max_speed) || 10;
    }
    
    onSubmit(data);
  };

  const renderSpotForm = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Название места лова"
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          fullWidth
          label="Широта"
          type="number"
          value={formData.position?.[0] || 69.0}
          onChange={(e) => setFormData({ 
            ...formData, 
            position: [parseFloat(e.target.value) || 69.0, formData.position?.[1] || 35.0] 
          })}
          placeholder="69.0"
          inputProps={{ step: 0.1, min: 0, max: 90 }}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          fullWidth
          label="Долгота"
          type="number"
          value={formData.position?.[1] || 35.0}
          onChange={(e) => setFormData({ 
            ...formData, 
            position: [formData.position?.[0] || 69.0, parseFloat(e.target.value) || 35.0] 
          })}
          placeholder="35.0"
          inputProps={{ step: 0.1, min: 0, max: 180 }}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Глубина (м)"
          type="number"
          value={formData.depth || ''}
          onChange={(e) => setFormData({ ...formData, depth: parseFloat(e.target.value) || 0 })}
          inputProps={{ min: 0 }}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Виды рыб (через запятую)"
          value={Array.isArray(formData.fishTypes) ? formData.fishTypes.join(', ') : formData.fishTypes || ''}
          onChange={(e) => setFormData({ ...formData, fishTypes: e.target.value })}
          placeholder="Треска, Пикша, Минтай"
        />
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel>Уловистость</InputLabel>
          <Select
            value={formData.catchRate || 'medium'}
            label="Уловистость"
            onChange={(e) => setFormData({ ...formData, catchRate: e.target.value })}
          >
            <MenuItem value="high">Высокая</MenuItem>
            <MenuItem value="medium">Средняя</MenuItem>
            <MenuItem value="low">Низкая</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Описание"
          multiline
          rows={3}
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </Grid>
    </Grid>
  );

  const renderBoatForm = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Название судна"
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel>Тип судна</InputLabel>
          <Select
            value={formData.type || 'Траулер'}
            label="Тип судна"
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          >
            <MenuItem value="Траулер">Траулер</MenuItem>
            <MenuItem value="Сейнер">Сейнер</MenuItem>
            <MenuItem value="Краболов">Краболов</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={6}>
        <TextField
          fullWidth
          label="Водоизмещение (т)"
          type="number"
          value={formData.displacement || ''}
          onChange={(e) => setFormData({ ...formData, displacement: e.target.value })}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          fullWidth
          label="Год постройки"
          type="date"
          value={formData.build_date || ''}
          onChange={(e) => setFormData({ ...formData, build_date: e.target.value })}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Капитан"
          value={formData.captain || ''}
          onChange={(e) => setFormData({ ...formData, captain: e.target.value })}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          fullWidth
          label="Экипаж (чел)"
          type="number"
          value={formData.crew_capacity || ''}
          onChange={(e) => setFormData({ ...formData, crew_capacity: e.target.value })}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          fullWidth
          label="Макс. скорость (узл)"
          type="number"
          value={formData.max_speed || ''}
          onChange={(e) => setFormData({ ...formData, max_speed: e.target.value })}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Описание"
          multiline
          rows={2}
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </Grid>
    </Grid>
  );

  const renderTripForm = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel>Выберите судно</InputLabel>
          <Select
            value={formData.boat_id || ''}
            label="Выберите судно"
            onChange={(e) => {
              const boat = boats?.find(b => b.id === e.target.value);
              setFormData({ ...formData, boat_id: e.target.value, boat_name: boat?.name });
            }}
          >
            {boats?.filter(b => b.status === 'in_port' || b.status === 'active').map((boat: any) => (
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
          value={formData.departure_date || new Date().toISOString().split('T')[0]}
          onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel>Место лова</InputLabel>
          <Select
            value={formData.fishing_spots?.[0] || ''}
            label="Место лова"
            onChange={(e) => setFormData({ ...formData, fishing_spots: [e.target.value] })}
          >
            {spots?.filter((s: any) => s.depth > 0).map((spot: any) => (
              <MenuItem key={spot.id} value={spot.name}>{spot.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Капитан (ФИО)"
          value={formData.crew?.[0]?.name || ''}
          onChange={(e) => setFormData({ 
            ...formData, 
            crew: [{ id: 1, name: e.target.value, position: 'Капитан', experience: 0 }] 
          })}
        />
      </Grid>
    </Grid>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {type === 'boat' && '🚢 Заявка на добавление судна'}
        {type === 'trip' && '🛥️ Заявка на создание рейса'}
        {type === 'spot' && '📍 Заявка на новое место лова'}
      </DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          {type === 'spot' && 'Укажите координаты места лова (широта и долгота)'}
          {type === 'boat' && 'Заполните характеристики судна'}
          {type === 'trip' && 'Выберите судно и место лова'}
        </Alert>
        
        {type === 'spot' && renderSpotForm()}
        {type === 'boat' && renderBoatForm()}
        {type === 'trip' && renderTripForm()}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Отправить заявку
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RequestForm;
