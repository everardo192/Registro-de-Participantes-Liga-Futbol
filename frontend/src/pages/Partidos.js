import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Typography, Button, Grid, TextField,
  FormControl, InputLabel, Select, MenuItem, Card,
  CardContent, CardActions, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Chip,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Divider, Alert, CircularProgress,
  Box  // ← Esta es la importación que faltaba
} from '@mui/material';
import { 
  Add, SportsSoccer, EmojiEvents, 
  Warning, Gavel, Close, Save,
  AccessTime, CalendarToday 
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../services/api';

const Partidos = () => {
  const [equipos, setEquipos] = useState([]);
  const [partidos, setPartidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [openResultado, setOpenResultado] = useState(false);
  const [openEventos, setOpenEventos] = useState(false);
  const [partidoSeleccionado, setPartidoSeleccionado] = useState(null);
  const [participantes, setParticipantes] = useState([]);
  const [filtroFecha, setFiltroFecha] = useState('');
  const [fechasUnicas, setFechasUnicas] = useState([]);

  // Estado para nuevo partido
  const [formData, setFormData] = useState({
    equipo_local_id: '',
    equipo_visitante_id: '',
    fecha: '',
    hora: ''
  });

  // Estado para resultado
  const [resultadoData, setResultadoData] = useState({
    goles_local: 0,
    goles_visitante: 0,
    estado: 'programado'
  });

  // Estado para eventos
  const [eventoData, setEventoData] = useState({
    participante_id: '',
    tipo_evento: 'gol',
    minuto: '',
    descripcion: ''
  });

  // Cargar equipos al inicio
  useEffect(() => {
    cargarEquipos();
  }, []);

  // Cargar partidos cuando tengamos equipos
  useEffect(() => {
    if (equipos.length > 0) {
      cargarPartidos();
    }
  }, [equipos]);

  // Actualizar fechas únicas cuando cambian los partidos
  useEffect(() => {
    const fechas = [...new Set(partidos.map(p => p.fecha))];
    setFechasUnicas(fechas.sort());
  }, [partidos]);

  const cargarEquipos = async () => {
    try {
      const response = await api.get('/equipos');
      setEquipos(response.data);
    } catch (error) {
      toast.error('Error al cargar equipos');
    }
  };

  const cargarPartidos = async () => {
    setLoading(true);
    try {
      const fechasResponse = await api.get('/consultas/fechas-disponibles');
      
      if (fechasResponse.data.length > 0) {
        const partidosPromises = fechasResponse.data.map(fecha => 
          api.get(`/consultas/horarios-por-fecha?fecha=${fecha}`)
        );
        
        const partidosResponses = await Promise.all(partidosPromises);
        const todosPartidos = partidosResponses.flatMap(res => res.data);
        
        // Enriquecer con IDs de equipos
        const partidosEnriquecidos = todosPartidos.map(partido => {
          const equipoLocal = equipos.find(e => e.nombre === partido.equipo_local);
          const equipoVisitante = equipos.find(e => e.nombre === partido.equipo_visitante);
          
          return {
            ...partido,
            equipo_local_id: equipoLocal?.id,
            equipo_visitante_id: equipoVisitante?.id,
            equipo_local_nombre: partido.equipo_local,
            equipo_visitante_nombre: partido.equipo_visitante
          };
        });
        
        setPartidos(partidosEnriquecidos);
      } else {
        setPartidos([]);
      }
    } catch (error) {
      console.error('Error al cargar partidos:', error);
      toast.error('Error al cargar partidos');
    } finally {
      setLoading(false);
    }
  };

  const cargarParticipantesDelPartido = async (partido) => {
    try {
      if (!partido) return;
      
      const equipoLocalId = partido.equipo_local_id;
      const equipoVisitanteId = partido.equipo_visitante_id;
      
      if (!equipoLocalId || !equipoVisitanteId) {
        toast.error('No se encontraron los IDs de los equipos');
        return;
      }

      const [localResponse, visitanteResponse] = await Promise.all([
        api.get(`/consultas/participantes-equipo/${equipoLocalId}`),
        api.get(`/consultas/participantes-equipo/${equipoVisitanteId}`)
      ]);
      
      const participantesCombinados = [
        ...localResponse.data.map(p => ({ ...p, equipo: 'local' })),
        ...visitanteResponse.data.map(p => ({ ...p, equipo: 'visitante' }))
      ];
      
      setParticipantes(participantesCombinados);
    } catch (error) {
      console.error('Error al cargar participantes:', error);
      toast.error('Error al cargar participantes');
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      equipo_local_id: '',
      equipo_visitante_id: '',
      fecha: '',
      hora: ''
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleResultadoChange = (e) => {
    setResultadoData({
      ...resultadoData,
      [e.target.name]: e.target.value
    });
  };

  const handleEventoChange = (e) => {
    setEventoData({
      ...eventoData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      if (formData.equipo_local_id === formData.equipo_visitante_id) {
        toast.error('El equipo local y visitante no pueden ser el mismo');
        return;
      }

      await api.post('/partidos', formData);
      toast.success('Partido creado exitosamente');
      handleClose();
      cargarPartidos();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al crear partido');
    }
  };

  const handleOpenResultado = (partido) => {
    setPartidoSeleccionado(partido);
    setResultadoData({
      goles_local: partido.goles_local || 0,
      goles_visitante: partido.goles_visitante || 0,
      estado: partido.estado || 'programado'
    });
    setOpenResultado(true);
  };

  const handleOpenEventos = (partido) => {
    setPartidoSeleccionado(partido);
    setEventoData({
      participante_id: '',
      tipo_evento: 'gol',
      minuto: '',
      descripcion: ''
    });
    setOpenEventos(true);
    cargarParticipantesDelPartido(partido);
  };

  const handleSubmitResultado = async () => {
    try {
      await api.put(`/partidos/${partidoSeleccionado.id}/resultado`, resultadoData);
      toast.success('Resultado actualizado exitosamente');
      setOpenResultado(false);
      cargarPartidos();
    } catch (error) {
      toast.error('Error al actualizar resultado');
    }
  };

  const handleSubmitEvento = async () => {
    try {
      if (!eventoData.participante_id || !eventoData.minuto) {
        toast.error('Complete todos los campos requeridos');
        return;
      }

      await api.post(`/partidos/${partidoSeleccionado.id}/eventos`, eventoData);
      toast.success('Evento registrado exitosamente');
      
      // Recargar datos del partido
      const response = await api.get(`/consultas/resultado-partido/${partidoSeleccionado.id}`);
      const partidoActualizado = {
        ...partidoSeleccionado,
        eventos: response.data.eventos
      };
      setPartidoSeleccionado(partidoActualizado);
      
      // Actualizar en la lista de partidos
      setPartidos(partidos.map(p => 
        p.id === partidoSeleccionado.id ? partidoActualizado : p
      ));
      
      setEventoData({
        participante_id: '',
        tipo_evento: 'gol',
        minuto: '',
        descripcion: ''
      });
      
      toast.success('Evento agregado exitosamente');
    } catch (error) {
      toast.error('Error al registrar evento');
    }
  };

  const getEventIcon = (tipo) => {
    switch (tipo) {
      case 'gol': return <EmojiEvents sx={{ color: '#4caf50' }} />;
      case 'amonestacion': return <Warning sx={{ color: '#ff9800' }} />;
      case 'penalizacion': return <Gavel sx={{ color: '#f44336' }} />;
      default: return null;
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'programado': return 'info';
      case 'en_juego': return 'warning';
      case 'finalizado': return 'success';
      case 'suspendido': return 'error';
      default: return 'default';
    }
  };

  const partidosFiltrados = filtroFecha 
    ? partidos.filter(p => p.fecha === filtroFecha)
    : partidos;

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mt: 3 }}>
        <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5">
            Gestión de Partidos
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleOpen}
          >
            Nuevo Partido
          </Button>
        </Grid>

        {/* Filtro por fecha */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filtrar por Fecha</InputLabel>
              <Select
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                label="Filtrar por Fecha"
              >
                <MenuItem value="">Todas las fechas</MenuItem>
                {fechasUnicas.map((fecha) => (
                  <MenuItem key={fecha} value={fecha}>
                    {new Date(fecha).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {loading ? (
          <Grid container justifyContent="center" sx={{ py: 4 }}>
            <CircularProgress />
          </Grid>
        ) : partidosFiltrados.length === 0 ? (
          <Alert severity="info">
            No hay partidos registrados. ¡Crea el primer partido!
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {partidosFiltrados.map((partido) => (
              <Grid item xs={12} key={partido.id}>
                <Card>
                  <CardContent>
                    <Grid container alignItems="center" spacing={2}>
                      <Grid item xs={12} md={3}>
                        <Chip 
                          label={partido.estado}
                          color={getEstadoColor(partido.estado)}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} md={9} sx={{ textAlign: 'right' }}>
                        <Chip
                          icon={<CalendarToday />}
                          label={new Date(partido.fecha).toLocaleDateString()}
                          variant="outlined"
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          icon={<AccessTime />}
                          label={partido.hora}
                          variant="outlined"
                          size="small"
                        />
                      </Grid>
                    </Grid>

                    <Grid container alignItems="center" justifyContent="center" spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={5} sx={{ textAlign: 'center' }}>
                        <Typography variant="h6">{partido.equipo_local}</Typography>
                      </Grid>
                      <Grid item xs={2} sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" color="primary">
                          {partido.goles_local} - {partido.goles_visitante}
                        </Typography>
                      </Grid>
                      <Grid item xs={5} sx={{ textAlign: 'center' }}>
                        <Typography variant="h6">{partido.equipo_visitante}</Typography>
                      </Grid>
                    </Grid>

                    {/* Mostrar eventos si existen */}
                    {partido.eventos && partido.eventos.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Eventos del partido:
                        </Typography>
                        <Grid container spacing={1}>
                          {partido.eventos.map((evento) => (
                            <Grid item key={evento.id}>
                              <Chip
                                icon={getEventIcon(evento.tipo_evento)}
                                label={`${evento.minuto}' - ${evento.tipo_evento}`}
                                size="small"
                                variant="outlined"
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      color="primary"
                      startIcon={<SportsSoccer />}
                      onClick={() => handleOpenResultado(partido)}
                      disabled={partido.estado === 'finalizado'}
                    >
                      {partido.estado === 'finalizado' ? 'Finalizado' : 'Registrar Resultado'}
                    </Button>
                    {partido.estado === 'finalizado' && (
                      <Button
                        size="small"
                        color="secondary"
                        startIcon={<EmojiEvents />}
                        onClick={() => handleOpenEventos(partido)}
                      >
                        Eventos
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Dialog para nuevo partido */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Registrar Nuevo Partido
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Equipo Local *</InputLabel>
                <Select
                  name="equipo_local_id"
                  value={formData.equipo_local_id}
                  onChange={handleChange}
                  label="Equipo Local *"
                  required
                >
                  {equipos.map((equipo) => (
                    <MenuItem key={equipo.id} value={equipo.id}>
                      {equipo.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Equipo Visitante *</InputLabel>
                <Select
                  name="equipo_visitante_id"
                  value={formData.equipo_visitante_id}
                  onChange={handleChange}
                  label="Equipo Visitante *"
                  required
                >
                  {equipos.map((equipo) => (
                    <MenuItem key={equipo.id} value={equipo.id}>
                      {equipo.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Fecha *"
                name="fecha"
                type="date"
                value={formData.fecha}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Hora *"
                name="hora"
                type="time"
                value={formData.hora}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            startIcon={<Save />}
          >
            Guardar Partido
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para resultado */}
      <Dialog open={openResultado} onClose={() => setOpenResultado(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Registrar Resultado
        </DialogTitle>
        <DialogContent dividers>
          {partidoSeleccionado && (
            <Grid container spacing={3}>
              <Grid item xs={5} sx={{ textAlign: 'center' }}>
                <Typography variant="h6">{partidoSeleccionado.equipo_local}</Typography>
                <TextField
                  fullWidth
                  label="Goles"
                  name="goles_local"
                  type="number"
                  value={resultadoData.goles_local}
                  onChange={handleResultadoChange}
                  inputProps={{ min: 0 }}
                  sx={{ mt: 2 }}
                />
              </Grid>
              <Grid item xs={2} sx={{ textAlign: 'center', alignSelf: 'center' }}>
                <Typography variant="h5">VS</Typography>
              </Grid>
              <Grid item xs={5} sx={{ textAlign: 'center' }}>
                <Typography variant="h6">{partidoSeleccionado.equipo_visitante}</Typography>
                <TextField
                  fullWidth
                  label="Goles"
                  name="goles_visitante"
                  type="number"
                  value={resultadoData.goles_visitante}
                  onChange={handleResultadoChange}
                  inputProps={{ min: 0 }}
                  sx={{ mt: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    name="estado"
                    value={resultadoData.estado}
                    onChange={handleResultadoChange}
                    label="Estado"
                  >
                    <MenuItem value="programado">Programado</MenuItem>
                    <MenuItem value="en_juego">En Juego</MenuItem>
                    <MenuItem value="finalizado">Finalizado</MenuItem>
                    <MenuItem value="suspendido">Suspendido</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenResultado(false)}>Cancelar</Button>
          <Button 
            onClick={handleSubmitResultado} 
            variant="contained" 
            color="primary"
            startIcon={<Save />}
          >
            Guardar Resultado
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para eventos */}
      <Dialog open={openEventos} onClose={() => setOpenEventos(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Eventos del Partido
        </DialogTitle>
        <DialogContent dividers>
          {partidoSeleccionado && (
            <Grid container spacing={3}>
              {/* Lista de eventos existentes */}
              {partidoSeleccionado.eventos && partidoSeleccionado.eventos.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Eventos registrados:
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Minuto</TableCell>
                          <TableCell>Tipo</TableCell>
                          <TableCell>Jugador</TableCell>
                          <TableCell>Descripción</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {partidoSeleccionado.eventos.map((evento) => (
                          <TableRow key={evento.id}>
                            <TableCell>{evento.minuto}'</TableCell>
                            <TableCell>
                              <Grid container alignItems="center" spacing={1}>
                                <Grid item>{getEventIcon(evento.tipo_evento)}</Grid>
                                <Grid item>{evento.tipo_evento}</Grid>
                              </Grid>
                            </TableCell>
                            <TableCell>
                              {evento.nombre} {evento.apellido_paterno}
                            </TableCell>
                            <TableCell>{evento.descripcion}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Divider sx={{ my: 2 }} />
                </Grid>
              )}

              {/* Formulario para nuevo evento */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Agregar nuevo evento:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Tipo de Evento</InputLabel>
                      <Select
                        name="tipo_evento"
                        value={eventoData.tipo_evento}
                        onChange={handleEventoChange}
                        label="Tipo de Evento"
                      >
                        <MenuItem value="gol">⚽ Gol</MenuItem>
                        <MenuItem value="amonestacion">🟨 Amonestación</MenuItem>
                        <MenuItem value="penalizacion">🔴 Penalización</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField
                      fullWidth
                      label="Minuto"
                      name="minuto"
                      type="number"
                      value={eventoData.minuto}
                      onChange={handleEventoChange}
                      inputProps={{ min: 1, max: 120 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Jugador</InputLabel>
                      <Select
                        name="participante_id"
                        value={eventoData.participante_id}
                        onChange={handleEventoChange}
                        label="Jugador"
                      >
                        {participantes.map((p) => (
                          <MenuItem key={p.id} value={p.id}>
                            {p.nombre} {p.apellido_paterno} 
                            {p.equipo === 'local' ? ' (Local)' : ' (Visitante)'}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Descripción"
                      name="descripcion"
                      value={eventoData.descripcion}
                      onChange={handleEventoChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEventos(false)}>Cerrar</Button>
          <Button 
            onClick={handleSubmitEvento} 
            variant="contained" 
            color="primary"
            startIcon={<Add />}
          >
            Agregar Evento
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Partidos;