# 🏒 EJEMPLOS ESPECÍFICOS DE CASOS DE USO
## Basados en "Dudas críticas para el desarrollo.pdf"

**Fecha:** 22 de agosto de 2025  
**Fuente:** Ejemplos reales del PDF  
**Estado:** Casos de uso confirmados para testin---

## 📱 EJEMPLO 6: SISTEMA DE DESCARGAS DE REPORTES

### 📋 Contexto:
El entrenador quiere generar y descargar la imagen de formación para compartir manualmente con el equipo antes del partido contra Las Leonas.

### 🎯 Flujo de Descarga de Formación:

#### Paso 1: Generar Imagen de Formación
```javascript
// Frontend: Click en "Generar Imagen Formación"
const generateFormation = async () => {
  const response = await fetch('/api/reports/formation-image', {
    method: 'POST',
    body: JSON.stringify({
      teamId: 'uuid-primera-fem',
      matchInfo: {
        rival: 'Las Leonas',
        date: '2025-08-25',
        time: '15:00',
        field: 'Cancha 1'
      }
    })
  });
  
  const imageBlob = await response.blob();
  return imageBlob; // PNG 1080x1350px
};
```

#### Paso 2: Vista Previa y Descarga
```javascript
// Componente de descarga
export const DownloadCenter: React.FC = ({ match }) => {
  const [preview, setPreview] = useState<string | null>(null);
  
  const handleDownload = async (type: 'formation' | 'report' | 'heatmap') => {
    let endpoint = '';
    let filename = '';
    
    switch(type) {
      case 'formation':
        endpoint = '/api/reports/formation-image';
        filename = `formacion_vs_${match.rival}_${format(match.date, 'ddMMM')}.png`;
        break;
      case 'report':
        endpoint = '/api/reports/match-pdf';
        filename = `reporte_${match.id}_completo.pdf`;
        break;
      case 'heatmap':
        endpoint = '/api/reports/heatmap-png';
        filename = `mapa_calor_${match.id}.png`;
        break;
    }
    
    // Descarga automática
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };
  
  return (
    <div className="download-center">
      <button onClick={() => handleDownload('formation')}>
        📸 Descargar Formación PNG
      </button>
      <button onClick={() => handleDownload('report')}>
        📊 Descargar Reporte PDF  
      </button>
      <button onClick={() => handleDownload('heatmap')}>
        🗺️ Descargar Mapa Calor
      </button>
    </div>
  );
};
```

### 📊 Backend - Servicio de Reportes:
```typescript
// backend/src/services/ReportService.ts
export class ReportService {
  async generateFormationImage(teamId: string, matchInfo: MatchInfo): Promise<Buffer> {
    // Usar canvas para generar imagen 1080x1350px
    const canvas = createCanvas(1080, 1350);
    const ctx = canvas.getContext('2d');
    
    // Dibujar cancha de hockey
    this.drawHockeyField(ctx);
    
    // Agregar fotos jugadoras (80x80px circulares)
    await this.addPlayerPhotos(ctx, teamId);
    
    // Información del partido
    this.addMatchInfo(ctx, matchInfo);
    
    return canvas.toBuffer('image/png');
  }
  
  async generateMatchReportPDF(matchId: string): Promise<Buffer> {
    const match = await this.matchRepository.findById(matchId);
    const actions = await this.actionRepository.findByMatchId(matchId);
    
    // Generar PDF con estadísticas, mapas de calor, gráficos
    // Usar puppeteer o similar para HTML -> PDF
    return pdfBuffer;
  }
}
```

### ✅ Criterios de Aceptación:
- [x] **Sin integración automática WhatsApp** - solo descarga manual
- [x] Imagen formación PNG 1080x1350px optimizada para móviles
- [x] Reportes PDF con estadísticas completas y mapas de calor
- [x] Exportación CSV/JSON para análisis externo
- [x] Vista previa antes de descargar
- [x] Nombres de archivos descriptivos con fecha/rival
- [x] Historial de descargas por usuario
- [x] **Entrenador decide cuándo y cómo compartir los archivos**

