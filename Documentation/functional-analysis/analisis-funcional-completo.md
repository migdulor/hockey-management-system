# ANÁLISIS FUNCIONAL REFINADO
## Sistema de Gestión de Jugadores de Hockey

**Fecha:** 22 de agosto de 2025  
**Versión:** 2.0

---

## 1. CONTEXTO Y ALCANCE

### 1.1 Problemática Identificada
Se requiere desarrollar un sistema integral para la gestión de equipos de hockey que permita a entrenadores de diferentes clubes administrar sus equipos, registrar asistencias, planificar formaciones, gestionar estadísticas de partidos y generar reportes analíticos con capacidades offline durante los partidos.

### 1.2 Objetivos del Sistema
- Facilitar la gestión administrativa de equipos de hockey
- Digitalizar el registro de asistencias a entrenamientos
- Proporcionar herramientas visuales para la planificación de formaciones
- Registrar estadísticas detalladas durante los partidos (modo offline)
- Generar reportes analíticos y mapas de calor para la toma de decisiones

### 1.3 Actores Principales

#### Administrador del Sistema
Usuario único (migdulor@hotmail.com) que gestiona usuarios entrenadores y configura acciones del sistema

#### Entrenador
Gestiona múltiples equipos (según plan: 2, 3 o 5 equipos por temporada), jugadoras, asistencias, formaciones y estadísticas de partidos

#### Jugadora/Jugador
Entidad gestionada por el entrenador (rol pasivo en el sistema, puede estar en hasta 2 divisiones del mismo club)

### 1.4 Planes de Usuario
- **Plan 2 Equipos:** Entrenador puede gestionar hasta 2 equipos por temporada
- **Plan 3 Equipos:** Entrenador puede gestionar hasta 3 equipos por temporada  
- **Plan 5 Equipos:** Entrenador puede gestionar hasta 5 equipos por temporada

---

## 2. MÓDULOS FUNCIONALES

### 2.1 Módulo de Autenticación y Autorización

#### US001 - Función: Gestión de usuarios entrenadores
**Como** administrador del sistema,  
**Quiero** dar de alta, modificar y gestionar usuarios entrenadores,  
**Para** que cada entrenador pueda acceder al sistema y gestionar sus equipos de forma independiente.

**Detalle:** El administrador debe poder crear cuentas para entrenadores de diferentes clubes, asignándoles credenciales de acceso y permisos específicos para gestionar únicamente sus equipos.

**Criterios de aceptación:**
1. Dado que soy administrador autenticado, cuando accedo al módulo de gestión de usuarios, entonces puedo ver una lista de todos los entrenadores registrados y opciones para crear, editar o desactivar usuarios.
2. Dado que estoy creando un nuevo usuario entrenador, cuando completo los campos obligatorios, entonces el sistema crea la cuenta y envía credenciales de acceso al entrenador.
3. Dado que un entrenador está registrado, cuando se autentica en el sistema, entonces solo puede acceder a la gestión de sus propios equipos y jugadoras.

#### US002 - Función: Configuración de acciones de partido
**Como** administrador del sistema,  
**Quiero** configurar las acciones que se pueden registrar durante los partidos,  
**Para** que los entrenadores puedan registrar estadísticas específicas según las reglas del hockey.

**Detalle:** El administrador debe poder definir tipos de acciones (goles, Ingreso a cancha, Salida de cancha, tarjetas, falta cometida, falta recibida, ingresos al área, Recuperación de bocha, etc.) con sus parámetros específicos (jugadoras involucradas, tiempos, ubicaciones en cancha).

**Criterios de aceptación:**
1. Dado que soy administrador, cuando accedo a la configuración de acciones, entonces puedo ver todas las acciones disponibles y crear nuevas acciones personalizadas.
2. Dado que estoy creando una acción, cuando defino nombre, tipo de jugadoras involucradas y parámetros, entonces la acción queda disponible para todos los entrenadores.
3. Dado que una acción está configurada, cuando un entrenador registra un partido, entonces puede utilizar todas las acciones definidas por el administrador.

### 2.2 Módulo de Gestión de Equipos y Jugadoras

#### US003 - Función: Gestión de equipos
**Como** entrenador,  
**Quiero** crear y gestionar múltiples equipos con sus respectivas jugadoras/jugadores,  
**Para** organizar mis planteles según divisiones de edad y categoría dentro de los límites de mi plan.

