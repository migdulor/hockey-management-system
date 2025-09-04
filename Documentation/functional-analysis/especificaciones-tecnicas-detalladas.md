# 📋 ESPECIFICACIONES TÉCNICAS DETALLADAS
## Basadas en "Dudas críticas para el desarrollo.pdf"

**Fecha:** 22 de agosto de 2025  
**Fuente:** PDF proporcionado por el cliente  
**Estado:** Especificaciones finales confirmadas

---

## 🗺️ DEFINICIÓN EXACTA DE ZONAS DE CANCHA

### Cancha de Hockey - División por Zonas
Según el PDF, la cancha se divide en **8 zonas principales** para el registro de acciones:

```
                    ARCO RIVAL
    ┌─────────────────────────────────────────┐
    │                   |                     │
    │   ZONA 7          |     ZONA 8          │
    │  (Ofensivo        |  (Ofensivo          │ 
    │   Izquierdo)      |   Derecho)          │
    │                   |                     │
    ├───────────────────|─────────────────────┤
    │                   |                     │
    │  ZONA 5           |   ZONA 6            │
    │  (Medio Ofensivo  |(Medio Ofensivo      │
    │   Izquierdo)      |   Derecho)          │
    │                   |                     │  
    |------------------ |---------------------|
    |   ZONA 3          |    ZONA 4           │
    │  (Medio Defensivo |(Medio Defensivo     │ 
    │   Izquierdo)      |   Derecho)          │
    │                   |                     │
    ├───────────────────|─────────────────────┤
    │                   |                     │
    │  ZONA 1           |   ZONA 2            │
    │  (Defensivo       |  (Defensivo         │
    │   Izquierdo)      |   Derecho)          │
    │                   |                     │
    └─────────────────────────────────────────┘
                   ARCO PROPIO
```

### Área Rival - División por Sectores
El área rival (donde se pueden anotar goles) se divide en **3 sectores**:

```
              ARCO RIVAL
    ┌───────────────────────────┐
    │ IZQUIERDA│CENTRAL│DERECHA │
    │    (L)   │  (C)  │   (R)  │
    └───────────────────────────┘
```

### Coordenadas Técnicas para Desarrollo:
```typescript
// Definición de zonas para base de datos
export enum CanchZone {
  ZONA_1 = 'zona_1',  // Defensivo Izquierdo
  ZONA_2 = 'zona_2',  // Defensivo Derecho  
  ZONA_3 = 'zona_3',  // Medio Defensivo Izquierdo
  ZONA_4 = 'zona_4',  // Medio Defensivo Derecho
  ZONA_5 = 'zona_5',  // Medio Ofensivo Izquierdo
  ZONA_6 = 'zona_6',  // Medio Ofensivo Derecho  
  ZONA_7 = 'zona_7',  // Ofensivo Izquierdo
  ZONA_8 = 'zona_8',  // Ofensivo Derecho
}

export enum AreaRivalSector {
  IZQUIERDA = 'area_left',
  CENTRAL = 'area_central', 
  DERECHA = 'area_right'
}
```

---

## 🎯 TIPOS DE ACCIONES DE PARTIDO

### Acciones Principales Confirmadas:

#### 1. **Goles**
- **Parámetros:** Jugadora que anota, sector del área rival, tiempo exacto
- **Zona requerida:** Solo sectores del área rival (L/C/R)
- **Registro:** Automático suma al marcador

#### 2. **Cambios de Jugadoras**
- **Parámetros:** Jugadora que sale, jugadora que entra, zona donde ocurre
- **Control tiempo:** Automático cálculo tiempo jugado
- **Validación:** Jugadora fuera no puede realizar acciones

#### 3. **Infracciones/Tarjetas**
- **Tipos:** Tarjeta Verde (2 min), Tarjeta Amarilla (5 min), Tarjeta Roja (partido completo)
- **Parámetros:** Jugadora sancionada, tipo de sanción, tiempo de sanción
- **Control:** Automático manejo de entrada/salida por sanción

