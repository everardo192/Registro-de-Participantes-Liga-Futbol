const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Consulta a: Equipos y horarios por fecha
router.get('/horarios-por-fecha', async (req, res) => {
  try {
    const { fecha } = req.query;

    const result = await pool.query(
      `SELECT p.id, p.fecha, p.hora, p.estado,
              el.nombre as equipo_local, ev.nombre as equipo_visitante,
              p.goles_local, p.goles_visitante
       FROM partidos p
       JOIN equipos el ON p.equipo_local_id = el.id
       JOIN equipos ev ON p.equipo_visitante_id = ev.id
       WHERE p.fecha = $1
       ORDER BY p.hora`,
      [fecha]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Consulta b: Resultados de partido específico con eventos
router.get('/resultado-partido/:partido_id', async (req, res) => {
  try {
    // Información del partido
    const partidoResult = await pool.query(
      `SELECT p.*, 
              el.nombre as equipo_local_nombre, el.logo as equipo_local_logo,
              ev.nombre as equipo_visitante_nombre, ev.logo as equipo_visitante_logo
       FROM partidos p
       JOIN equipos el ON p.equipo_local_id = el.id
       JOIN equipos ev ON p.equipo_visitante_id = ev.id
       WHERE p.id = $1`,
      [req.params.partido_id]
    );

    if (partidoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Partido no encontrado' });
    }

    // Eventos del partido
    const eventosResult = await pool.query(
      `SELECT e.*, 
              pa.nombre, pa.apellido_paterno, pa.apellido_materno,
              pos.nombre as posicion
       FROM eventos_partido e
       JOIN participantes pa ON e.participante_id = pa.id
       JOIN posiciones pos ON pa.posicion_id = pos.id
       WHERE e.partido_id = $1
       ORDER BY e.minuto`,
      [req.params.partido_id]
    );

    res.json({
      partido: partidoResult.rows[0],
      eventos: eventosResult.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Consulta c: Participantes de un equipo con fotos
router.get('/participantes-equipo/:equipo_id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, pos.nombre as posicion_nombre,
              e.nombre as equipo_nombre, e.logo as equipo_logo
       FROM participantes p
       JOIN posiciones pos ON p.posicion_id = pos.id
       JOIN equipos e ON p.equipo_id = e.id
       WHERE p.equipo_id = $1
       ORDER BY p.apellido_paterno, p.apellido_materno`,
      [req.params.equipo_id]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener fechas disponibles
router.get('/fechas-disponibles', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT fecha FROM partidos ORDER BY fecha'
    );
    res.json(result.rows.map(row => row.fecha));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;