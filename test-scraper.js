import { scrapeOCC } from './scrape.js';

async function testScraper() {
  try {
    console.log('🧪 Iniciando prueba del scraper...');
    
    // Prueba con el término específico que mencionaste
    const searchTerm = 'autismo';
    console.log(`🔍 Probando búsqueda: "${searchTerm}"`);
    
    const results = await scrapeOCC(searchTerm);
    
    console.log(`✅ Prueba completada. Se encontraron ${results.length} resultados`);
    
    if (results.length > 0) {
      console.log('\n📊 Primeros 5 resultados:');
      results.slice(0, 5).forEach((job, index) => {
        console.log(`\n${index + 1}. ${job.nombreVacante}`);
        console.log(`   Empresa: ${job.empresa}`);
        console.log(`   Ubicación: ${job.ubicacion}`);
        console.log(`   Sueldo: ${job.sueldo}`);
        console.log(`   Verificada: ${job.verificada ? 'Sí' : 'No'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

// Ejecutar la prueba
testScraper();