**Detalle:** El entrenador debe poder crear equipos según lo parametrizado para su usuario, definir divisiones por edad (Sub 14, Sub 16, Sub 19, Inter, Primera, etc.) tanto femeninas como masculinas, y gestionar hasta 20 jugadoras en la formación de los equipo (11 titulares + 9 suplentes).

**Criterios de aceptación:**
1. Dado que soy entrenador autenticado, cuando accedo al módulo de equipos, entonces puedo crear nuevos equipos hasta el límite establecido para mi usuario
2. Dado que estoy creando un equipo, cuando selecciono división y categoría, entonces puedo agregar jugadoras de esa división y también de divisiones inferiores.
3. Dado que tengo un equipo creado, cuando agrego jugadoras, entonces el sistema me permite hasta 20 jugadoras por equipo y valida que no excedan 2 divisiones del mismo club por jugadora.

#### US004 - Función: Carga de fotos de jugadoras
**Como** entrenador,  
**Quiero** subir fotos de las jugadoras con sus camisetas,  
**Para** facilitar la identificación visual durante la planificación de formaciones.

**Detalle:** El sistema debe permitir cargar imágenes de las jugadoras y mostrarlas en las interfaces de gestión y formaciones.

**Criterios de aceptación:**
1. Dado que estoy editando una jugadora, cuando selecciono la opción de foto, entonces puedo subir una imagen desde mi dispositivo.
2. Dado que una jugadora tiene foto asignada, cuando visualizo formaciones, entonces veo la foto junto al nombre en la posición asignada.
3. Dado que cargo una foto, cuando excede el tamaño permitido, entonces el sistema la redimensiona automáticamente manteniendo la calidad.

### 2.3 Módulo de Gestión de Asistencias

#### US005 - Función: Registro de asistencias a entrenamientos
**Como** entrenador,  
**Quiero** registrar la asistencia de mis jugadoras a los entrenamientos,  
**Para** llevar un control detallado de la participación y puntualidad del equipo.

**Detalle:** El entrenador debe poder seleccionar fecha, marcar asistencia/ausencia de cada jugadora y registrar observaciones adicionales.

**Criterios de aceptación:**
1. Dado que soy entrenador, cuando accedo al registro de asistencias, entonces puedo seleccionar fecha y equipo para registrar la asistencia.
2. Dado que tengo un entrenamiento seleccionado, cuando marco las asistencias, entonces puedo registrar estados como "Presente", "Tarde" o "Ausente" para cada jugadora.
3. Dado que registro asistencias, cuando guardo los cambios, entonces el sistema almacena la información y la incluye en reportes de participación.

### 2.4 Módulo de Gestión de Formaciones

#### US006 - Función: Planificación visual de formaciones
**Como** entrenador,  
**Quiero** crear formaciones de partido de manera visual arrastrando jugadoras a posiciones en la cancha,  
**Para** planificar la estrategia táctica y comunicar las posiciones a las jugadoras.

**Detalle:** El sistema debe proporcionar una representación gráfica de la cancha de hockey con posiciones predefinidas (Arqueras, Defensoras, Volantes, Delanteras) donde el entrenador puede arrastrar y soltar jugadoras, guardar formaciones como plantillas reutilizables.

**Criterios de aceptación:**
1. Dado que soy entrenador, cuando accedo a formaciones, entonces veo una cancha visual donde puedo arrastrar jugadoras desde el listado a las posiciones.
2. Dado que estoy armando una formación, cuando selecciono 11 titulares, entonces puedo definir hasta 9 suplentes adicionales.
3. Dado que tengo una formación completa, cuando la guardo, entonces puedo reutilizarla como plantilla para futuros partidos.

#### US007 - Función: Información del partido en formación
**Como** entrenador,  
**Quiero** registrar los detalles del partido junto con la formación,  
**Para** tener toda la información contextual del encuentro organizada.

**Detalle:** El entrenador debe poder especificar equipo rival, cancha, fecha, hora de presentación y hora del partido, junto con la formación definida.

**Criterios de aceptación:**
1. Dado que estoy creando una formación, cuando completo los datos del partido, entonces puedo definir rival, lugar, fecha, horario de presentación y horario de partido.
2. Dado que tengo un partido anterior, cuando creo una nueva formación, entonces puedo copiar la formación anterior y modificar solo los datos del nuevo partido.
3. Dado que tengo una formación lista, cuando la finalizo, entonces queda disponible para usar durante el registro de acciones del partido.

### 2.5 Módulo de Gestión de Partidos (Tiempo Real + Offline)