#### 4. **Recuperación de Bochas**
- **Parámetros:** Jugadora que recupera, zona donde recupera
- **Estadística:** Cuenta para mapas de calor defensivos

#### 5. **Pérdida de Bochas**
- **Parámetros:** Jugadora que pierde, zona donde pierde
- **Estadística:** Análisis de puntos débiles

#### 6. **Corners**
- **Parámetros:** Equipo que lo ejecuta, zona de origen
- **Registro:** Para análisis táctico

---

## 🖼️ FORMATO DE IMAGEN DE FORMACIÓN

### Especificaciones Visuales:
Según los ejemplos del PDF, la imagen de formación debe incluir:

#### Header de la Imagen:
```
┌─────────────────────────────────────────────┐
│  LOGO CLUB        VS.        LOGO RIVAL     │
│                                             │
│  EQUIPO LOCAL          EQUIPO RIVAL         │
│  División: Sub-16      Fecha: 25/08/2025    │
│  Presentación: 14:30   Partido: 15:00       │
│  Cancha: Club Atlético Ejemplo              │
└─────────────────────────────────────────────┘
```

#### Representaciones de la Cancha:
#### Formacion: 1 (Aruqero) - 4 (Defensores) - 3 (Mediocampistas)  - 3 (delanteros)
```
                    ARCO RIVAL
    ┌─────────────────────────────────────────┐
    │   [FOTO]                      [FOTO]    │
    │  Delantera 1                Delantera 3 | 
    |                                         |
    |                  [FOTO]                 |
    |                Delantera 2              |
    │                                         │
    │    [FOTO]       [FOTO]       [FOTO]│    |
    │  Volante 1     Volante 2   Volante 3    │
    │                                         │
    │  [FOTO]    [FOTO]    [FOTO]    [FOTO]   │
    │  Def 1     Def 2     Def 3     Def 4    │
    │                                         │
    │              [FOTO]                     │
    │              Arquera                    │
    └─────────────────────────────────────────┘
                   ARCO PROPIO
```
#### Formacion 2 : 1 (Arquero)- 3(Defensores) - 4 (Mediocampistas) - 3 (Delanteros)
```
                    ARCO RIVAL
    ┌─────────────────────────────────────────┐
    │   [FOTO]                      [FOTO]    │
    │  Delantera 1                Delantera 3 | 
    |                                         |
    |                  [FOTO]                 |
    |                Delantera 2              |
    │                                         │
    │    [FOTO]   [FOTO]           [FOTO]│    |
    │  Volante 1  Volante 2       Volante 4   │
    │                                         |
    |                    [FOTO]               | 
    |                    Volante 3            | 
    |                                         │
    │      [FOTO]    [FOTO]    [FOTO]         │
    │      Def 1     Def 2     Def 3          │
    │                                         │
    │              [FOTO]                     │
    │              Arquera                    │
    └─────────────────────────────────────────┘
                   ARCO PROPIO
```                   
#### Formacion 3 : 1 (Arquero)- 4(Defensores) - 4 (Mediocampistas) - 2 (Delanteros)
```
                    ARCO RIVAL
    ┌─────────────────────────────────────────┐
    │   [FOTO]                      [FOTO]    │
    │  Delantera 1                Delantera 2 | 
    |                                         |
    |                                         |
    │                                         │
    │    [FOTO]   [FOTO]           [FOTO]│    |
    │  Volante 1  Volante 2       Volante 4   │
    │                                         |
    |                    [FOTO]               | 
    |                    Volante 3            | 
    |                                         │
    │  [FOTO]    [FOTO]    [FOTO]    [FOTO]   │
    │  Def 1     Def 2     Def 3     Def 4    │
    │                                         │
    │              [FOTO]                     │
    │              Arquera                    │
    └─────────────────────────────────────────┘
                   ARCO PROPIO
```
#### Suplentes:
```
SUPLENTES:
[FOTO] Jugadora 12    [FOTO] Jugadora 13
[FOTO] Jugadora 14    [FOTO] Jugadora 15
...hasta 9 suplentes máximo
```

