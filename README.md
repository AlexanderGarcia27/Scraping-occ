# Scraper de OCC - Arquitectura Separada

Este es un scraper de vacantes de OCC.com.mx con una arquitectura separada:
- **Backend**: Render.com (con Puppeteer para scraping real)
- **Frontend**: Vercel.com (interfaz de usuario)

## 🏗️ Arquitectura

### Backend (Render.com)
- **URL**: `https://scraping-occ.onrender.com`
- **Tecnología**: Node.js + Express + Puppeteer
- **Funcionalidad**: Scraping real de OCC.com.mx
- **Archivos**: `server.js`, `scrape.js`, `package.json`, `render.yaml`

### Frontend (Vercel.com)
- **URL**: `https://scraping-occ.vercel.app`
- **Tecnología**: HTML + CSS + JavaScript
- **Funcionalidad**: Interfaz de usuario
- **Archivos**: `web-interface/`

## 🚀 Despliegue

### 1. Backend en Render

#### Preparación
1. **Asegúrate de tener todos los archivos del backend**:
   - `server.js` - Servidor principal
   - `scrape.js` - Lógica del scraper
   - `package.json` - Dependencias
   - `render.yaml` - Configuración de Render

#### Despliegue en Render
1. Ve a [render.com](https://render.com)
2. Conecta tu repositorio de GitHub
3. Crea un nuevo **Web Service**
4. Render detectará automáticamente la configuración
5. Configura las variables de entorno:
   - `NODE_ENV`: `production`
   - `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD`: `true`
   - `PUPPETEER_EXECUTABLE_PATH`: `/usr/bin/google-chrome-stable`
   - `CHROME_BIN`: `/usr/bin/google-chrome-stable`

### 2. Frontend en Vercel

#### Preparación
1. **Asegúrate de tener todos los archivos del frontend**:
   - `web-interface/index.html` - Página principal
   - `web-interface/vacantes.html` - Vista de vacantes
   - `vercel.json` - Configuración de Vercel

#### Despliegue en Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Conecta tu repositorio de GitHub
3. Vercel detectará automáticamente la configuración
4. Configura la variable de entorno:
   - `BACKEND_URL`: `https://scraping-occ.onrender.com`

## 🔧 Configuración

### render.yaml (Backend)
```yaml
services:
  - type: web
    name: scrapin-occ
    env: node
    buildCommand: |
      apt-get update && apt-get install -y wget gnupg ca-certificates
      wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
      echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list
      apt-get update && apt-get install -y google-chrome-stable
      npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PUPPETEER_SKIP_CHROMIUM_DOWNLOAD
        value: "true"
      - key: PUPPETEER_EXECUTABLE_PATH
        value: "/usr/bin/google-chrome-stable"
      - key: CHROME_BIN
        value: "/usr/bin/google-chrome-stable"
```

### vercel.json (Frontend)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "web-interface/**/*",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/",
      "dest": "/web-interface/index.html"
    },
    {
      "src": "/vacantes",
      "dest": "/web-interface/vacantes.html"
    },
    {
      "src": "/(.*)",
      "dest": "/web-interface/$1"
    }
  ]
}
```

## 📝 Endpoints del Backend

- `GET /` - Información del API
- `GET /status` - Estado del servidor
- `POST /search` - Buscar vacantes
- `GET /resultados.json` - Descargar JSON
- `GET /resultados.csv` - Descargar CSV
- `GET /resultados.xlsx` - Descargar Excel
- `GET /resultados.pdf` - Descargar PDF

## 🔄 Flujo de Trabajo

1. **Usuario accede al frontend** en Vercel
2. **Usuario busca vacantes** en la interfaz
3. **Frontend envía request** al backend en Render
4. **Backend ejecuta scraping** con Puppeteer
5. **Backend devuelve resultados** al frontend
6. **Frontend muestra resultados** al usuario

## 🐛 Solución de Problemas

### Backend (Render)
- **Error de Puppeteer**: Verifica que Chrome esté instalado
- **Timeout**: Aumenta el timeout en Render Dashboard
- **Memoria**: Aumenta la memoria en Render Dashboard

### Frontend (Vercel)
- **Error de conexión**: Verifica la URL del backend
- **CORS**: Asegúrate de que el backend permita CORS
- **Archivos no encontrados**: Verifica las rutas en vercel.json

## 🎯 Ventajas de esta Arquitectura

- **Escalabilidad**: Backend y frontend escalan independientemente
- **Rendimiento**: Frontend rápido en Vercel, backend potente en Render
- **Mantenimiento**: Separación clara de responsabilidades
- **Costos**: Optimización de recursos por servicio

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Render Dashboard (backend)
2. Revisa los logs en Vercel Dashboard (frontend)
3. Verifica que las URLs estén correctas
4. Asegúrate de que las variables de entorno estén configuradas
