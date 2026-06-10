import React, { useState } from 'react'
import {
  Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, FormControl, Select, MenuItem
} from '@mui/material'

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>(() => {
    return JSON.parse(localStorage.getItem('octofish_users') || '[]')
  })

  const changeUserRole = (username: string, newRole: string) => {
    const updatedUsers = users.map(u =>
      u.username === username ? { ...u, role: newRole } : u
    )
    setUsers(updatedUsers)
    localStorage.setItem('octofish_users', JSON.stringify(updatedUsers))
  }

  return (
    <Paper sx={{ p: 2, mt: 3 }}>
      <Typography variant="h6" gutterBottom>Управление пользователями</Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Логин</TableCell>
              <TableCell>ФИО</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Роль</TableCell>
              <TableCell>Сменить роль</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user: any) => (
              <TableRow key={user.username}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.full_name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role === 'admin' ? 'Админ' : user.role === 'client' ? 'Клиент' : 'Гость'}
                    color={user.role === 'admin' ? 'error' : user.role === 'client' ? 'primary' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={user.role}
                      onChange={(e) => changeUserRole(user.username, e.target.value)}
                    >
                      <MenuItem value="guest">Гость</MenuItem>
                      <MenuItem value="client">Клиент</MenuItem>
                      <MenuItem value="admin">Админ</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}

export default UserManagement