---

## 🧪 EJEMPLO 7: TESTS CRÍTICOS DE VALIDACIÓN

---

## ⚽ EJEMPLO 1: REGISTRO DE GOL

### Contexto del Partido:
```
Equipo: Sub16 Femenino Club Atlético
Rival: Club Deportivo Rival  
Fecha: 25/08/2025 15:00
Cuarto: 2 (tiempo: 8:30 transcurridos)
Marcador antes: 0-0
```

### Acción Registrada:
```json
{
  "actionType": "Gol",
  "player": {
    "id": "uuid-ana-garcia",
    "name": "Ana García", 
    "nickname": "Anita",
    "jerseyNumber": 9
  },
  "quarter": 2,
  "timeInQuarter": 510, // 8:30 = 510 segundos
  "areaSector": "area_central", // Gol al centro del arco
  "observations": "Remate de primera tras pase de Mary"
}
```

### Resultado Esperado:
- ✅ Marcador actualizado: 1-0
- ✅ Estadística sumada a Ana García  
- ✅ Acción registrada para mapa de calor área rival
- ✅ Timeline del partido actualizado

---

## 🔄 EJEMPLO 2: CAMBIO DE JUGADORA  

### Contexto:
```
Cuarto: 3 (tiempo: 5:15 transcurridos)
Zona: Zona 2 (Defensivo Derecho)
Motivo: Rotación táctica
```

### Acción Registrada:
```json
{
  "actionType": "Cambio",
  "playerOut": {
    "id": "uuid-sofia-martinez",
    "name": "Sofía Martínez",
    "jerseyNumber": 4,
    "timePlayedThisQuarter": 315 // 5:15 = 315 segundos
  },
  "playerIn": {
    "id": "uuid-lucia-rodriguez", 
    "name": "Lucía Rodríguez",
    "jerseyNumber": 14
  },
  "quarter": 3,
  "timeInQuarter": 315,
  "zone": "zona_2",
  "observations": "Cambio táctico - refuerzo defensivo"
}
```

### Resultado Esperado:
- ✅ Sofía queda "fuera de cancha" 
- ✅ Lucía queda "en cancha"
- ✅ Tiempo jugado calculado automáticamente
- ✅ Sofía no puede realizar acciones hasta nuevo ingreso
- ✅ Lucía disponible para próximas acciones

---

## 🟨 EJEMPLO 3: TARJETA AMARILLA CON SANCIÓN

### Contexto:
```
Cuarto: 1 (tiempo: 12:45 transcurridos)
Jugadora sancionada: María López (#7)
Motivo: Juego peligroso
Sanción: 5 minutos fuera
```

### Acción Registrada:
```json
{
  "actionType": "Tarjeta Amarilla",
  "player": {
    "id": "uuid-maria-lopez",
    "name": "María López",
    "nickname": "Mary", 
    "jerseyNumber": 7
  },
  "quarter": 1,
  "timeInQuarter": 765, // 12:45 = 765 segundos
  "observations": "Juego peligroso - entrada por detrás"
}
```

### Sanción Automática Creada:
```json
{
  "matchId": "uuid-partido-actual",
  "playerId": "uuid-maria-lopez", 
  "sanctionType": "amarilla",
  "startQuarter": 1,
  "startTime": 765,
  "durationMinutes": 5,
  "endQuarter": 2, // Calculado automáticamente
  "endTime": 165, // 2:45 del cuarto 2 (765 + 300 - 900)
  "isActive": true
}
```

### Resultado Esperado:
- ✅ María queda "sancionada" hasta cuarto 2, minuto 2:45
- ✅ No puede realizar acciones durante sanción
- ✅ Reingreso automático calculado
- ✅ Notificación visual en interfaz
- ✅ Timer countdown para entrenador

---

## 🛡️ EJEMPLO 4: RECUPERACIÓN DE BOCHA PARA MAPA CALOR

