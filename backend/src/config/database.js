const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE
});

// Función para crear la base de datos si no existe
const createDatabase = async () => {
  const adminPool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: 'postgres'
  });

  try {
    const res = await adminPool.query(
      `SELECT 1 FROM pg_database WHERE datname = '${process.env.DB_DATABASE}'`
    );
    
    if (res.rows.length === 0) {
      await adminPool.query(`CREATE DATABASE ${process.env.DB_DATABASE}`);
      console.log('Base de datos creada exitosamente');
    }
  } catch (error) {
    console.error('Error al crear la base de datos:', error);
  } finally {
    await adminPool.end();
  }
};

// Función para crear las tablas
const createTables = async () => {
  const queries = `
    -- Tabla de equipos
    CREATE TABLE IF NOT EXISTS equipos (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(100) UNIQUE NOT NULL,
      logo TEXT,
      color_principal VARCHAR(50),
      color_secundario VARCHAR(50),
      fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabla de posiciones (datos precargados)
    CREATE TABLE IF NOT EXISTS posiciones (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(50) UNIQUE NOT NULL,
      descripcion VARCHAR(200)
    );

    -- Tabla de participantes
    CREATE TABLE IF NOT EXISTS participantes (
      id SERIAL PRIMARY KEY,
      equipo_id INTEGER REFERENCES equipos(id) ON DELETE CASCADE,
      nombre VARCHAR(100) NOT NULL,
      apellido_paterno VARCHAR(100) NOT NULL,
      apellido_materno VARCHAR(100) NOT NULL,
      apodo VARCHAR(100),
      fecha_nacimiento DATE NOT NULL,
      posicion_id INTEGER REFERENCES posiciones(id),
      numero_camiseta INTEGER,
      peso DECIMAL(5,2),
      estatura DECIMAL(5,2),
      foto TEXT,
      fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabla de partidos
    CREATE TABLE IF NOT EXISTS partidos (
      id SERIAL PRIMARY KEY,
      equipo_local_id INTEGER REFERENCES equipos(id),
      equipo_visitante_id INTEGER REFERENCES equipos(id),
      fecha DATE NOT NULL,
      hora TIME NOT NULL,
      goles_local INTEGER DEFAULT 0,
      goles_visitante INTEGER DEFAULT 0,
      estado VARCHAR(20) DEFAULT 'programado'
    );

    -- Tabla de eventos del partido
    CREATE TABLE IF NOT EXISTS eventos_partido (
      id SERIAL PRIMARY KEY,
      partido_id INTEGER REFERENCES partidos(id) ON DELETE CASCADE,
      participante_id INTEGER REFERENCES participantes(id),
      tipo_evento VARCHAR(50) CHECK (tipo_evento IN ('gol', 'amonestacion', 'penalizacion', 'sustitucion')),
      minuto INTEGER,
      descripcion TEXT
    );

    -- Insertar posiciones por defecto
    INSERT INTO posiciones (nombre, descripcion) VALUES
      ('Portero', 'Guarda la portería'),
      ('Defensa Central', 'Defensa central'),
      ('Lateral Izquierdo', 'Defensa por izquierda'),
      ('Lateral Derecho', 'Defensa por derecha'),
      ('Medio Centro', 'Mediocampista central'),
      ('Medio Izquierdo', 'Mediocampista por izquierda'),
      ('Medio Derecho', 'Mediocampista por derecha'),
      ('Delantero Centro', 'Delantero principal'),
      ('Extremo Izquierdo', 'Delantero por izquierda'),
      ('Extremo Derecho', 'Delantero por derecha')
    ON CONFLICT (nombre) DO NOTHING;
  `;

  try {
    await pool.query(queries);
    console.log('Tablas creadas exitosamente');
  } catch (error) {
    console.error('Error al crear tablas:', error);
  }
};

// Inicializar base de datos
const initDatabase = async () => {
  await createDatabase();
  await createTables();
};

module.exports = { pool, initDatabase };