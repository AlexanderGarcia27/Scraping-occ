import puppeteer from 'puppeteer';

// Configuración de Puppeteer para diferentes entornos
export function getPuppeteerConfig() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const baseArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--single-process',
    '--disable-gpu',
    '--disable-blink-features=AutomationControlled',
    '--disable-web-security',
    '--disable-features=VizDisplayCompositor',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--disable-field-trial-config',
    '--disable-ipc-flooding-protection'
  ];

  if (isProduction) {
    return {
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome-stable',
      args: baseArgs,
      defaultViewport: null
    };
  } else {
    return {
      headless: true,
      args: baseArgs,
      defaultViewport: null
    };
  }
}

export async function launchBrowser() {
  const config = getPuppeteerConfig();
  const isProduction = process.env.NODE_ENV === 'production';
  
  try {
    return await puppeteer.launch(config);
  } catch (error) {
    console.error('Error al lanzar Puppeteer con configuración principal:', error);
    
    if (isProduction) {
      // Intentar con configuración alternativa para producción
      console.log('Intentando con configuración alternativa para producción...');
      try {
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
      } catch (secondError) {
        console.log('Intentando con Chrome incluido con Puppeteer...');
        try {
          return await puppeteer.launch({
            headless: true,
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-gpu'
            ]
          });
        } catch (thirdError) {
          throw new Error(`No se pudo iniciar el navegador en producción. Error: ${thirdError.message}`);
        }
      }
    } else {
      // Configuración alternativa para local
      console.log('Intentando con configuración alternativa para local...');
      try {
        return await puppeteer.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
          ]
        });
      } catch (secondError) {
        throw new Error(`No se pudo iniciar el navegador. Asegúrate de tener Chrome instalado o ejecuta: npx puppeteer browsers install chrome. Error: ${secondError.message}`);
      }
    }
  }
}
