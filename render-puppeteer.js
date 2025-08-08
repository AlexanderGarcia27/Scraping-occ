import puppeteer from 'puppeteer';

// Configuración específica para Render
export async function launchPuppeteerInRender() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (!isProduction) {
    // En desarrollo, usar configuración normal
    return await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });
  }

  // En producción (Render), intentar múltiples estrategias
  const strategies = [
    // Estrategia 1: Chrome instalado
    async () => {
      console.log('Estrategia 1: Intentando con Chrome instalado...');
      return await puppeteer.launch({
        headless: true,
        executablePath: '/usr/bin/google-chrome-stable',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
          '--single-process'
        ]
      });
    },
    
    // Estrategia 2: Chrome con ruta alternativa
    async () => {
      console.log('Estrategia 2: Intentando con ruta alternativa...');
      return await puppeteer.launch({
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome-stable',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ]
      });
    },
    
    // Estrategia 3: Chrome incluido con Puppeteer
    async () => {
      console.log('Estrategia 3: Intentando con Chrome incluido...');
      return await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      });
    },
    
    // Estrategia 4: Configuración mínima
    async () => {
      console.log('Estrategia 4: Intentando con configuración mínima...');
      return await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
  ];

  // Probar cada estrategia
  for (let i = 0; i < strategies.length; i++) {
    try {
      const browser = await strategies[i]();
      console.log(`✅ Estrategia ${i + 1} exitosa`);
      return browser;
    } catch (error) {
      console.error(`❌ Estrategia ${i + 1} falló:`, error.message);
      if (i === strategies.length - 1) {
        throw new Error(`Todas las estrategias fallaron. Último error: ${error.message}`);
      }
    }
  }
}