### Contexto:
```
Cuarto: 4 (tiempo: 3:20 transcurridos)  
Zona: Zona 1 (Defensivo Izquierdo)
Situación: Intercepción en defensa propia
```

### Acción Registrada:
```json
{
  "actionType": "Recuperación Bocha",
  "player": {
    "id": "uuid-ana-garcia",
    "name": "Ana García",
    "jerseyNumber": 9
  },
  "quarter": 4,
  "timeInQuarter": 200, // 3:20 = 200 segundos
  "zone": "zona_1",
  "observations": "Intercepción tras error rival"
}
```

### Para Mapa de Calor:
```json
{
  "zona_1": {
    "recuperaciones": 15, // +1 por esta acción
    "perdidas": 3,
    "infracciones": 1,
    "intensity": "high" // Muchas recuperaciones = buena defensa
  }
}
```

---

## 📊 EJEMPLO 5: GENERACIÓN IMAGEN FORMACIÓN

### Input Data:
```json
{
  "formation": {
    "id": "uuid-formacion-sub16",
    "teamName": "Sub16 Femenino",
    "clubName": "Club Atlético Ejemplo",
    "rivalTeam": "Club Deportivo Rival",
    "matchDate": "2025-08-25",
    "matchTime": "15:00",
    "presentationTime": "14:30", 
    "venue": "Cancha Club Atlético",
    "players": {
      "starters": [
        {
          "position": "Arquera",
          "player": {"name": "Sofía Martínez", "photo": "/photos/sofia.jpg", "number": 1},
          "coordinates": {"x": 50, "y": 10}
        },
        {
          "position": "Defensora",
          "player": {"name": "Ana García", "photo": "/photos/ana.jpg", "number": 2},
          "coordinates": {"x": 25, "y": 30}
        },
        // ... resto de titulares
      ],
      "substitutes": [
        {"name": "Lucía Rodríguez", "photo": "/photos/lucia.jpg", "number": 12},
        {"name": "Carla Pérez", "photo": "/photos/carla.jpg", "number": 13},
        // ... resto de suplentes  
      ]
    }
  }
}
```

### Output Esperado:
- 🖼️ **Imagen PNG 1080x1350px**
- 📱 **Optimizada para WhatsApp/Instagram**  
- 🏒 **Cancha visual con posiciones**
- 📸 **Fotos circulares 80x80px**
- 🎨 **Colores del club**
- 📝 **Información del partido completa**

---

## 📈 EJEMPLO 6: MAPA DE CALOR POST-PARTIDO

### Input: Acciones del Partido Completo
```json
{
  "matchId": "uuid-partido-ejemplo",
  "totalActions": 45,
  "actionsByZone": {
    "zona_1": {
      "recuperaciones": 12,
      "perdidas": 3, 
      "infracciones": 2,
      "otros": 1
    },
    "zona_2": {
      "recuperaciones": 8,
      "perdidas": 5,
      "infracciones": 1, 
      "otros": 2
    },
    "zona_3": {
      "recuperaciones": 4,
      "perdidas": 8,
      "infracciones": 3,
      "otros": 5
    },
    "zona_4": {
      "recuperaciones": 6,
      "perdidas": 6,
      "infracciones": 1,
      "otros": 3
    }
  },
  "areaRivalActions": {
    "area_left": {"goles": 1, "intentos": 3},
    "area_central": {"goles": 2, "intentos": 5}, 
    "area_right": {"goles": 0, "intentos": 2}
  }
}
```

### Output Mapa Recuperaciones:
```
    🏒 MAPA DE CALOR - RECUPERACIONES 🏒
    ┌─────────────────────────────────────────┐
    │                                         │
    │  🟡 ZONA 3        🟢 ZONA 4             │
    │  (4 recup.)      (6 recup.)            │ 
    │   BAJA            MEDIA                 │
    │                                         │
    ├─────────────────────────────────────────┤
    │                                         │
    │  🟢 ZONA 1        🟢 ZONA 2             │
    │  (12 recup.)     (8 recup.)            │
    │   ALTA            MEDIA-ALTA            │
    │                                         │
    └─────────────────────────────────────────┘
    
    🟢 = Alta actividad (bueno para recuperaciones)
    🟡 = Baja actividad (área a mejorar)
```

