# Scraper de OCC - Vercel Deployment

Este es un scraper de vacantes de OCC.com.mx que funciona completamente en Vercel (frontend + backend).

## 🚀 Despliegue en Vercel

### 1. Preparación

1. **Asegúrate de tener todos los archivos**:
   - `server.js` - Servidor principal (backend + frontend)
   - `scrape.js` - Lógica del scraper
   - `package.json` - Dependencias
   - `vercel.json` - Configuración de Vercel
   - `web-interface/` - Archivos del frontend

### 2. Despliegue

#### Opción A: Usando Vercel CLI
```bash
# Login a Vercel
vercel login

# Desplegar
vercel

# Para producción
vercel --prod
```

#### Opción B: Usando GitHub
1. Sube tu código a GitHub
2. Ve a [vercel.com](https://vercel.com)
3. Conecta tu repositorio de GitHub
4. Vercel detectará automáticamente la configuración

### 3. URLs

Una vez desplegado, tendrás acceso a:
- **Frontend**: `https://tu-app.vercel.app/` o `https://tu-app.vercel.app/index.html`
- **Vacantes**: `https://tu-app.vercel.app/vacantes.html`
- **API**: `https://tu-app.vercel.app/search` (POST)

### 4. Endpoints

- `GET /` - Información del API
- `GET /status` - Estado del servidor
- `POST /search` - Buscar vacantes
- `GET /index.html` - Interfaz principal
- `GET /vacantes.html` - Vista de vacantes
- `GET /resultados.json` - Descargar JSON
- `GET /resultados.csv` - Descargar CSV
- `GET /resultados.xlsx` - Descargar Excel
- `GET /resultados.pdf` - Descargar PDF

### 5. Uso del API

```javascript
// Ejemplo de uso
const response = await fetch('https://tu-app.vercel.app/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    searchTerm: 'desarrollador'
  })
});

const data = await response.json();
console.log(data);
```

## 🔧 Configuración

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "/search",
      "dest": "/server.js"
    },
    {
      "src": "/status",
      "dest": "/server.js"
    },
    {
      "src": "/resultados.json",
      "dest": "/server.js"
    },
    {
      "src": "/resultados.csv",
      "dest": "/server.js"
    },
    {
      "src": "/resultados.xlsx",
      "dest": "/server.js"
    },
    {
      "src": "/resultados.pdf",
      "dest": "/server.js"
    },
    {
      "src": "/index.html",
      "dest": "/server.js"
    },
    {
      "src": "/vacantes.html",
      "dest": "/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ],
  "functions": {
    "server.js": {
      "maxDuration": 300
    }
  }
}
```

## 📝 Notas

- **Todo en Vercel**: Frontend y backend están en la misma URL
- **Mejor rendimiento**: Vercel tiene mejor soporte para Puppeteer
- **Tiempo límite**: 300 segundos máximo por request
- **Archivos temporales**: Los archivos generados se guardan temporalmente
- **Escalabilidad**: Vercel maneja automáticamente la escalabilidad

## 🐛 Solución de Problemas

### Error de Puppeteer
Si ves errores de Puppeteer:
1. Verifica que `puppeteer` esté en las dependencias
2. Revisa los logs en Vercel Dashboard
3. Asegúrate de que la configuración en `scrape.js` sea correcta

### Timeout
Si el scraping toma más de 300 segundos:
1. Reduce el número de páginas a scrapear
2. Optimiza el código para ser más rápido
3. Considera usar un servicio de background jobs

### Archivos no encontrados
Si los archivos generados no se encuentran:
1. Verifica que el scraping se completó correctamente
2. Revisa los logs en Vercel Dashboard
3. Asegúrate de que las rutas estén configuradas correctamente

## 🎯 Ventajas de Vercel

- **Despliegue automático**: Cada push a GitHub se despliega automáticamente
- **CDN global**: Contenido servido desde múltiples ubicaciones
- **SSL automático**: Certificados HTTPS incluidos
- **Monitoreo**: Logs y métricas incluidos
- **Escalabilidad**: Manejo automático de tráfico
