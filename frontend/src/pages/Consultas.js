import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Typography, Grid, FormControl,
  InputLabel, Select, MenuItem, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Card, CardContent, CardMedia, Box, Avatar, Divider,
  Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { ExpandMore, EmojiEvents, Warning, Gavel } from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../services/api';

const Consultas = () => {
  const [fechas, setFechas] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [equipoSeleccionado, setEquipoSeleccionado] = useState('');
  const [partidoSeleccionado, setPartidoSeleccionado] = useState('');
  const [horarios, setHorarios] = useState([]);
  const [resultadoPartido, setResultadoPartido] = useState(null);
  const [participantesEquipo, setParticipantesEquipo] = useState([]);
  const [partidos, setPartidos] = useState([]);

  useEffect(() => {
    cargarFechas();
    cargarEquipos();
  }, []);

  useEffect(() => {
    if (fechaSeleccionada) {
      cargarHorarios();
    }
  }, [fechaSeleccionada]);

  useEffect(() => {
    if (partidoSeleccionado) {
      cargarResultadoPartido();
    }
  }, [partidoSeleccionado]);

  useEffect(() => {
    if (equipoSeleccionado) {
      cargarParticipantesEquipo();
    }
  }, [equipoSeleccionado]);

  const cargarFechas = async () => {
    try {
      const response = await api.get('/consultas/fechas-disponibles');
      setFechas(response.data);
    } catch (error) {
      toast.error('Error al cargar fechas');
    }
  };

  const cargarEquipos = async () => {
    try {
      const response = await api.get('/equipos');
      setEquipos(response.data);
    } catch (error) {
      toast.error('Error al cargar equipos');
    }
  };

  const cargarHorarios = async () => {
    try {
      const response = await api.get(`/consultas/horarios-por-fecha?fecha=${fechaSeleccionada}`);
      setHorarios(response.data);
      setPartidos(response.data);
    } catch (error) {
      toast.error('Error al cargar horarios');
    }
  };

  const cargarResultadoPartido = async () => {
    try {
      const response = await api.get(`/consultas/resultado-partido/${partidoSeleccionado}`);
      setResultadoPartido(response.data);
    } catch (error) {
      toast.error('Error al cargar resultado del partido');
    }
  };

  const cargarParticipantesEquipo = async () => {
    try {
      const response = await api.get(`/consultas/participantes-equipo/${equipoSeleccionado}`);
      setParticipantesEquipo(response.data);
    } catch (error) {
      toast.error('Error al cargar participantes');
    }
  };

  const getEventIcon = (tipo) => {
    switch (tipo) {
      case 'gol': return <EmojiEvents color="success" />;
      case 'amonestacion': return <Warning color="warning" />;
      case 'penalizacion': return <Gavel color="error" />;
      default: return null;
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>
        Consultas de la Liga
      </Typography>

      {/* Consulta A: Horarios por fecha */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          A. Horarios de Partidos por Fecha
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Seleccionar Fecha</InputLabel>
              <Select
                value={fechaSeleccionada}
                onChange={(e) => setFechaSeleccionada(e.target.value)}
                label="Seleccionar Fecha"
              >
                {fechas.map((fecha) => (
                  <MenuItem key={fecha} value={fecha}>
                    {new Date(fecha).toLocaleDateString()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {horarios.length > 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Hora</TableCell>
                  <TableCell>Equipo Local</TableCell>
                  <TableCell>Equipo Visitante</TableCell>
                  <TableCell>Resultado</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {horarios.map((partido) => (
                  <TableRow key={partido.id}>
                    <TableCell>{partido.hora}</TableCell>
                    <TableCell>{partido.equipo_local}</TableCell>
                    <TableCell>{partido.equipo_visitante}</TableCell>
                    <TableCell>
                      {partido.goles_local} - {partido.goles_visitante}
                    </TableCell>
                    <TableCell>{partido.estado}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Consulta B: Resultados de partido */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          B. Resultados Detallados del Partido
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Seleccionar Fecha</InputLabel>
              <Select
                value={fechaSeleccionada}
                onChange={(e) => setFechaSeleccionada(e.target.value)}
                label="Seleccionar Fecha"
              >
                {fechas.map((fecha) => (
                  <MenuItem key={fecha} value={fecha}>
                    {new Date(fecha).toLocaleDateString()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Seleccionar Partido</InputLabel>
              <Select
                value={partidoSeleccionado}
                onChange={(e) => setPartidoSeleccionado(e.target.value)}
                label="Seleccionar Partido"
                disabled={!fechaSeleccionada}
              >
                {partidos.map((partido) => (
                  <MenuItem key={partido.id} value={partido.id}>
                    {partido.equipo_local} vs {partido.equipo_visitante} ({partido.hora})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {resultadoPartido && (
          <Box>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item xs={5} sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">{resultadoPartido.partido.equipo_local_nombre}</Typography>
                    <Typography variant="h3">{resultadoPartido.partido.goles_local}</Typography>
                  </Grid>
                  <Grid item xs={2} sx={{ textAlign: 'center' }}>
                    <Typography variant="h5">VS</Typography>
                  </Grid>
                  <Grid item xs={5} sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">{resultadoPartido.partido.equipo_visitante_nombre}</Typography>
                    <Typography variant="h3">{resultadoPartido.partido.goles_visitante}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Typography variant="subtitle1" gutterBottom>
              Eventos del Partido:
            </Typography>
            {resultadoPartido.eventos.map((evento) => (
              <Accordion key={evento.id}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Grid container alignItems="center" spacing={1}>
                    <Grid item>
                      {getEventIcon(evento.tipo_evento)}
                    </Grid>
                    <Grid item>
                      <Typography>
                        Minuto {evento.minuto}: {evento.tipo_evento} - {evento.nombre} {evento.apellido_paterno}
                      </Typography>
                    </Grid>
                  </Grid>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    {evento.descripcion}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}
      </Paper>

      {/* Consulta C: Participantes por equipo */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          C. Participantes por Equipo
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
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
        </Grid>

        {participantesEquipo.length > 0 && (
          <Grid container spacing={2}>
            {participantesEquipo.map((participante) => (
              <Grid item xs={12} md={6} lg={4} key={participante.id}>
                <Card>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Avatar
                          src={participante.foto ? `http://localhost:5000/${participante.foto}` : ''}
                          sx={{ width: 80, height: 80 }}
                        />
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="subtitle1">
                          {participante.nombre} {participante.apellido_paterno} {participante.apellido_materno}
                        </Typography>
                        {participante.apodo && (
                          <Typography variant="body2" color="textSecondary">
                            "{participante.apodo}"
                          </Typography>
                        )}
                        <Typography variant="body2">
                          Posición: {participante.posicion_nombre}
                        </Typography>
                        <Typography variant="body2">
                          N° Camiseta: {participante.numero_camiseta}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Divider sx={{ my: 1 }} />
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="caption" display="block">
                          F. Nacimiento: {new Date(participante.fecha_nacimiento).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="caption" display="block">
                          Peso: {participante.peso} kg
                        </Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="caption" display="block">
                          Estatura: {participante.estatura} m
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Container>
  );
};

export default Consultas;