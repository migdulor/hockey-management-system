/**
 * GENERADOR DE MAPAS DE CALOR - 12 ZONAS
 * Fecha: 2025-09-05
 */

import { FIELD_ZONES_12, getZoneColor, HEATMAP_CONFIG } from './field-zones-12.js';

export class HeatmapGenerator {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.options = {
      width: options.width || HEATMAP_CONFIG.fieldWidth,
      height: options.height || HEATMAP_CONFIG.fieldHeight,
      showLabels: options.showLabels !== false,
      showGrid: options.showGrid !== false,
      ...options
    };
    
    this.setupCanvas();
  }

  setupCanvas() {
    this.canvas.width = this.options.width;
    this.canvas.height = this.options.height;
    this.canvas.style.border = '4px solid #ffffff';
    this.canvas.style.borderRadius = '8px';
    this.canvas.style.background = '#2a7f3e';
    this.canvas.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
    this.canvas.style.display = 'block';
    this.canvas.style.position = 'relative';
    this.canvas.style.zIndex = '1';
    
    // Limpiar cualquier contenido previo
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // Dibujar campo base con 12 zonas
  drawField() {
    // Limpiar completamente el canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Fondo verde de la cancha
    this.ctx.fillStyle = '#2a7f3e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Textura del césped (líneas sutiles)
    this.drawGrassTexture();
    
    // Borde blanco de la cancha
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(4, 4, this.canvas.width - 8, this.canvas.height - 8);
    
    // Dibujar líneas del campo de hockey
    this.drawFieldLines();
    
    // Dibujar arcos y porterías
    this.drawGoals();
    
    // Dibujar zonas si está habilitado
    if (this.options.showGrid) {
      this.drawZoneGrid();
    }
  }

  drawGrassTexture() {
    // Crear patrón de textura de césped como en el dashboard
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.03)';
    this.ctx.lineWidth = 1;
    
    // Líneas verticales sutiles cada 10 píxeles
    for (let x = 0; x < this.canvas.width; x += 20) {
      if (x % 40 === 0) { // Líneas más marcadas cada 40px
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
      } else {
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.02)';
      }
      
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
  }

  drawZoneGrid() {
    // Líneas punteadas sutiles para las zonas (como en el dashboard)
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([5, 5]); // Línea punteada
    
    const zoneWidth = this.canvas.width / 3; // 3 columnas
    const zoneHeight = this.canvas.height / 4; // 4 filas
    
    // Líneas verticales (columnas) - dividen en 3 secciones
    for (let i = 1; i < 3; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * zoneWidth, 0);
      this.ctx.lineTo(i * zoneWidth, this.canvas.height);
      this.ctx.stroke();
    }
    
    // Líneas horizontales adicionales (las principales ya están en drawFieldLines)
    // Solo dibujamos las que no son las líneas principales del campo
    const quarterHeight = this.canvas.height / 4;
    for (let i = 1; i < 4; i++) {
      // No dibujar sobre las líneas principales ya existentes (25%, 50%, 75%)
      const y = quarterHeight * i;
      if (Math.abs(y - this.canvas.height * 0.25) > 5 && 
          Math.abs(y - this.canvas.height * 0.5) > 5 && 
          Math.abs(y - this.canvas.height * 0.75) > 5) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(this.canvas.width, y);
        this.ctx.stroke();
      }
    }
    
    // Resetear estilo de línea
    this.ctx.setLineDash([]);
    
    // Etiquetas de zonas si está habilitado
    if (this.options.showLabels) {
      this.drawZoneLabels();
    }
  }

  drawZoneLabels() {
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'center';
    
    const zoneWidth = this.canvas.width / 3;
    const zoneHeight = this.canvas.height / 4;
    
    // Dibujar números de zonas (1-12)
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 3; col++) {
        const zoneNumber = (row * 3) + col + 1;
        const x = (col * zoneWidth) + (zoneWidth / 2);
        const y = (row * zoneHeight) + (zoneHeight / 2);
        
        this.ctx.fillText(zoneNumber.toString(), x, y);
      }
    }
  }

  drawGoals() {
    const centerX = this.canvas.width / 2;
    
    // Configuración para líneas blancas
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.lineWidth = 3;
    
    // Áreas de gol de hockey - rectangulares con semicírculo (círculo de shooting)
    const goalAreaWidth = this.canvas.width * 0.35; // Más proporcionado
    const goalAreaHeight = this.canvas.height * 0.15; // Altura del área
    
    // Área de gol superior (rectangular)
    this.ctx.strokeRect(
      centerX - goalAreaWidth / 2, 
      0, 
      goalAreaWidth, 
      goalAreaHeight
    );
    
    // Círculo de shooting superior (semicírculo)
    this.ctx.beginPath();
    this.ctx.arc(centerX, goalAreaHeight, goalAreaWidth * 0.4, Math.PI, 2 * Math.PI);
    this.ctx.stroke();
    
    // Área de gol inferior (rectangular)
    this.ctx.strokeRect(
      centerX - goalAreaWidth / 2, 
      this.canvas.height - goalAreaHeight, 
      goalAreaWidth, 
      goalAreaHeight
    );
    
    // Círculo de shooting inferior (semicírculo)
    this.ctx.beginPath();
    this.ctx.arc(centerX, this.canvas.height - goalAreaHeight, goalAreaWidth * 0.4, 0, Math.PI);
    this.ctx.stroke();
    
    // Porterías más pequeñas y proporcionadas
    const goalWidth = this.canvas.width * 0.12; // Más pequeñas
    const goalHeight = 6;
    
    // Portería superior
    this.ctx.fillStyle = '#f0f0f0';
    this.ctx.fillRect(centerX - goalWidth / 2, -3, goalWidth, goalHeight);
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.strokeRect(centerX - goalWidth / 2, -3, goalWidth, goalHeight);
    
    // Portería inferior
    this.ctx.fillStyle = '#f0f0f0';
    this.ctx.fillRect(centerX - goalWidth / 2, this.canvas.height - 3, goalWidth, goalHeight);
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.strokeRect(centerX - goalWidth / 2, this.canvas.height - 3, goalWidth, goalHeight);
    
    // Puntos de penalti stroke (penalty spot)
    this.ctx.fillStyle = '#ffffff';
    // Punto superior (penalty stroke)
    this.ctx.beginPath();
    this.ctx.arc(centerX, this.canvas.height * 0.12, 3, 0, 2 * Math.PI);
    this.ctx.fill();
    
    // Punto inferior (penalty stroke)
    this.ctx.beginPath();
    this.ctx.arc(centerX, this.canvas.height * 0.88, 3, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  drawFieldLines() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    // Configuración para líneas blancas
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.lineWidth = 3;
    
    // Línea central horizontal (línea de 23 metros)
    this.ctx.beginPath();
    this.ctx.moveTo(0, centerY);
    this.ctx.lineTo(this.canvas.width, centerY);
    this.ctx.stroke();
    
    // Líneas de 23 metros (25% y 75% de la altura)
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.canvas.height * 0.25);
    this.ctx.lineTo(this.canvas.width, this.canvas.height * 0.25);
    this.ctx.stroke();
    
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.canvas.height * 0.75);
    this.ctx.lineTo(this.canvas.width, this.canvas.height * 0.75);
    this.ctx.stroke();
    
    // Hockey NO tiene círculo central - eliminado
    // Solo punto central si es necesario
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 3, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  // Generar mapa de calor con datos
  generateHeatmap(data, actionType = 'all') {
    console.log('generateHeatmap called with data:', data, 'actionType:', actionType);
    
    this.drawField();
    
    if (!data || data.length === 0) {
      console.log('No data available, showing no data message');
      this.drawNoDataMessage();
      return;
    }
    
    // Procesar datos por zona
    const zoneData = this.processHeatmapData(data, actionType);
    console.log('Processed zone data:', zoneData);
    
    // Dibujar intensidad de calor
    this.drawHeatIntensity(zoneData);
    
    // Dibujar valores numéricos
    if (this.options.showValues !== false) {
      this.drawZoneValues(zoneData);
    }
  }

  processHeatmapData(data, actionType) {
    const zoneStats = {};
    
    // Inicializar todas las zonas
    for (let i = 1; i <= 12; i++) {
      zoneStats[i] = { count: 0, intensity: 0 };
    }
    
    // Procesar datos
    data.forEach(item => {
      const zoneNumber = parseInt(item.zone_number);
      const count = parseInt(item.action_count) || 0;
      
      if (zoneNumber >= 1 && zoneNumber <= 12) {
        if (actionType === 'all' || item.action_name === actionType) {
          zoneStats[zoneNumber].count += count;
        }
      }
    });
    
    // Calcular intensidad relativa
    const maxCount = Math.max(...Object.values(zoneStats).map(z => z.count));
    if (maxCount > 0) {
      Object.keys(zoneStats).forEach(zone => {
        zoneStats[zone].intensity = zoneStats[zone].count / maxCount;
      });
    }
    
    return zoneStats;
  }

  drawHeatIntensity(zoneData) {
    console.log('Drawing heat intensity with data:', zoneData);
    
    const zoneWidth = this.canvas.width / 3;
    const zoneHeight = this.canvas.height / 4;
    
    Object.keys(zoneData).forEach(zoneNumber => {
      const zone = parseInt(zoneNumber);
      const stats = zoneData[zone];
      
      console.log(`Zone ${zone}: count=${stats.count}, intensity=${stats.intensity}`);
      
      if (stats.intensity > 0) {
        // Calcular posición de la zona
        const row = Math.floor((zone - 1) / 3);
        const col = (zone - 1) % 3;
        
        const x = col * zoneWidth;
        const y = row * zoneHeight;
        
        // Color basado en intensidad y tipo de acción
        const alpha = Math.min(stats.intensity * 0.7 + 0.3, 0.8); // Mínimo 0.3, máximo 0.8
        const color = this.getHeatColor(stats.intensity, alpha);
        
        console.log(`Drawing zone ${zone} at (${x}, ${y}) with color ${color}`);
        
        // Dibujar overlay de calor
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, zoneWidth, zoneHeight);
      }
    });
  }

  getHeatColor(intensity, alpha = 0.5) {
    // Escala de colores: azul (frío) → verde → amarillo → rojo (caliente)
    if (intensity <= 0.25) {
      return `rgba(0, 100, 255, ${alpha})`;  // Azul
    } else if (intensity <= 0.5) {
      return `rgba(0, 255, 100, ${alpha})`;  // Verde
    } else if (intensity <= 0.75) {
      return `rgba(255, 255, 0, ${alpha})`;  // Amarillo
    } else {
      return `rgba(255, 50, 50, ${alpha})`;  // Rojo
    }
  }

  drawZoneValues(zoneData) {
    this.ctx.fillStyle = 'white';
    this.ctx.font = 'bold 16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 3;
    
    const zoneWidth = this.canvas.width / 3;
    const zoneHeight = this.canvas.height / 4;
    
    Object.keys(zoneData).forEach(zoneNumber => {
      const zone = parseInt(zoneNumber);
      const stats = zoneData[zone];
      
      if (stats.count > 0) {
        // Calcular posición del texto
        const row = Math.floor((zone - 1) / 3);
        const col = (zone - 1) % 3;
        
        const x = (col * zoneWidth) + (zoneWidth / 2);
        const y = (row * zoneHeight) + (zoneHeight / 2) + 20;
        
        // Dibujar texto con borde
        this.ctx.strokeText(stats.count.toString(), x, y);
        this.ctx.fillText(stats.count.toString(), x, y);
      }
    });
  }

  drawNoDataMessage() {
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.font = '18px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      'No hay datos disponibles para este mapa de calor',
      this.canvas.width / 2,
      this.canvas.height / 2
    );
  }

  // Exportar como imagen
  exportAsPNG(filename = 'heatmap.png') {
    const link = document.createElement('a');
    link.download = filename;
    link.href = this.canvas.toDataURL();
    link.click();
  }
}

// Función helper para inicializar mapas de calor
export function initializeHeatmap(canvasId, options = {}) {
  return new HeatmapGenerator(canvasId, options);
}

// Función para cargar datos desde API
export async function loadHeatmapData(matchId, teamId, actionType = null) {
  try {
    const params = new URLSearchParams({
      match_id: matchId,
      team_id: teamId
    });
    
    if (actionType) {
      params.append('action_type', actionType);
    }
    
    const response = await fetch(`/api/heatmap/zones?${params}`);
    const data = await response.json();
    
    if (data.success) {
      return data.heatmapData;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error loading heatmap data:', error);
    
    // Fallback a datos de ejemplo para demostración
    console.log('Using sample data for demonstration');
    try {
      const { loadSampleData } = await import('./heatmap-sample-data.js');
      return await loadSampleData(actionType);
    } catch (sampleError) {
      console.error('Error loading sample data:', sampleError);
      return [];
    }
  }
}
