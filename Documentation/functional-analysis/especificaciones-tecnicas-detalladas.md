# 📋 ESPECIFICACIONES TÉCNICAS DETALLADAS
## Basadas en "Dudas críticas para el desarrollo.pdf"

**Fecha:** 22 de agosto de 2025  
**Fuente:** PDF proporcionado por el cliente  
**Estado:** Especificaciones finales confirmadas

---

## 🗺️ DEFINICIÓN EXACTA DE ZONAS DE CANCHA

### Cancha de Hockey - División por Zonas
Según el PDF actualizado, la cancha se divide en **12 zonas principales** para el registro de acciones:

```
                    ARCO RIVAL
    ┌────────────────────────────┐
    │        |         |         |
    │ Zona 10│ Zona 11 │ Zona 12 │
    │        |         |         |
    │        |         |         |
    ├────────|─────────|─────────|
    │        |         |         |
    │ Zona 7 │ Zona 8  │ Zona 9  │
    │        |         |         |
    │        |         |         |
    ├────────|─────────|─────────|
    │        |         |         |
    │ Zona 4 │ Zona 5  │ Zona 6  │
    │        |         |         |
    │        |         |         |
    ├────────|─────────|─────────|
    │        |         |         |
    │ Zona 1 │ Zona 2  │ Zona 3  │
    │        |         |         |
    │        |         |         |
    └────────────────────────────┘
                   ARCO PROPIO
```

### Área Rival - División por Sectores
El área rival (donde se pueden anotar goles) se divide en **3 sectores**:

```
              ARCO RIVAL
    ┌───────────────────────────┐
    │ IZQUIERDA│CENTRAL│DERECHA │
    │    (1)   │  (2)  │   (3)  │
    └───────────────────────────┘
```

### Coordenadas Técnicas para Desarrollo:
```typescript
// Definición de zonas para base de datos - 12 zonas actualizadas
export enum CanchZone {
  ZONA_1 = 'zona_1',   // Defensivo Izquierdo
  ZONA_2 = 'zona_2',   // Defensivo Centro
  ZONA_3 = 'zona_3',   // Defensivo Derecho
  ZONA_4 = 'zona_4',   // Medio Defensivo Izquierdo
  ZONA_5 = 'zona_5',   // Medio Defensivo Centro
  ZONA_6 = 'zona_6',   // Medio Defensivo Derecho
  ZONA_7 = 'zona_7',   // Medio Ofensivo Izquierdo
  ZONA_8 = 'zona_8',   // Medio Ofensivo Centro
  ZONA_9 = 'zona_9',   // Medio Ofensivo Derecho
  ZONA_10 = 'zona_10', // Ofensivo Izquierdo
  ZONA_11 = 'zona_11', // Ofensivo Centro
  ZONA_12 = 'zona_12', // Ofensivo Derecho
}

export enum AreaRivalSector {
  IZQUIERDA = 'area_left',
  CENTRAL = 'area_central', 
  DERECHA = 'area_right'
}
```

---

## 🎯 TIPOS DE ACCIONES DE PARTIDO

### Parametrización de Acciones (SECUENCIA):
## Las acciones deben registra:
## 1°. Zona que ocurrio la accion (salvo el caso que sea un cambio de jugadora que no requiere zona), si es una acción "Ingreso al Area" la zona son los sectores del área rival al definidas en los esquemas sino se las zonas estipuladas de la cancha.
## 2°. Acción: ID de la accion que ya se encuentra previamente cargada.
## 3°. Jugadora que realizo la accion: Debe poder elegirse rapidamente.
## 4°- Tiempo: Minutos transcurrido del partido.

#### Por ejemplo:

### ACCIONES QUE SE EJECUTAN EN LA ZONA DE AREA

#### 1. **Goles**
- **Parámetros:** Zona del area, Jugadora que anota, tiempo exacto
- **Zona requerida:** Solo sectores del área rival (1/2/3)
- **Registro:** Automático suma al marcador

#### 2. **Corners **
- **Parámetros:** Zona del area, Jugadora que lo consiguió, tiempo de la acción
- **Registro:** Para análisis táctico

#### 3. Ingreso al área  
- **Parámetros:** Zona del area, Jugador que ingresa, tiempo de la acción

## En esta 3 acciones tengo que poder identificar si toco zonas del area rival son acciones ofensivas, si toco el area nuestra son accones defensivas, quiere decir que el gol es del equipo contrario, que el corner es en defensa, y el ingreso son los que nos hizo el otro equipo, aqui como no tengo jugaora rival en el campo jugador se registra el nombre del otro equipo automaticamente ya que tengo con anterioridad contra quien jugamos el partido.

### ACCIONES QUE SE EJECUTAN EN LA ZONA DE CANCHA
#### 1. **Cambios de Jugadoras**
- **Parámetros:** Jugadora que sale, jugadora que entra
- **Control tiempo:** Automático cálculo tiempo que va jugando cada jugadora
- **Validación:** Jugadora fuera no puede realizar acciones por lo que no puede aparecer.

#### 2. **Tarjetas**
- **Tipos:** Tarjeta Verde (2 min), Tarjeta Amarilla (5 min), Tarjeta Roja (partido completo)
- **Parámetros:** Jugadora sancionada, tiempo de sanción
- **Control:** Automático manejo de entrada/salida por sanción

