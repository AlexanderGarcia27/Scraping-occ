#!/bin/bash

# Script de instalación de Chrome para Render
echo "🚀 Iniciando instalación de Chrome..."

# Actualizar el sistema
echo "📦 Actualizando el sistema..."
apt-get update

# Instalar dependencias necesarias
echo "🔧 Instalando dependencias..."
apt-get install -y wget gnupg ca-certificates procps libxss1

# Agregar la clave de Google Chrome
echo "🔑 Agregando clave de Google Chrome..."
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -

# Agregar el repositorio de Chrome
echo "📋 Agregando repositorio de Chrome..."
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list

# Actualizar e instalar Chrome
echo "⬇️ Instalando Google Chrome..."
apt-get update
apt-get install -y google-chrome-stable

# Verificar que Chrome se instaló correctamente
echo "✅ Verificando instalación de Chrome..."
google-chrome-stable --version

# Crear enlaces simbólicos si es necesario
echo "🔗 Creando enlaces simbólicos..."
ln -sf /usr/bin/google-chrome-stable /usr/bin/chromium-browser
ln -sf /usr/bin/google-chrome-stable /usr/bin/chrome

echo "🎉 Instalación de Chrome completada!"
