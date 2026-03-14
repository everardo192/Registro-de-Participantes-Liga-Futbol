const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const { initDatabase } = require('./config/database');

// Importar rutas
const equipoRoutes = require('./routes/equipo.routes');
const participanteRoutes = require('./routes/participante.routes');
const partidoRoutes = require('./routes/partido.routes');
const consultaRoutes = require('./routes/consulta.routes');

const app = express();

// Configuración CORS mejorada
app.use(cors({
  origin: 'http://localhost:3000', // Permitir solo tu frontend
  credentials: true,
  optionsSuccessStatus: 200
}));

// Middleware para agregar cabeceras CORP a archivos estáticos
app.use('/uploads', (req, res, next) => {
  // Agregar cabeceras para permitir el acceso cross-origin
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar solicitudes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
}, express.static(path.join(__dirname, '../uploads')));

// Otros middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // Importante!
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas API
app.use('/api/equipos', equipoRoutes);
app.use('/api/participantes', participanteRoutes);
app.use('/api/partidos', partidoRoutes);
app.use('/api/consultas', consultaRoutes);

// Inicializar base de datos y servidor
const PORT = process.env.PORT || 5000;
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
    console.log(`Archivos estáticos servidos desde: ${path.join(__dirname, '../uploads')}`);
  });
}).catch(error => {
  console.error('Error al inicializar la base de datos:', error);
});