import puppeteer from 'puppeteer';
import readline from 'readline';
import fs from 'fs';
import { Parser as Json2csvParser } from 'json2csv';
import XLSX from 'xlsx';
import PDFDocument from 'pdfkit';
import { execSync } from 'child_process';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

const OCC_URL = 'https://www.occ.com.mx/';

// Función para verificar si Chrome está disponible en una ruta
function checkChromePath(path) {
  try {
    execSync(`${path} --version`, { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

// Función para encontrar Chrome en el sistema
function findChrome() {
  const possiblePaths = [
    '/usr/bin/chromium-browser',  // Primera opción: Chromium
    '/usr/bin/google-chrome-stable', // Segunda opción: Chrome
    '/usr/bin/chrome',
    '/usr/bin/google-chrome',
    '/snap/bin/chromium',
    '/usr/bin/chromium'
  ];
  
  for (const path of possiblePaths) {
    if (checkChromePath(path)) {
      console.log(`✅ Navegador encontrado en: ${path}`);
      return path;
    }
  }
  
  return null;
}

export async function scrapeOCC(searchTerm) {
  let browser;
  
  // Configuración base para Puppeteer
  const baseArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--no-first-run',
    '--no-zygote',
    '--single-process',
    '--disable-blink-features=AutomationControlled'
  ];

  try {
    console.log('🚀 Iniciando Puppeteer...');
    console.log('📊 Variables de entorno:');
    console.log('- PUPPETEER_EXECUTABLE_PATH:', process.env.PUPPETEER_EXECUTABLE_PATH);
    console.log('- CHROME_BIN:', process.env.CHROME_BIN);
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    
    // Estrategia 1: Intentar con navegador instalado en Render
    if (process.env.NODE_ENV === 'production') {
      const chromePath = findChrome();
      
      if (chromePath) {
        try {
          console.log(`🔧 Intentando con navegador instalado en: ${chromePath}`);
          browser = await puppeteer.launch({
            headless: true,
            executablePath: chromePath,
            args: baseArgs
          });
          console.log('✅ Puppeteer iniciado con navegador instalado');
        } catch (chromeError) {
          console.log('⚠️ Navegador instalado no funcionó, intentando con Chrome incluido...');
          browser = await puppeteer.launch({
            headless: true,
            args: baseArgs
          });
          console.log('✅ Puppeteer iniciado con Chrome incluido');
        }
      } else {
        console.log('⚠️ Navegador no encontrado, usando Chrome incluido con Puppeteer...');
        browser = await puppeteer.launch({
          headless: true,
          args: baseArgs
        });
        console.log('✅ Puppeteer iniciado con Chrome incluido');
      }
    } else {
      // Estrategia 2: Usar Chrome incluido con Puppeteer
      browser = await puppeteer.launch({
        headless: true,
        args: baseArgs
      });
      console.log('✅ Puppeteer iniciado con Chrome incluido');
    }
    
  } catch (error) {
    console.error('❌ Error al lanzar Puppeteer:', error);
    
    // Estrategia 3: Intentar con configuración alternativa
    try {
      console.log('🔄 Intentando con configuración alternativa...');
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run'
        ]
      });
      console.log('✅ Puppeteer iniciado con configuración alternativa');
    } catch (secondError) {
      console.error('❌ Error con configuración alternativa:', secondError);
      
      // Estrategia 4: Último intento con configuración mínima
      try {
        console.log('🔄 Intentando con configuración mínima...');
        browser = await puppeteer.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
          ]
        });
        console.log('✅ Puppeteer iniciado con configuración mínima');
      } catch (thirdError) {
        throw new Error(`❌ No se pudo iniciar el navegador después de 4 intentos. Último error: ${thirdError.message}`);
      }
    }
  }

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  await page.goto(OCC_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#prof-cat-search-input-desktop', { timeout: 15000 });
  await page.type('#prof-cat-search-input-desktop', searchTerm);
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForSelector('div[id^="jobcard-"]', { timeout: 15000 })
  ]);

  let results = [];
  let hasNextPage = true;
  let pageNum = 1;

  while (hasNextPage) {
    try {
      await page.waitForSelector('div[id^="jobcard-"]', { timeout: 15000 });
      const jobCards = await page.$$('div[id^="jobcard-"]');

      for (let i = 0; i < jobCards.length; i++) {
        const card = jobCards[i];
        let nombreVacante = '';
        let empresa = '';
        let ubicacion = '';
        let sueldo = '';
        let panelData = { sobreEmpleo: {}, detalles: {}, descripcion: '', verificada: false };

        try {
          nombreVacante = await card.$eval('h2', el => el.textContent.trim());
        } catch { }

        try {
          empresa = await card.$eval('span.text-grey-900.no-underline', el => el.textContent.trim());
        } catch { }

        try {
          ubicacion = await card.$$eval('.no-alter-loc-text span', spans =>
            spans.map(s => s.textContent.trim()).filter(Boolean).join(', ')
          );
        } catch { }

        try {
          sueldo = await card.$eval('span.mr-2.text-grey-900', el => el.textContent.trim());
        } catch { }

        try {
          const box = await card.boundingBox();
          if (box) {
            let beforeTitle = await page.evaluate(() => {
              const el = document.querySelector('p.font-h4-m, h1, h2');
              return el ? el.innerText.trim() : null;
            });

            await card.click();
            await new Promise(res => setTimeout(res, 500));

            let afterTitle = beforeTitle;
            let retries = 0;
            while (afterTitle === beforeTitle && retries < 10) {
              await new Promise(res => setTimeout(res, 200));
              afterTitle = await page.evaluate(() => {
                const el = document.querySelector('p.font-h4-m, h1, h2');
                return el ? el.innerText.trim() : null;
              });
              retries++;
            }

            panelData = await page.evaluate(() => {
              let sobreEmpleo = {};
              const sobreEmpleoDivs = document.querySelectorAll('.flex.flex-col.gap-4 > div, .flex.flex-col.gap-2 > div');
              sobreEmpleoDivs.forEach(div => {
                const label = div.querySelector('span.text-base')?.innerText.trim();
                const valor = div.querySelector('.text-base.font-light')?.innerText.trim();
                if (label && valor) sobreEmpleo[label.replace(':', '')] = valor;
              });

              let detalles = {};
              const detallesDivs = document.querySelectorAll('[class*="[&>div]:flex"] > div');
              detallesDivs.forEach(div => {
                const p = div.querySelector('p');
                const valorEl = div.querySelector('a.font-light, span.font-light');
                if (p && valorEl) detalles[p.innerText.replace(':', '').trim()] = valorEl.innerText.trim();
              });

              let descripcion = '';
              const descDiv = document.querySelector('.break-words > div');
              if (descDiv) {
                descripcion = descDiv.innerText.trim();
              }

              const verificada = !!Array.from(document.querySelectorAll('a')).find(a => a.textContent.trim() === 'Empresa verificada');

              return { sobreEmpleo, detalles, descripcion, verificada };
            });

            await page.keyboard.press('Escape');
            await new Promise(res => setTimeout(res, 500));
          } else {
            console.log(`⚠️ Vacante ${i + 1} no es clickeable (boundingBox vacío).`);
            continue;
          }
        } catch (error) {
          console.log(`❌ Error al procesar vacante ${i + 1}: ${error.message}`);
          continue;
        }

        results.push({
          nombreVacante,
          empresa,
          ubicacion,
          sueldo,
          verificada: panelData.verificada,
          sobreElEmpleo: {
            ...panelData.sobreEmpleo,
            Categoria: panelData.sobreEmpleo['Categoría'] || '',
            Subcategoria: panelData.sobreEmpleo['Subcategoría'] || '',
            'Educación mínima requerida': panelData.sobreEmpleo['Educación mínima requerida'] || ''
          },
          detalles: panelData.detalles,
          descripcion: panelData.descripcion
        });
      }

      const nextPageLi = await page.$('li[tabindex="0"]:last-child');
      if (nextPageLi) {
        const isDisabled = await page.evaluate(el =>
          el.getAttribute('aria-disabled') === 'true' ||
          el.classList.contains('pointer-events-none'), nextPageLi);

        if (!isDisabled) {
          try {
            await nextPageLi.click();
            await page.waitForSelector('div[id^="jobcard-"]', { timeout: 15000 });
            await new Promise(res => setTimeout(res, 1000));
            pageNum++;
          } catch (e) {
            console.log(`❌ Error al hacer clic en siguiente página: ${e.message}`);
            hasNextPage = false;
          }
        } else {
          console.log('✅ Última página alcanzada.');
          hasNextPage = false;
        }
      } else {
        console.log('❌ No se encontró botón de siguiente.');
        hasNextPage = false;
      }

    } catch (err) {
      console.log(`⚠️ Error general en la página ${pageNum}: ${err.message}`);
      break;
    }
  }

  await browser.close();

  // Guardar archivos
  fs.writeFileSync('resultados.json', JSON.stringify(results, null, 2), 'utf-8');
  console.log(`✅ Se guardaron ${results.length} resultados en resultados.json`);

  const datosPlano = results.map(result => ({
    nombreVacante: result.nombreVacante,
    empresa: result.empresa || 'La empresa es confidencial o no se encuentra disponible',
    ubicacion: result.ubicacion,
    sueldo: result.sueldo,
    verificada: result.verificada,
    categoria: result.sobreElEmpleo.Categoria || '',
    subcategoria: result.sobreElEmpleo.Subcategoria || '',
    educacionMinima: result.sobreElEmpleo['Educación mínima requerida'] || '',
    contratacion: result.detalles['Contratación'] || '',
    horario: result.detalles['Horario'] || '',
    espacioDeTrabajo: result.detalles['Espacio de trabajo'] || '',
    descripcion: result.descripcion,
  }));

  // CSV
  if (datosPlano.length > 0) {
    const json2csvParser = new Json2csvParser({ fields: Object.keys(datosPlano[0]) });
    const csv = json2csvParser.parse(datosPlano);
    fs.writeFileSync('resultados.csv', csv, 'utf-8');
    console.log('✅ Se guardó el archivo CSV: resultados.csv');
  }

  // Excel
  if (datosPlano.length > 0) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(datosPlano);
    XLSX.utils.book_append_sheet(wb, ws, 'Vacantes');
    XLSX.writeFile(wb, 'resultados.xlsx');
    console.log('✅ Se guardó el archivo Excel: resultados.xlsx');
  }

  // PDF
  if (datosPlano.length > 0) {
    try {
      const doc = new PDFDocument({ margin: 30, size: 'A4' });
      const pdfStream = fs.createWriteStream('resultados.pdf');
      doc.pipe(pdfStream);

      doc.fontSize(18).text(`Resultados de Búsqueda: ${searchTerm}`, { align: 'center', underline: true });
      doc.moveDown(1);
      doc.fontSize(12).text(`Total de vacantes encontradas: ${datosPlano.length}`);
      doc.moveDown(1);

      datosPlano.forEach((item, i) => {
        doc.fontSize(14).text(`Vacante ${i + 1}`, { underline: true });
        doc.fontSize(12).text(`Título: ${item.nombreVacante}`);
        doc.text(`Empresa: ${item.empresa}`);
        doc.text(`Ubicación: ${item.ubicacion}`);
        doc.text(`Sueldo: ${item.sueldo}`);
        doc.text(`Categoría: ${item.categoria}`);
        doc.text(`Verificada: ${item.verificada ? 'Sí' : 'No'}`);
        doc.text(`Educación mínima: ${item.educacionMinima}`);
        doc.text(`Contratación: ${item.contratacion}`);
        doc.text(`Horario: ${item.horario}`);
        doc.text(`Espacio de trabajo: ${item.espacioDeTrabajo}`);
        doc.moveDown(0.5);
        doc.fontSize(11).text('Descripción:', { underline: true });
        doc.fontSize(10).text(item.descripcion || 'Sin descripción');
        doc.moveDown(1);
        doc.text('----------------------------------------');
        doc.moveDown(1);
      });

      doc.end();
      pdfStream.on('finish', () => {
        console.log('✅ Se guardó el archivo PDF: resultados.pdf');
      });
    } catch (error) {
      console.error('❌ Error al generar PDF:', error.message);
    }
  }

  return results;
}

async function main() {
  const searchTerm = await askQuestion('¿Qué deseas buscar? ');
  rl.close();
  if (!searchTerm.trim()) {
    console.error('❌ No ingresaste ningún término de búsqueda.');
    process.exit(1);
  }
  const results = await scrapeOCC(searchTerm.trim());
  if (results.length === 0) {
    console.warn('⚠ No se encontraron vacantes o algo salió mal.');
  }
}

// main();
