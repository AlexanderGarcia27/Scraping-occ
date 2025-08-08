#!/bin/bash

echo "🚀 Iniciando instalación de Chrome para Render..."

# Actualizar el sistema
apt-get update

# Instalar dependencias necesarias
apt-get install -y wget gnupg ca-certificates procps libxss1

# Instalar Chromium (más confiable que Chrome)
echo "📦 Instalando Chromium..."
apt-get install -y chromium-browser

# También intentar instalar Chrome como respaldo
echo "📦 Instalando Google Chrome..."
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list
apt-get update
apt-get install -y google-chrome-stable

# Verificar que los navegadores se instalaron correctamente
echo "=== Verificando Chromium ==="
chromium-browser --version || echo "Chromium no encontrado"

echo "=== Verificando Chrome ==="
google-chrome-stable --version || echo "Chrome no encontrado"

# Crear enlaces simbólicos
echo "🔗 Creando enlaces simbólicos..."
ln -sf /usr/bin/chromium-browser /usr/bin/chrome
ln -sf /usr/bin/google-chrome-stable /usr/bin/google-chrome

# Verificar que los enlaces funcionan
echo "=== Verificando enlaces ==="
ls -la /usr/bin/chromium*
ls -la /usr/bin/google-chrome*
ls -la /usr/bin/chrome

# Verificar que están en el PATH
echo "=== Verificando PATH ==="
which chromium-browser || echo "chromium-browser no en PATH"
which google-chrome-stable || echo "google-chrome-stable no en PATH"
which chrome || echo "chrome no en PATH"

echo "✅ Instalación de Chrome completada"