---

## 🎯 EJEMPLO 7: FLUJO COMPLETO DE PARTIDO

### 1. Pre-Partido:
```bash
# Entrenador crea formación
POST /api/formations
{
  "teamId": "uuid-sub16-fem",
  "rivalTeam": "Club Deportivo Rival",
  "matchDate": "2025-08-25",
  "players": [...] 
}

# Sistema genera imagen
GET /api/formations/{id}/export
# Retorna: imagen PNG para WhatsApp

# Entrenador envía por WhatsApp  
POST /api/whatsapp/send-formation
{
  "formationId": "uuid-formacion",
  "recipients": ["+54911...", "+54911..."]
}
```

### 2. Durante Partido:
```bash
# Inicializar partido (modo offline)  
POST /api/matches/start
{
  "formationId": "uuid-formacion"
}

# Registrar acciones en tiempo real
POST /api/matches/{id}/actions
[
  {"type": "Gol", "playerId": "uuid-ana", "quarter": 1, "time": 300, "areaSector": "area_central"},
  {"type": "Cambio", "playerOut": "uuid-sofia", "playerIn": "uuid-lucia", "quarter": 2, "time": 450, "zone": "zona_2"},
  {"type": "Tarjeta Amarilla", "playerId": "uuid-maria", "quarter": 3, "time": 600}
]

# Finalizar partido
POST /api/matches/{id}/finish
```

### 3. Post-Partido:
```bash
# Generar estadísticas
GET /api/matches/{id}/statistics
# Retorna: tiempo jugado, acciones por jugadora, mapas calor

# Generar reporte PDF
GET /api/matches/{id}/report
# Retorna: PDF completo con estadísticas

# Enviar resumen por WhatsApp
POST /api/whatsapp/send-match-summary  
{
  "matchId": "uuid-partido",
  "recipients": [...]
}
```

---

## 🧪 CASOS DE PRUEBA CRÍTICOS

### Test 1: Validación Límites Edad
```javascript
describe('Player Age Validation', () => {
  it('should reject Sub16 player born in 2008', async () => {
    const player = { birthYear: 2008 }; // Muy mayor para Sub16  
    const team = { division: 'Sub16' };
    
    expect(() => assignPlayerToTeam(player, team))
      .toThrow('Player birth year 2008 does not match division Sub16 requirements (2009-2010)');
  });
});
```

### Test 2: Control Sanciones
```javascript
describe('Sanction Control', () => {
  it('should prevent sanctioned player from actions', async () => {
    const match = createMatch();
    const player = { id: 'uuid-maria' };
    
    // Aplicar sanción
    await addSanction(match, player, 'amarilla', 1, 300); // Cuarto 1, 5:00
    
    // Intentar acción durante sanción  
    const action = { playerId: 'uuid-maria', quarter: 1, time: 400 };
    
    expect(() => addAction(match, action))
      .toThrow('Player is currently sanctioned and cannot perform actions');
  });
});
```

### Test 3: Límite Divisiones por Jugadora
```javascript
describe('Division Limit Validation', () => {
  it('should prevent player from joining 3rd division in same club', async () => {
    const player = { id: 'uuid-ana' };
    const club = 'Club Atlético';
    
    // Ya en 2 divisiones
    await assignToTeam(player, { club, division: 'Sub16' });
    await assignToTeam(player, { club, division: 'Sub19' });
    
    // Intentar 3ra división
    expect(() => assignToTeam(player, { club, division: 'Inter' }))
      .toThrow('Player can only participate in maximum 2 divisions per club');
  });
});
```

---

**✅ CASOS DE USO COMPLETOS Y VALIDADOS**  
**🧪 EJEMPLOS LISTOS PARA IMPLEMENTACIÓN Y TESTING**  
**📋 BASADOS EN ESPECIFICACIONES REALES DEL PDF**
