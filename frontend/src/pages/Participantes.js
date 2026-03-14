import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Typography, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Grid,
  IconButton, Avatar, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { Add, Edit, PhotoCamera } from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../services/api';

const Participantes = () => {
  const [participantes, setParticipantes] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [posiciones, setPosiciones] = useState([]);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState('');
  const [open, setOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    equipo_id: '',
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    apodo: '',
    fecha_nacimiento: '',
    posicion_id: '',
    numero_camiseta: '',
    peso: '',
    estatura: '',
    foto: null
  });
  const [previewFoto, setPreviewFoto] = useState('');

  useEffect(() => {
    cargarEquipos();
    cargarPosiciones();
  }, []);

  useEffect(() => {
    if (equipoSeleccionado) {
      cargarParticipantes();
    }
  }, [equipoSeleccionado]);

  const cargarEquipos = async () => {
    try {
      const response = await api.get('/equipos');
      setEquipos(response.data);
    } catch (error) {
      toast.error('Error al cargar equipos');
    }
  };

  const cargarPosiciones = async () => {
    try {
      const response = await api.get('/participantes/posiciones');
      setPosiciones(response.data);
    } catch (error) {
      toast.error('Error al cargar posiciones');
    }
  };

  const cargarParticipantes = async () => {
    try {
      const response = await api.get(`/participantes/equipo/${equipoSeleccionado}`);
      setParticipantes(response.data);
    } catch (error) {
      toast.error('Error al cargar participantes');
    }
  };

  const handleOpen = (participante = null) => {
    if (participante) {
      setEditando(participante);
      setFormData({
        equipo_id: participante.equipo_id,
        nombre: participante.nombre,
        apellido_paterno: participante.apellido_paterno,
        apellido_materno: participante.apellido_materno,
        apodo: participante.apodo || '',
        fecha_nacimiento: participante.fecha_nacimiento,
        posicion_id: participante.posicion_id,
        numero_camiseta: participante.numero_camiseta,
        peso: participante.peso,
        estatura: participante.estatura,
        foto: null
      });
      setPreviewFoto(participante.foto ? `http://localhost:5000/${participante.foto}` : '');
    } else {
      setEditando(null);
      setFormData({
        ...formData,
        equipo_id: equipoSeleccionado
      });
      setPreviewFoto('');
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditando(null);
    setPreviewFoto('');
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
        foto: file
      });
      setPreviewFoto(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (editando) {
        await api.put(`/participantes/${editando.id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Participante actualizado exitosamente');
      } else {
        await api.post('/participantes', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Participante creado exitosamente');
      }
      
      handleClose();
      cargarParticipantes();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar participante');
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mt: 3 }}>
        <Grid container spacing={3} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5">Gestión de Participantes</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Seleccionar Equipo</InputLabel>
              <Select
                value={equipoSeleccionado}
                onChange={(e) => setEquipoSeleccionado(e.target.value)}
                label="Seleccionar Equipo"
              >
                {equipos.map((equipo) => (
                  <MenuItem key={equipo.id} value={equipo.id}>
                    {equipo.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => handleOpen()}
              disabled={!equipoSeleccionado}
            >
              Nuevo
            </Button>
          </Grid>
        </Grid>

        {equipoSeleccionado && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Foto</TableCell>
                  <TableCell>Nombre Completo</TableCell>
                  <TableCell>Apodo</TableCell>
                  <TableCell>Posición</TableCell>
                  <TableCell>N° Camiseta</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {participantes.map((participante) => (
                  <TableRow key={participante.id}>
                    <TableCell>
                      {participante.foto && (
                        <Avatar 
                          src={`http://localhost:5000/${participante.foto}`}
                          alt={participante.nombre}
                          sx={{ width: 50, height: 50 }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {`${participante.apellido_paterno} ${participante.apellido_materno}, ${participante.nombre}`}
                    </TableCell>
                    <TableCell>{participante.apodo}</TableCell>
                    <TableCell>{participante.posicion_nombre}</TableCell>
                    <TableCell>{participante.numero_camiseta}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpen(participante)} color="primary">
                        <Edit />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editando ? 'Editar Participante' : 'Nuevo Participante'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Nombre(s)"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Apellido Paterno"
                name="apellido_paterno"
                value={formData.apellido_paterno}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Apellido Materno"
                name="apellido_materno"
                value={formData.apellido_materno}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Apodo"
                name="apodo"
                value={formData.apodo}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Fecha Nacimiento"
                name="fecha_nacimiento"
                type="date"
                value={formData.fecha_nacimiento}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel>Posición</InputLabel>
                <Select
                  name="posicion_id"
                  value={formData.posicion_id}
                  onChange={handleChange}
                  label="Posición"
                  required
                >
                  {posiciones.map((pos) => (
                    <MenuItem key={pos.id} value={pos.id}>
                      {pos.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={3}>
              <TextField
                fullWidth
                label="N° Camiseta"
                name="numero_camiseta"
                type="number"
                value={formData.numero_camiseta}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                fullWidth
                label="Peso (kg)"
                name="peso"
                type="number"
                value={formData.peso}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                fullWidth
                label="Estatura (m)"
                name="estatura"
                type="number"
                inputProps={{ step: 0.01 }}
                value={formData.estatura}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={3}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCamera />}
                fullWidth
              >
                Foto
                <input
                  type="file"
                  hidden
                  accept="image/jpeg,image/png"
                  onChange={handleFileChange}
                />
              </Button>
            </Grid>
            {previewFoto && (
              <Grid item xs={12} sx={{ textAlign: 'center' }}>
                <Avatar 
                  src={previewFoto}
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

export default Participantes;