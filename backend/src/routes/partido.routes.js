const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Crear partido
router.post('/', async (req, res) => {
  try {
    const { equipo_local_id, equipo_visitante_id, fecha, hora } = req.body;

    const result = await pool.query(
      'INSERT INTO partidos (equipo_local_id, equipo_visitante_id, fecha, hora) VALUES ($1, $2, $3, $4) RETURNING *',
      [equipo_local_id, equipo_visitante_id, fecha, hora]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar resultado del partido
router.put('/:id/resultado', async (req, res) => {
  try {
    const { goles_local, goles_visitante, estado } = req.body;

    const result = await pool.query(
      'UPDATE partidos SET goles_local = $1, goles_visitante = $2, estado = $3 WHERE id = $4 RETURNING *',
      [goles_local, goles_visitante, estado, req.params.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Partido no encontrado' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Agregar evento al partido
router.post('/:id/eventos', async (req, res) => {
  try {
    const { participante_id, tipo_evento, minuto, descripcion } = req.body;

    const result = await pool.query(
      'INSERT INTO eventos_partido (partido_id, participante_id, tipo_evento, minuto, descripcion) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.params.id, participante_id, tipo_evento, minuto, descripcion]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;