#### 3. **Infracciones**
- **Parámetros:** Zona de la cancha que se comete, jugadora que comete la infracción, 
- **Control:** 

#### 4. **Recuperación de Bochas**
- **Parámetros:** Zona dela cancha que recupera, Jugadora que recupera
- **Estadística:** Cuenta para mapas de calor defensivos

#### 5. **Pérdida de Bochas**
- **Parámetros:** Zona de la cancha que se pierde la bocha, Jugadora que pierde las bochas 
- **Estadística:** Análisis de puntos débiles

## El sistema debe permitri al administrador cargar acciones todas con la misma estructura salvo diferenciadno si la zona que se utilizaran para realizar la acción, si zona de cancha (12 cuadrantes) o la Zona de area (3 zonas)

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
#### Formacion: 1 (Arquero) - 4 (Defensores) - 3 (Mediocampistas)  - 3 (delanteros)
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
- **Primera masculino:** 





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
- Zonas 1-12 con intensidad de color
- Verde: Muchas recuperaciones
- Amarillo: Pocas recuperaciones  
- Rojo: Sin recuperaciones

#### 2. **Mapa de Pérdida de Bochas**
- Zonas 1-12 con intensidad de color
- Rojo: Muchas pérdidas (problemático)
- Amarillo: Pocas pérdidas
- Verde: Sin pérdidas (ideal)

#### 3. **Mapa de Infracciones**
- Zonas 1-12 con cantidad de infracciones
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

---

## 🏑 GESTIÓN DE FORMACIONES - PROCESO COMPLETO

### Flujo de Trabajo del Entrenador

#### 1. **Selección de Equipo**
- El entrenador debe elegir primero el equipo para el cual va a armar la formación
- Se cargan automáticamente todos los jugadores disponibles de ese equipo
- Los jugadores aparecen en la lista lateral para ser seleccionados

#### 2. **Información del Partido**
El entrenador debe completar los siguientes campos obligatorios:
- **Equipo Adversario**: Nombre del equipo rival
- **Lugar del Partido**: Ubicación donde se jugará
- **Fecha del Partido**: Día del encuentro
- **Hora del Partido**: Horario de inicio del juego
- **Hora de Presentación**: Horario que deben llegar los jugadores

#### 3. **Selección de Formación Táctica**
Elegir entre las formaciones disponibles:
- **1-4-3-3**: 1 Arquera, 4 Defensoras, 3 Mediocampistas, 3 Delanteras
- **1-3-4-3**: 1 Arquera, 3 Defensoras, 4 Mediocampistas, 3 Delanteras  
- **1-4-4-2**: 1 Arquera, 4 Defensoras, 4 Mediocampistas, 2 Delanteras

#### 4. **Asignación de Jugadoras por Posición**
- **Proceso**: Hacer clic en una posición del campo → Elegir jugadora de la lista
- **Sistema de Imágenes** (en orden de prioridad):
  1. **Imagen de la Jugadora** (si está cargada)
  2. **Imagen del Equipo** (camiseta con overlay de nickname + nro jersey)
  3. **Imagen Genérica** (avatar default con overlay de nickname + nro jersey)
- **Información Mostrada**: Siempre acompañado de Nickname y Número de Jersey

#### 5. **Convocatorias Inter-Divisiones**
- Opción para elegir jugadoras de otros equipos/divisiones
- Funcionalidad para convocar refuerzos según necesidades del partido
- Mantener el mismo sistema de imágenes y información

#### 6. **Deshabilitación Automática de Jugadoras Asignadas**
- **Funcionalidad**: Cuando una jugadora es asignada a una posición titular o suplente, automáticamente se deshabilita en la lista de jugadoras disponibles
- **Objetivo**: Evitar duplicaciones y agilizar el proceso de armado de formaciones
- **Comportamiento**:
  - Jugadora asignada como titular → No aparece en lista disponible
  - Jugadora asignada como suplente → No aparece en lista disponible  
  - Al remover jugadora de posición/suplencia → Vuelve a aparecer en lista disponible
- **Visual**: Lista se actualiza dinámicamente sin jugadoras ya utilizadas
- **Beneficio**: El entrenador ve solo opciones válidas, haciendo más eficiente la selección

### Formaciones Tácticas Implementadas

#### Formación 1-4-3-3
```
           FW    FW    FW
              MF    MF    MF
        DF        DF        DF        DF
                      GK
```

#### Formación 1-3-4-3  
```
           FW    FW    FW
        MF     MF     MF     MF
           DF     DF     DF
                  GK
```

#### Formación 1-4-4-2
```
              FW         FW
        MF     MF     MF     MF
        DF        DF        DF        DF
                      GK
```

### Sistema de Imágenes de Jugadoras

#### Niveles de Fallback (3 niveles):
1. **Foto Personal** → Usar imagen específica de la jugadora
2. **Camiseta del Equipo** → Camiseta + overlay (nickname + número)
3. **Imagen Default** → Avatar genérico + overlay (nickname + número)

#### Overlay de Información:
- **Nickname** de la jugadora
- **Número de Jersey** asignado
- **Bordes con colores** del equipo

---

**✅ ESPECIFICACIONES COMPLETAS Y CONFIRMADAS**
**📋 LISTO PARA IMPLEMENTACIÓN TÉCNICA DETALLADA**
