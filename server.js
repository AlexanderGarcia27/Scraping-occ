import express from 'express';
import cors from 'cors';
import { scrapeOCC } from './scrape.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint principal
app.get('/', (req, res) => {
  res.json({ 
    message: 'Scraper de OCC funcionando en Render',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      search: 'POST /search',
      status: 'GET /status',
      resultados: 'GET /resultados.json'
    }
  });
});

// Endpoint de estado
app.get('/status', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Endpoint para buscar
app.post('/search', async (req, res) => {
  const { searchTerm } = req.body;
  
  if (!searchTerm) {
    return res.status(400).json({ 
      success: false, 
      error: 'Falta el término de búsqueda' 
    });
  }

  try {
    console.log(`Iniciando búsqueda para: ${searchTerm}`);
    const results = await scrapeOCC(searchTerm);
    
    res.json({ 
      success: true, 
      message: `Scraping completado. Se encontraron ${results.length} vacantes`,
      count: results.length
    });
  } catch (error) {
    console.error('Error en el scraping:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Servir archivos generados
app.get('/resultados.json', (req, res) => {
  const filePath = path.join(__dirname, 'resultados.json');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'No hay resultados.json' });
  }
});

app.get('/resultados.csv', (req, res) => {
  const filePath = path.join(__dirname, 'resultados.csv');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=resultados.csv');
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'No hay resultados.csv' });
  }
});

app.get('/resultados.xlsx', (req, res) => {
  const filePath = path.join(__dirname, 'resultados.xlsx');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=resultados.xlsx');
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'No hay resultados.xlsx' });
  }
});

app.get('/resultados.pdf', (req, res) => {
  const filePath = path.join(__dirname, 'resultados.pdf');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=resultados.pdf');
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'No hay resultados.pdf' });
  }
});

// Manejo de errores global
app.use((error, req, res, next) => {
  console.error('Error no manejado:', error);
  res.status(500).json({ 
    success: false, 
    error: 'Error interno del servidor'
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});

export default app;