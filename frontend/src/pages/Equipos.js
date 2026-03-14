import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Typography, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Grid,
  IconButton, Avatar
} from '@mui/material';
import { Add, Edit, Delete, PhotoCamera } from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../services/api';

const Equipos = () => {
  const [equipos, setEquipos] = useState([]);
  const [open, setOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    color_principal: '',
    color_secundario: '',
    logo: null
  });
  const [previewLogo, setPreviewLogo] = useState('');

  useEffect(() => {
    cargarEquipos();
  }, []);

  const cargarEquipos = async () => {
    try {
      const response = await api.get('/equipos');
      setEquipos(response.data);
    } catch (error) {
      toast.error('Error al cargar equipos');
    }
  };

  const handleOpen = (equipo = null) => {
    if (equipo) {
      setEditando(equipo);
      setFormData({
        nombre: equipo.nombre,
        color_principal: equipo.color_principal,
        color_secundario: equipo.color_secundario,
        logo: null
      });
      setPreviewLogo(equipo.logo ? `http://localhost:5000/${equipo.logo}` : '');
    } else {
      setEditando(null);
      setFormData({
        nombre: '',
        color_principal: '',
        color_secundario: '',
        logo: null
      });
      setPreviewLogo('');
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditando(null);
    setPreviewLogo('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        logo: file
      });
      setPreviewLogo(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nombre', formData.nombre);
      formDataToSend.append('color_principal', formData.color_principal);
      formDataToSend.append('color_secundario', formData.color_secundario);
      if (formData.logo) {
        formDataToSend.append('logo', formData.logo);
      }

      if (editando) {
        await api.put(`/equipos/${editando.id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Equipo actualizado exitosamente');
      } else {
        await api.post('/equipos', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Equipo creado exitosamente');
      }
      
      handleClose();
      cargarEquipos();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar equipo');
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mt: 3 }}>
        <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5">Gestión de Equipos</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => handleOpen()}
          >
            Nuevo Equipo
          </Button>
        </Grid>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Logo</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Color Principal</TableCell>
                <TableCell>Color Secundario</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {equipos.map((equipo) => (
                <TableRow key={equipo.id}>
                  <TableCell>
                    {equipo.logo && (
                      <Avatar 
                        src={`http://localhost:5000/${equipo.logo}`}
                        alt={equipo.nombre}
                        sx={{ width: 50, height: 50 }}
                      />
                    )}
                  </TableCell>
                  <TableCell>{equipo.nombre}</TableCell>
                  <TableCell>
                    <div style={{ 
                      width: 30, 
                      height: 30, 
                      backgroundColor: equipo.color_principal,
                      borderRadius: '50%'
                    }} />
                  </TableCell>
                  <TableCell>
                    <div style={{ 
                      width: 30, 
                      height: 30, 
                      backgroundColor: equipo.color_secundario,
                      borderRadius: '50%'
                    }} />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpen(equipo)} color="primary">
                      <Edit />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editando ? 'Editar Equipo' : 'Nuevo Equipo'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre del Equipo"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Color Principal"
                name="color_principal"
                type="color"
                value={formData.color_principal}
                onChange={handleChange}
                sx={{ '& input': { height: 50 } }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Color Secundario"
                name="color_secundario"
                type="color"
                value={formData.color_secundario}
                onChange={handleChange}
                sx={{ '& input': { height: 50 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCamera />}
                fullWidth
              >
                Subir Logo
                <input
                  type="file"
                  hidden
                  accept="image/jpeg,image/png"
                  onChange={handleFileChange}
                />
              </Button>
            </Grid>
            {previewLogo && (
              <Grid item xs={12} sx={{ textAlign: 'center' }}>
                <Avatar 
                  src={previewLogo}
                  sx={{ width: 100, height: 100, margin: 'auto' }}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editando ? 'Actualizar' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Equipos;