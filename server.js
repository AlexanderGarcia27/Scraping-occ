import express from 'express';
import cors from 'cors';
import { scrapeOCC } from './scrape.js';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/search', async (req, res) => {
  const { searchTerm } = req.body;
  if (!searchTerm) {
    return res.status(400).json({ success: false, error: 'Falta el término de búsqueda' });
  }
  try {
    await scrapeOCC(searchTerm);
    res.json({ success: true, message: 'Scraping completado' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Sirve los archivos generados
app.use(express.static('./'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});