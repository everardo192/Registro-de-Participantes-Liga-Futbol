const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegurar que el directorio existe
const equipoDir = 'uploads/equipos';
if (!fs.existsSync(equipoDir)) {
  fs.mkdirSync(equipoDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, equipoDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
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

// Crear equipo
router.post('/', upload.single('logo'), async (req, res) => {
  try {
    const { nombre, color_principal, color_secundario } = req.body;
    const logo = req.file ? req.file.path : null;

    const result = await pool.query(
      'INSERT INTO equipos (nombre, logo, color_principal, color_secundario) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, logo, color_principal, color_secundario]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      res.status(400).json({ error: 'El nombre del equipo ya existe' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Obtener todos los equipos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM equipos ORDER BY nombre');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener equipo por ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM equipos WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Equipo no encontrado' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar equipo
router.put('/:id', upload.single('logo'), async (req, res) => {
  try {
    const { nombre, color_principal, color_secundario } = req.body;
    const logo = req.file ? req.file.path : null;

    let query = 'UPDATE equipos SET nombre = $1, color_principal = $2, color_secundario = $3';
    const params = [nombre, color_principal, color_secundario];

    if (logo) {
      query += ', logo = $4 WHERE id = $5 RETURNING *';
      params.push(logo, req.params.id);
    } else {
      query += ' WHERE id = $4 RETURNING *';
      params.push(req.params.id);
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Equipo no encontrado' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;