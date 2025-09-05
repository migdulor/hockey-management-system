// Datos de ejemplo para pruebas del sistema de mapas de calor con 12 zonas

export const sampleHeatmapData = {
    // Datos de ejemplo para mapa de recuperación de bochas
    recoveryData: [
        { zone_number: 1, action_count: 5, total_actions: 25 },
        { zone_number: 2, action_count: 8, total_actions: 25 },
        { zone_number: 3, action_count: 3, total_actions: 25 },
        { zone_number: 4, action_count: 12, total_actions: 25 },
        { zone_number: 5, action_count: 15, total_actions: 25 },
        { zone_number: 6, action_count: 7, total_actions: 25 },
        { zone_number: 7, action_count: 4, total_actions: 25 },
        { zone_number: 8, action_count: 9, total_actions: 25 },
        { zone_number: 9, action_count: 2, total_actions: 25 },
        { zone_number: 10, action_count: 6, total_actions: 25 },
        { zone_number: 11, action_count: 11, total_actions: 25 },
        { zone_number: 12, action_count: 8, total_actions: 25 }
    ],
    
    // Datos de ejemplo para mapa de pérdida de bochas
    lossData: [
        { zone_number: 1, action_count: 2, total_actions: 18 },
        { zone_number: 2, action_count: 1, total_actions: 18 },
        { zone_number: 3, action_count: 4, total_actions: 18 },
        { zone_number: 4, action_count: 3, total_actions: 18 },
        { zone_number: 5, action_count: 2, total_actions: 18 },
        { zone_number: 6, action_count: 6, total_actions: 18 },
        { zone_number: 7, action_count: 8, total_actions: 18 },
        { zone_number: 8, action_count: 3, total_actions: 18 },
        { zone_number: 9, action_count: 7, total_actions: 18 },
        { zone_number: 10, action_count: 1, total_actions: 18 },
        { zone_number: 11, action_count: 2, total_actions: 18 },
        { zone_number: 12, action_count: 5, total_actions: 18 }
    ],
    
    // Datos de ejemplo para mapa general
    generalData: [
        { zone_number: 1, action_count: 15, total_actions: 120 },
        { zone_number: 2, action_count: 18, total_actions: 120 },
        { zone_number: 3, action_count: 8, total_actions: 120 },
        { zone_number: 4, action_count: 22, total_actions: 120 },
        { zone_number: 5, action_count: 25, total_actions: 120 },
        { zone_number: 6, action_count: 12, total_actions: 120 },
        { zone_number: 7, action_count: 16, total_actions: 120 },
        { zone_number: 8, action_count: 19, total_actions: 120 },
        { zone_number: 9, action_count: 9, total_actions: 120 },
        { zone_number: 10, action_count: 11, total_actions: 120 },
        { zone_number: 11, action_count: 21, total_actions: 120 },
        { zone_number: 12, action_count: 14, total_actions: 120 }
    ]
};

// Función para simular carga de datos de la API
export function loadSampleData(type = 'general') {
    return new Promise((resolve) => {
        setTimeout(() => {
            switch(type) {
                case 'Recuperación Bocha':
                    resolve(sampleHeatmapData.recoveryData);
                    break;
                case 'Pérdida Bocha':
                    resolve(sampleHeatmapData.lossData);
                    break;
                default:
                    resolve(sampleHeatmapData.generalData);
            }
        }, 500); // Simular delay de red
    });
}

// Función para validar estructura de datos
export function validateHeatmapData(data) {
    if (!Array.isArray(data)) {
        throw new Error('Los datos deben ser un array');
    }
    
    const requiredFields = ['zone_number', 'action_count'];
    
    data.forEach((item, index) => {
        requiredFields.forEach(field => {
            if (!(field in item)) {
                throw new Error(`Campo requerido '${field}' faltante en el elemento ${index}`);
            }
        });
        
        const zoneNumber = parseInt(item.zone_number);
        if (zoneNumber < 1 || zoneNumber > 12) {
            throw new Error(`Número de zona inválido: ${zoneNumber}. Debe estar entre 1 y 12`);
        }
    });
    
    return true;
}

// Función para normalizar datos de intensidad
export function normalizeIntensityData(data) {
    if (!data || data.length === 0) return [];
    
    const maxCount = Math.max(...data.map(item => parseInt(item.action_count) || 0));
    
    return data.map(item => ({
        ...item,
        intensity: maxCount > 0 ? (parseInt(item.action_count) || 0) / maxCount : 0
    }));
}

// Función para generar colores basados en intensidad
export function getIntensityColor(intensity, actionType = 'general') {
    // Asegurar que intensity esté entre 0 y 1
    intensity = Math.max(0, Math.min(1, intensity));
    
    let baseColor;
    switch(actionType) {
        case 'Recuperación Bocha':
            // Verde para recuperaciones (positivo)
            baseColor = { r: 0, g: 200, b: 100 };
            break;
        case 'Pérdida Bocha':
            // Rojo para pérdidas (negativo)
            baseColor = { r: 255, g: 50, b: 50 };
            break;
        default:
            // Azul para general
            baseColor = { r: 50, g: 150, b: 255 };
    }
    
    // Calcular alpha basado en intensidad
    const alpha = 0.3 + (intensity * 0.6); // Entre 0.3 y 0.9
    
    return `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${alpha})`;
}

// Función para generar estadísticas resumidas
export function generateSummaryStats(data) {
    if (!data || data.length === 0) {
        return {
            totalActions: 0,
            averagePerZone: 0,
            mostActiveZone: null,
            leastActiveZone: null,
            zoneDistribution: []
        };
    }
    
    const totalActions = data.reduce((sum, item) => sum + (parseInt(item.action_count) || 0), 0);
    const averagePerZone = totalActions / data.length;
    
    const sortedByCount = [...data].sort((a, b) => 
        (parseInt(b.action_count) || 0) - (parseInt(a.action_count) || 0)
    );
    
    return {
        totalActions,
        averagePerZone: Math.round(averagePerZone * 10) / 10,
        mostActiveZone: sortedByCount[0],
        leastActiveZone: sortedByCount[sortedByCount.length - 1],
        zoneDistribution: data.map(item => ({
            zone: parseInt(item.zone_number),
            count: parseInt(item.action_count) || 0,
            percentage: totalActions > 0 ? Math.round(((parseInt(item.action_count) || 0) / totalActions) * 100) : 0
        }))
    };
}