#### US008 - Función: Exportación de formaciones
**Como** entrenador,  
**Quiero** exportar la formación como imagen,  
**Para** compartirla con las jugadoras a través de medios digitales.

**Detalle:** El sistema debe generar una imagen clara y legible de la formación con fotos de jugadoras, datos del partido y información del club para descarga o impresión.

**Criterios de aceptación:**
1. Dado que tengo una formación completa, cuando selecciono exportar, entonces el sistema genera una imagen con la formación táctica y datos del partido.
2. Dado que exporto una formación, cuando la imagen se genera, entonces incluye fotos de las jugadoras, nombres, posiciones y datos del encuentro.
3. Dado que tengo la imagen generada, cuando la descargo, entonces puedo guardarla localmente o imprimirla para distribución manual.

#### US009 - Función: Inicialización de partido
**Como** entrenador,  
**Quiero** iniciar un partido basado en una formación previa,  
**Para** comenzar el registro de acciones en tiempo real con capacidad offline.

**Detalle:** El entrenador debe poder seleccionar una formación existente e iniciar el modo partido, que habilita el registro offline de todas las acciones durante los 4 cuartos del juego.

**Criterios de aceptación:**
1. Dado que tengo formaciones guardadas, cuando selecciono iniciar partido, entonces el sistema carga la formación y habilita el modo offline.
2. Dado que estoy en modo partido, cuando pierdo conexión a internet, entonces puedo seguir registrando acciones normalmente.
3. Dado que finalizo los 4 cuartos, cuando termina el partido, entonces el sistema sincroniza automáticamente todas las acciones registradas.

#### US010 - Función: Control de tiempos de partido
**Como** entrenador,  
**Quiero** controlar los tiempos de cada cuarto del partido,  
**Para** registrar con precisión los momentos en que ocurren las acciones durante el juego.

**Detalle:** El sistema debe permitir pausar y reanudar el cronómetro de cada cuarto (15, 30, 45 y 60 minutos), y registrar automáticamente el tiempo en que se producen las acciones.

**Criterios de aceptación:**
1. Dado que el partido está en curso, cuando inicio un cuarto, entonces el cronómetro comienza y registra el tiempo actual para cada acción.
2. Dado que necesito pausar, cuando detengo el tiempo, entonces todas las acciones posteriores mantienen el tiempo de pausa hasta reanudar.
3. Dado que completo los 60 minutos de juego, cuando finaliza el cuarto período, entonces el sistema permite guardar el partido completo.

#### US011 - Función: Registro de cambios de jugadoras
**Como** entrenador,  
**Quiero** registrar los cambios entre jugadores durante el partido,  
**Para** llevar control del tiempo de juego de cada jugadora y las sustituciones realizadas.

**Detalle:** El entrenador debe poder registrar qué jugadora sale, cuál entra, y el momento exacto del cambio, con cálculo automático de tiempo total jugado de cada jugadora.

**Criterios de aceptación:**
1. Dado que el partido está activo, cuando registro un cambio, entonces selecciono la jugadora que sale y la que entra con la zona donde se produce.
2. Dado que registro un cambio, cuando confirmo la acción, entonces el sistema calcula automáticamente el tiempo jugado por cada jugadora.
Y empieza restira el tiempo de la jugadora que entro para control el tiempo si sale nuevamente.
3. Dado que se realiza un cambio, cuando una jugadora está fuera de cancha, entonces no aparece disponible para nuevas acciones hasta que reingrese.
Y la jugadora que entro aparece disponible para nuevas acciones.

#### US012 - Función: Registro de acciones de partido
**Como** entrenador,  
**Quiero** registrar acciones específicas durante el partido (goles, tarjetas, faltas, etc.),  
**Para** generar estadísticas detalladas y análisis posterior del rendimiento del equipo.

**Detalle:** El entrenador debe poder seleccionar el tipo de acción, la jugadora involucrada, el tiempo exacto y la zona de la cancha donde ocurrió, según las acciones configuradas por el administrador.

**Criterios de aceptación:**
1. Dado que estoy registrando acciones, cuando selecciono una acción, entonces puedo elegir la jugadora involucrada y la zona donde ocurrió.
2. Dado que registro una acción, cuando la confirmo, entonces queda asociada al tiempo actual del cronómetro y a la jugadora seleccionada.
3. Dado que una jugadora recibe tarjeta, cuando registro la sanción, entonces el sistema permite registrar tiempo de salida y entrada de la jugadora.
4. Dado que una jugadora recibe más de una tarjeta, cuando registro la sanción con más de una tarjeta, entonces el sistema permite registrar el tiempo d ambas tarjetas y la entrada de la jugadora nuevamente.

