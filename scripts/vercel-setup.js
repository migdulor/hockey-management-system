#!/usr/bin/env node
/**
 * 🏑 Hockey Management System - Vercel Setup Script
 * 
 * Script para configurar automáticamente el proyecto en Vercel
 */

console.log(`
🏑 Hockey Management System - Vercel Setup
=============================================

Este script te guiará para configurar tu proyecto en Vercel.

📋 Pre-requisitos:
   ✅ Vercel CLI instalado
   ✅ Cuenta de Vercel creada
   ❓ Autenticado en Vercel CLI

🔧 Pasos a seguir:
`);

console.log(`
1. 🔐 AUTENTICACIÓN (Si no lo has hecho)
   Ejecuta en tu terminal:
   
   vercel login
   
   Sigue las instrucciones para autenticarte.

2. 🚀 INICIALIZAR PROYECTO
   Ejecuta en tu terminal:
   
   vercel
   
   Responde:
   - Set up and deploy? [Y/n] → Y
   - Which scope? → Selecciona tu cuenta/organización
   - Link to existing project? [y/N] → N
   - What's your project's name? → hockey-management-system
   - In which directory is your code located? → ./
   
3. 🗄️ CONFIGURAR BASE DE DATOS
   Ve a: https://vercel.com/dashboard
   - Selecciona tu proyecto "hockey-management-system"
   - Pestaña "Storage" → "Create Database" → "Postgres"
   - Nombre: hockey-database
   - Región: Selecciona la más cercana
   
4. 📋 COPIAR VARIABLES DE ENTORNO
   Una vez creada la base de datos:
   - Copia todas las variables POSTGRES_*
   - Ve a Settings → Environment Variables
   - Pégalas en tu proyecto Vercel
   - También cópielas en tu archivo .env local

5. 🏗️ EJECUTAR MIGRACIÓN
   Una vez configuradas las variables:
   
   cd backend
   npm run migrate:vercel
   
6. 🚀 DESPLEGAR
   Finalmente:
   
   vercel --prod

📞 ¿Necesitas ayuda?
   - Vercel Docs: https://vercel.com/docs
   - Postgres Setup: https://vercel.com/docs/storage/vercel-postgres
`);

console.log(`
⚠️  IMPORTANTE:
   Las migraciones incluyen cambios importantes:
   - Elimina tabla 'attendances' antigua
   - Crea nuevo sistema de entrenamientos
   - Refactoriza sistema de formaciones
   
   ¡Asegúrate de tener backup si tienes datos importantes!

🎯 Una vez completado, tendrás:
   ✅ Frontend desplegado
   ✅ Backend API funcional
   ✅ Base de datos Postgres configurada
   ✅ Sistema completo en producción
`);

process.exit(0);
