import React from 'react';
import { Container, Paper, Typography, Grid, Card, CardContent } from '@mui/material';
import { SportsSoccer, Group, EmojiEvents, Assessment } from '@mui/icons-material';

const Inicio = () => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'url("https://wallpapers.com/images/hd/football-background-8543042efgz33p6a.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      padding: '20px 0'
    }}>
      <Container maxWidth="lg">
        <Paper sx={{ 
          p: 4, 
          mt: 3, 
          textAlign: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.9)' // Fondo semitransparente para mejor legibilidad
        }}>
          <Typography variant="h3" gutterBottom>
            🏆 Liga de Fútbol 🏆
          </Typography>
          <Typography variant="h6" color="textSecondary" paragraph>
            Sistema de Gestión Integral para Torneos de Fútbol
          </Typography>
        </Paper>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <SportsSoccer sx={{ fontSize: 60, color: '#1976d2' }} />
                <Typography variant="h6">Equipos</Typography>
                <Typography variant="body2" color="textSecondary">
                  Gestiona los equipos participantes, sus colores y logotipos
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Group sx={{ fontSize: 60, color: '#1976d2' }} />
                <Typography variant="h6">Jugadores</Typography>
                <Typography variant="body2" color="textSecondary">
                  Registra los participantes con sus datos y fotos
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <EmojiEvents sx={{ fontSize: 60, color: '#1976d2' }} />
                <Typography variant="h6">Partidos</Typography>
                <Typography variant="body2" color="textSecondary">
                  Programa encuentros y registra resultados
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Assessment sx={{ fontSize: 60, color: '#1976d2' }} />
                <Typography variant="h6">Consultas</Typography>
                <Typography variant="body2" color="textSecondary">
                  Visualiza horarios, resultados y participantes
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default Inicio;