### 2.6 Módulo de Reportes y Estadísticas

#### US013 - Función: Generación de mapas de calor tácticos
**Como** entrenador,  
**Quiero** visualizar mapas de calor de las acciones de juego en la cancha,  
**Para** analizar patrones tácticos y tomar decisiones estratégicas basadas en datos.

**Detalle:** El sistema debe generar mapas de calor que muestren:
- **Cancha dividida en 8 zonas:** Zona 1 (defensivo izquierdo), Zona 2 (defensiva derecha), Zona 3 (media izquierda), Zona 4 (media defensiva derecha), Zona 5 (media ofensiva izquierda) Zona 6 (media ofensiva derecha) , Zona 7 (Ataque izquierda), Zona 8 (Ataque Derecha)
- **Área rival dividida en 3 sectores:** Central, Derecha, Izquierda
- **Intensidad por tipo de acción:** Recuperación de bochas, Pérdida de bochas, Infracciones cometidas, Ataques

**Criterios de aceptación:**
1. Dado que tengo partidos con acciones registradas, cuando genero un mapa de calor, entonces veo la cancha dividida en 8 zonas con intensidad de color según la frecuencia de acciones.
2. Dado que visualizo el mapa, cuando selecciono el área rival, entonces veo los 3 sectores (central, derecha, izquierda) con los ingresos al área registrados.
3. Dado que analizo estadísticas, cuando filtro por tipo de acción, entonces el mapa muestra solo las zonas donde se concentran recuperaciones, pérdidas, infracciones y/o ataques.

#### US014 - Función: Estadísticas de partido
**Como** entrenador,  
**Quiero** generar reportes completos de estadísticas de partido,  
**Para** analizar el rendimiento individual y colectivo del equipo.

**Detalle:** El sistema debe proporcionar estadísticas detalladas como tiempo jugado por jugadora, acciones realizadas, zonas de mayor actividad, y comparaciones entre partidos.

**Criterios de aceptación:**
1. Dado que finalizo un partido, cuando genero el reporte, entonces veo estadísticas completas de tiempo jugado, acciones por jugadora y rendimiento general.
2. Dado que consulto estadísticas, cuando comparo entre partidos, entonces puedo ver la evolución del rendimiento individual y del equipo.
3. Dado que necesito exportar datos, cuando selecciono exportar, entonces el sistema genera un PDF con todas las métricas del partido.

### 2.6 Módulo de Reportes y Estadísticas

#### US017 - Función: Cierre y migración de temporadas
**Como** entrenador,  
**Quiero** cerrar una temporada y migrar datos manualmente a una nueva temporada,  
**Para** mantener el historial de rendimiento y reorganizar los equipos para el nuevo período.

**Detalle:** El entrenador debe poder exportar resúmenes de temporada, archivar datos históricos y crear nuevos equipos para la temporada siguiente, reasignando jugadoras según sea necesario.

**Criterios de aceptación:**
1. Dado que finaliza una temporada, cuando selecciono cerrar temporada, entonces puedo exportar un resumen completo con todas las estadísticas del período.
2. Dado que inicio nueva temporada, cuando creo nuevos equipos, entonces puedo reasignar jugadoras de la temporada anterior o agregar nuevas jugadoras.
3. Dado que migro temporadas, cuando reasigno jugadoras, entonces mantengo el historial individual pero inicio estadísticas de equipo desde cero.

---

## 3. OBSERVACIONES Y PRÓXIMOS PASOS

### 3.1 Cambios de Alcance
- **Sistema de reportes simplificado:** Se eliminó la integración automática con WhatsApp Business
- **Enfoque de descarga manual:** El sistema genera reportes e imágenes para descarga, y el entrenador los comparte manualmente
- **Formatos optimizados:** PNG para formaciones (1080x1350px), PDF para reportes, CSV/JSON para datos

### 3.2 Funcionalidades Adicionales Sugeridas
- **Backup automático:** Dado el trabajo offline, considerar backups automáticos locales
- **Multi-idioma:** Para expansión a otros países con hockey
- **Integración con calendarios:** Para sincronizar fechas de partidos y entrenamientos

### 3.3 Consideraciones Técnicas Críticas
- **Arquitectura offline-first:** Priorizar capacidades offline robustas
- **Sincronización inteligente:** Manejar conflictos cuando múltiples entrenadores editan simultáneamente
- **Performance en dispositivos móviles:** Optimizar para tablets y smartphones con recursos limitados