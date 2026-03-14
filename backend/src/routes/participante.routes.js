const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegurar que el directorio existe
const participanteDir = 'uploads/participantes';
if (!fs.existsSync(participanteDir)) {
  fs.mkdirSync(participanteDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, participanteDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único con timestamp y extensión original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Límite de 5MB
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos JPG y PNG'));
    }
  }
});

// Obtener todas las posiciones
router.get('/posiciones', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM posiciones ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear participante
router.post('/', upload.single('foto'), async (req, res) => {
  try {
    const {
      equipo_id, nombre, apellido_paterno, apellido_materno,
      apodo, fecha_nacimiento, posicion_id, numero_camiseta,
      peso, estatura
    } = req.body;

    const foto = req.file ? req.file.path : null;

    const result = await pool.query(
      `INSERT INTO participantes 
       (equipo_id, nombre, apellido_paterno, apellido_materno, apodo, 
        fecha_nacimiento, posicion_id, numero_camiseta, peso, estatura, foto) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING *`,
      [equipo_id, nombre, apellido_paterno, apellido_materno, apodo,
       fecha_nacimiento, posicion_id, numero_camiseta, peso, estatura, foto]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener participantes por equipo
router.get('/equipo/:equipo_id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, pos.nombre as posicion_nombre 
       FROM participantes p
       LEFT JOIN posiciones pos ON p.posicion_id = pos.id
       WHERE p.equipo_id = $1 
       ORDER BY p.apellido_paterno, p.apellido_materno`,
      [req.params.equipo_id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar participante
router.put('/:id', upload.single('foto'), async (req, res) => {
  try {
    const {
      nombre, apellido_paterno, apellido_materno, apodo,
      fecha_nacimiento, posicion_id, numero_camiseta,
      peso, estatura
    } = req.body;

    let query = `UPDATE participantes SET 
      nombre = $1, apellido_paterno = $2, apellido_materno = $3,
      apodo = $4, fecha_nacimiento = $5, posicion_id = $6,
      numero_camiseta = $7, peso = $8, estatura = $9`;

    const params = [nombre, apellido_paterno, apellido_materno, apodo,
                    fecha_nacimiento, posicion_id, numero_camiseta, peso, estatura];

    if (req.file) {
      query += ', foto = $10 WHERE id = $11 RETURNING *';
      params.push(req.file.path, req.params.id);
    } else {
      query += ' WHERE id = $10 RETURNING *';
      params.push(req.params.id);
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Participante no encontrado' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;