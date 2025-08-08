# Frontend - Scraper de OCC

Este es el frontend del scraper de OCC.com.mx que se despliega en Vercel.

## 🚀 Despliegue en Vercel

### 1. Preparación

1. **Asegúrate de tener todos los archivos**:
   - `index.html` - Página principal
   - `vacantes.html` - Vista de vacantes
   - `vercel.json` - Configuración de Vercel

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
- **Frontend**: `https://tu-app.vercel.app/`
- **Vacantes**: `https://tu-app.vercel.app/vacantes`

### 4. Configuración

#### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "**/*",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/",
      "dest": "/index.html"
    },
    {
      "src": "/vacantes",
      "dest": "/vacantes.html"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

## 🔗 Conexión con Backend

El frontend se conecta al backend en Render.com. Asegúrate de:

1. **Configurar la URL del backend** en `index.html` y `vacantes.html`:
   ```javascript
   const BACKEND_URL = 'https://scraping-occ.onrender.com';
   ```

2. **Verificar que el backend esté funcionando**:
   - URL: `https://scraping-occ.onrender.com`
   - Endpoint de estado: `https://scraping-occ.onrender.com/status`

## 📝 Notas

- **Frontend estático**: No requiere build ni dependencias
- **CDN global**: Contenido servido desde múltiples ubicaciones
- **SSL automático**: Certificados HTTPS incluidos
- **Escalabilidad**: Manejo automático de tráfico

## 🐛 Solución de Problemas

### Error de conexión con backend
1. Verifica que la URL del backend esté correcta
2. Asegúrate de que el backend esté funcionando
3. Revisa los logs en Vercel Dashboard

### Archivos no encontrados
1. Verifica que las rutas estén configuradas correctamente
2. Asegúrate de que los archivos estén en la carpeta correcta
3. Revisa la configuración en vercel.json