### Especificaciones Técnicas:
- **Formato:** PNG o JPG de alta calidad
- **Dimensiones:** 1080x1350px (formato Instagram/WhatsApp)
- **Fotos jugadoras:** 80x80px, formato circular
- **Colores:** Según paleta del club
- **Fuente:** Arial o similar, legible en móvil

---

## ⏱️ CONTROL DE TIEMPOS DE PARTIDO

### Estructura de Tiempo:
```
Partido completo: 60 minutos
├── Cuarto 1: 0-15 minutos
├── Cuarto 2: 15-30 minutos  
├── Cuarto 3: 30-45 minutos
└── Cuarto 4: 45-60 minutos
```

### Funcionalidades de Cronómetro:
- **Play/Pause** por cuarto
- **Registro automático** tiempo en acciones
- **Control de sanciones** con tiempo automático de reingreso
- **Tiempo jugado** por jugadora automático

---

## � DIVISIONES Y EDADES CONFIRMADAS

### Categorías Femeninas:
```
- Sub 14: Nacidas en 2011 y posteriores
- Sub 16: Nacidas en 2009-2010  
- Sub 19: Nacidas en 2006-2008
- Intermedia: Nacidas en 2000-2005
- Primera: Todas las edades (sin límite superior)
```

### Categorías Masculinas:
```
- Sub 14: Nacidas en 2011 y posteriores
- Sub 16: Nacidas en 2009-2010
- Sub 19: Nacidas en 2006-2008  
- Intermedia: Nacidas 2009 para abajo
- Primera: Nacidas 2009 para abajo
```

### Reglas de Participación:
- **Puedo agregar s ls formsción del equipo para un partido jugadoras de otras divisiones** 
- **20 jugadoras máximo** por equipo (11 titulares + 9 suplentes)

---

## 🥅 SHOOTOUTS POR DIVISIÓN
## SON PENALES QUE SE EJECUTAN 5 LA TANDA Y SI QUEDAN EMPATADOS EMPIEZAN A TIRAR DE 1 HASTA DESEMPATAR

### Divisiones QUE SÍ usan shootouts:
- **Primera Mujeres** - En Empate en tiempo reglamnetario puede haber shootout

### Divisiones QUE NO usan shootouts:
- **Sub 14:** 
- **Sub 16:** 
- **Sub 19:** 
- **Intermedia Femenino:** 
- **Sub 15 masculino:** 
- **Sub 16 masculino:** 
- **Inter masculino:** 
- **Primero masculino:** 





### Implementación Técnica:
```typescript
export const DIVISION_CONFIG = {
  'Sub14 femenino': { hasShootouts: false },
  'Sub16 femenino': { hasShootouts: false },
  'Sub19 femenino': { hasShootouts: false },
  'Intermedia femenino': { hasShootouts: false },
  'Primera femenino': { hasShootouts: true },
  'Sub15 masculino': { hasShootouts: false },
  'Sub19 masculino': { hasShootouts: false },
  'Intermedia masculino': { hasShootouts: false },
  'Primera masculino': { hasShootouts: false }
}
```

---

## 📊 MAPAS DE CALOR - ESPECIFICACIONES

### Tipos de Mapas Confirmados:

#### 1. **Mapa de Recuperación de Bochas**
- Zonas 1-8 con intensidad de color
- Verde: Muchas recuperaciones
- Amarillo: Pocas recuperaciones  
- Rojo: Sin recuperaciones

#### 2. **Mapa de Pérdida de Bochas**
- Zonas 1-8 con intensidad de color
- Rojo: Muchas pérdidas (problemático)
- Amarillo: Pocas pérdidas
- Verde: Sin pérdidas (ideal)

#### 3. **Mapa de Infracciones**
- Zonas 1-8 con cantidad de infracciones
- Análisis de disciplina por zona

#### 4. **Mapa de Ingresos al Área**
- Solo sectores L/C/R del área rival
- Análisis efectividad ofensiva

---

## � SISTEMA DE REPORTES Y DESCARGAS

### 🎯 Filosofía del Sistema:
- **Generación automática** de reportes e imágenes
- **Descarga manual** por el entrenador
- **Sin integración WhatsApp** - el entrenador decide cuándo/cómo compartir
- **Formatos optimizados** para móviles y redes sociales

### 📱 Tipos de Descarga:

#### 1. **Imagen de Formación** 
```
Formato: PNG 1080x1350px (óptimo redes sociales)
Contenido: 
- Cancha táctica visual
- Fotos jugadoras (80x80px circulares)
- Rival, fecha, hora, cancha
- Logo del club
Uso: Compartir en grupos WhatsApp, Instagram Stories
```

#### 2. **Reporte de Partido PDF**
```
Contenido:
- Estadísticas completas del partido
- Mapas de calor por zona
- Tiempo jugado por jugadora  
- Acciones realizadas
- Gráficos de rendimiento
Uso: Análisis técnico, archivo histórico
```

#### 3. **Mapas de Calor PNG**
```
Visualizaciones:
- Por equipo completo
- Por jugadora individual
- Por tipo de acción
- Por cuarto del partido
Uso: Análisis táctico, presentaciones
```

#### 4. **Datos CSV/JSON**
```
Exportación:
- Todas las acciones del partido
- Estadísticas por jugadora
- Tiempos y zonas
- Compatible con Excel/análisis externo
```

### 🔧 Implementación Técnica:
```typescript
interface DownloadService {
  generateFormationImage(teamId: string, matchInfo: MatchInfo): Promise<Buffer>;
  generateMatchReportPDF(matchId: string, options: ReportOptions): Promise<Buffer>;
  generateHeatMapPNG(matchId: string, filters: HeatMapFilters): Promise<Buffer>;
  exportMatchDataCSV(matchId: string): Promise<string>;
}
```

### 📲 Interfaz Usuario:
- **Botón "Descargar Formación"** → PNG listo para compartir
- **Botón "Generar Reporte"** → PDF completo del partido
- **Botón "Ver Mapa Calor"** → PNG visualización zonas
- **Botón "Exportar Datos"** → CSV para análisis
- **Vista previa** antes de descargar
- **Historial de descargas** por usuario

**✅ ENFOQUE SIMPLIFICADO: GENERAR + DESCARGAR + COMPARTIR MANUAL**

---

## 🎯 ACCIONES INMEDIATAS PARA DESARROLLO

### 1. Actualizar Base de Datos:
```sql
-- Agregar tabla action_types con datos específicos
INSERT INTO action_types (name, requires_player, requires_zone, icon, color) VALUES
('Gol', true, true, 'goal', '#00ff00'),
('Cambio', true, true, 'substitute', '#0099ff'),
('Tarjeta Verde', true, false, 'yellow-card', '#ffff00'),
('Tarjeta Amarilla', true, false, 'yellow-card', '#ff9900'),
('Tarjeta Roja', true, false, 'red-card', '#ff0000'),
('Recuperación Bocha', true, true, 'defense', '#00cc00'),
('Pérdida Bocha', true, true, 'attack', '#ff6600'),
('Corner', false, true, 'corner', '#9900ff');
```

### 2. Implementar Validaciones:
- Edad por división
- Límite equipos por plan
- Shootouts según división
- Zonas válidas por acción

### 3. Crear Componentes Frontend:
- Cancha interactiva con 4 zonas
- Selector área rival 3 sectores  
- Cronómetro 4 cuartos
- Export imagen formación

---

**✅ ESPECIFICACIONES COMPLETAS Y CONFIRMADAS**
**📋 LISTO PARA IMPLEMENTACIÓN TÉCNICA DETALLADA**
